import express from "express";
import prisma from "../db.js";
import { requireAuth } from "../auth.js";

const router = express.Router();

// Get all available rewards
router.get("/", requireAuth, async (req, res) => {
  try {
    const rewards = await prisma.reward.findMany({
      where: { active: true },
      orderBy: [{ rarity: "desc" }, { cost: "asc" }],
    });

    res.json(rewards);
  } catch (error) {
    console.error("Error fetching rewards:", error);
    res.status(500).json({ error: "Failed to fetch rewards" });
  }
});

// Purchase a reward
router.post("/:id/purchase", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const reward = await prisma.reward.findUnique({
      where: { id: parseInt(id) },
    });

    if (!reward) {
      return res.status(404).json({ error: "Reward not found" });
    }

    // Get user's current currency
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has enough currency
    let hasEnoughCurrency = false;
    switch (reward.costType) {
      case "coins":
        hasEnoughCurrency = user.coins >= reward.cost;
        break;
      case "stars":
        hasEnoughCurrency = user.stars >= reward.cost;
        break;
      case "gems":
        hasEnoughCurrency = user.gems >= reward.cost;
        break;
      default:
        return res.status(400).json({ error: "Invalid currency type" });
    }

    if (!hasEnoughCurrency) {
      return res.status(400).json({ error: "Not enough currency" });
    }

    // Check if user already owns this reward
    const existingInventory = await prisma.inventory.findFirst({
      where: {
        userId,
        rewardId: reward.id,
      },
    });

    if (existingInventory) {
      return res.status(400).json({ error: "You already own this reward" });
    }

    // Deduct currency
    const updateData = {};
    switch (reward.costType) {
      case "coins":
        updateData.coins = { decrement: reward.cost };
        break;
      case "stars":
        updateData.stars = { decrement: reward.cost };
        break;
      case "gems":
        updateData.gems = { decrement: reward.cost };
        break;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Add to inventory
    await prisma.inventory.create({
      data: {
        userId,
        rewardId: reward.id,
        equipped: false,
      },
    });

    res.json({
      success: true,
      message: "Reward purchased successfully!",
      reward,
    });
  } catch (error) {
    console.error("Error purchasing reward:", error);
    res.status(500).json({ error: "Failed to purchase reward" });
  }
});

// Get user's inventory
router.get("/inventory", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const inventory = await prisma.inventory.findMany({
      where: { userId },
      include: {
        reward: true,
        character: true,
      },
    });

    res.json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// Equip an item from inventory
router.post("/inventory/:id/equip", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const inventoryItem = await prisma.inventory.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
      include: { reward: true },
    });

    if (!inventoryItem) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    // Unequip other items of the same type
    if (inventoryItem.rewardId) {
      await prisma.inventory.updateMany({
        where: {
          userId,
          reward: {
            type: inventoryItem.reward.type,
          },
        },
        data: { equipped: false },
      });
    }

    // Equip the selected item
    await prisma.inventory.update({
      where: { id: inventoryItem.id },
      data: { equipped: true },
    });

    res.json({
      success: true,
      message: "Item equipped successfully!",
    });
  } catch (error) {
    console.error("Error equipping item:", error);
    res.status(500).json({ error: "Failed to equip item" });
  }
});

export default router;

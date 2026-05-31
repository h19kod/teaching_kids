import express from "express";
import prisma from "../db.js";
import { requireAuth } from "../auth.js";

const router = express.Router();

// Get all characters
router.get("/", requireAuth, async (req, res) => {
  try {
    const characters = await prisma.character.findMany({
      orderBy: [{ rarity: "desc" }, { cost: "asc" }],
    });

    res.json(characters);
  } catch (error) {
    console.error("Error fetching characters:", error);
    res.status(500).json({ error: "Failed to fetch characters" });
  }
});

// Select a character
router.post("/:id/select", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const character = await prisma.character.findUnique({
      where: { id: parseInt(id) },
    });

    if (!character) {
      return res.status(404).json({ error: "Character not found" });
    }

    // Check if user has unlocked the character (if it has an unlock requirement)
    if (character.unlockedBy) {
      const achievement = await prisma.achievement.findFirst({
        where: {
          userId,
          key: character.unlockedBy,
        },
      });

      if (!achievement) {
        return res.status(403).json({ error: "Character not unlocked. Complete the required achievement first." });
      }
    }

    // Check if user has enough gems (if character has a cost)
    if (character.cost > 0) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.gems < character.cost) {
        return res.status(400).json({ error: "Not enough gems to unlock this character" });
      }

      // Deduct gems
      await prisma.user.update({
        where: { id: userId },
        data: { gems: { decrement: character.cost } },
      });

      // Add to inventory
      await prisma.inventory.create({
        data: {
          userId,
          characterId: character.id,
          equipped: false,
        },
      });
    }

    // Set as selected character
    await prisma.user.update({
      where: { id: userId },
      data: { selectedCharacter: character.id },
    });

    res.json({
      success: true,
      message: "Character selected successfully!",
      character,
    });
  } catch (error) {
    console.error("Error selecting character:", error);
    res.status(500).json({ error: "Failed to select character" });
  }
});

// Get user's character inventory
router.get("/inventory", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const inventory = await prisma.inventory.findMany({
      where: { userId, characterId: { not: null } },
      include: {
        character: true,
      },
    });

    res.json(inventory);
  } catch (error) {
    console.error("Error fetching character inventory:", error);
    res.status(500).json({ error: "Failed to fetch character inventory" });
  }
});

export default router;

import express from "express";
import prisma from "../db.js";
import { requireAuth } from "../auth.js";

const router = express.Router();

// Get missions for the current user
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all active missions
    const allMissions = await prisma.mission.findMany({
      where: { active: true },
    });

    // Separate daily and weekly missions
    const dailyMissions = allMissions.filter((m) => m.type === "daily");
    const weeklyMissions = allMissions.filter((m) => m.type === "weekly");

    // Get user's mission progress
    const userMissions = await prisma.userMission.findMany({
      where: { userId },
      include: {
        mission: true,
      },
    });

    // Helper function to get or create user mission
    const getOrCreateUserMission = async (mission) => {
      let userMission = userMissions.find((um) => um.missionId === mission.id);
      
      if (!userMission) {
        const now = new Date();
        let endDate;
        
        if (mission.type === "daily") {
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
        } else {
          endDate = new Date(now);
          endDate.setDate(endDate.getDate() + 7);
        }

        userMission = await prisma.userMission.create({
          data: {
            userId,
            missionId: mission.id,
            startDate: now,
            endDate,
          },
          include: {
            mission: true,
          },
        });
      }

      return userMission;
    };

    // Process daily missions
    const dailyProcessed = await Promise.all(
      dailyMissions.map(async (mission) => {
        const userMission = await getOrCreateUserMission(mission);
        return {
          id: userMission.id,
          title: userMission.mission.title,
          description: userMission.mission.description,
          target: userMission.mission.target,
          progress: userMission.progress,
          completed: userMission.completed,
          claimed: userMission.claimed,
          xpReward: userMission.mission.xpReward,
          coinReward: userMission.mission.coinReward,
          starReward: userMission.mission.starReward,
          gemReward: userMission.mission.gemReward,
        };
      })
    );

    // Process weekly missions
    const weeklyProcessed = await Promise.all(
      weeklyMissions.map(async (mission) => {
        const userMission = await getOrCreateUserMission(mission);
        return {
          id: userMission.id,
          title: userMission.mission.title,
          description: userMission.mission.description,
          target: userMission.mission.target,
          progress: userMission.progress,
          completed: userMission.completed,
          claimed: userMission.claimed,
          xpReward: userMission.mission.xpReward,
          coinReward: userMission.mission.coinReward,
          starReward: userMission.mission.starReward,
          gemReward: userMission.mission.gemReward,
        };
      })
    );

    res.json({
      daily: dailyProcessed,
      weekly: weeklyProcessed,
    });
  } catch (error) {
    console.error("Error fetching missions:", error);
    res.status(500).json({ error: "Failed to fetch missions" });
  }
});

// Update mission progress
router.post("/update", requireAuth, async (req, res) => {
  try {
    const { missionId, progress } = req.body;
    const userId = req.user.id;

    const userMission = await prisma.userMission.findFirst({
      where: {
        userId,
        missionId,
      },
      include: {
        mission: true,
      },
    });

    if (!userMission) {
      return res.status(404).json({ error: "Mission not found" });
    }

    // Update progress
    const updatedProgress = Math.min(userMission.progress + progress, userMission.mission.target);
    const completed = updatedProgress >= userMission.mission.target;

    const updated = await prisma.userMission.update({
      where: { id: userMission.id },
      data: {
        progress: updatedProgress,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    // If completed, award rewards
    if (completed && !userMission.completed) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: userMission.mission.xpReward },
          coins: { increment: userMission.mission.coinReward },
          stars: { increment: userMission.mission.starReward },
          gems: { increment: userMission.mission.gemReward },
        },
      });
    }

    res.json({
      success: true,
      progress: updatedProgress,
      completed,
      rewards: completed ? {
        xp: userMission.mission.xpReward,
        coins: userMission.mission.coinReward,
        stars: userMission.mission.starReward,
        gems: userMission.mission.gemReward,
      } : null,
    });
  } catch (error) {
    console.error("Error updating mission:", error);
    res.status(500).json({ error: "Failed to update mission" });
  }
});

// Claim mission rewards
router.post("/claim/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const userMission = await prisma.userMission.findFirst({
      where: {
        id: parseInt(id),
        userId,
        completed: true,
        claimed: false,
      },
      include: {
        mission: true,
      },
    });

    if (!userMission) {
      return res.status(404).json({ error: "Mission not found or already claimed" });
    }

    // Mark as claimed
    await prisma.userMission.update({
      where: { id: userMission.id },
      data: { claimed: true },
    });

    res.json({
      success: true,
      message: "Rewards claimed successfully!",
    });
  } catch (error) {
    console.error("Error claiming rewards:", error);
    res.status(500).json({ error: "Failed to claim rewards" });
  }
});

export default router;

import express from "express";
import prisma from "../db.js";
import { requireAuth } from "../auth.js";

const router = express.Router();

// Get all story chapters
router.get("/chapters", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const chapters = await prisma.storyChapter.findMany({
      orderBy: [{ chapter: "asc" }],
    });

    // Get user's progress for each chapter
    const userProgress = await prisma.storyProgress.findMany({
      where: { userId },
    });

    // Add progress information to each chapter
    const chaptersWithProgress = chapters.map((chapter) => {
      const progress = userProgress.find((p) => p.chapterId === chapter.id);
      return {
        ...chapter,
        completed: progress ? progress.completed : false,
        completedAt: progress ? progress.completedAt : null,
        content: JSON.parse(chapter.content),
      };
    });

    res.json(chaptersWithProgress);
  } catch (error) {
    console.error("Error fetching story chapters:", error);
    res.status(500).json({ error: "Failed to fetch story chapters" });
  }
});

// Get a specific chapter
router.get("/chapters/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chapter = await prisma.storyChapter.findUnique({
      where: { id: parseInt(id) },
    });

    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    // Get user's progress for this chapter
    const progress = await prisma.storyProgress.findFirst({
      where: {
        userId,
        chapterId: chapter.id,
      },
    });

    res.json({
      ...chapter,
      completed: progress ? progress.completed : false,
      completedAt: progress ? progress.completedAt : null,
      content: JSON.parse(chapter.content),
    });
  } catch (error) {
    console.error("Error fetching chapter:", error);
    res.status(500).json({ error: "Failed to fetch chapter" });
  }
});

// Start a chapter
router.post("/chapters/:id/start", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chapter = await prisma.storyChapter.findUnique({
      where: { id: parseInt(id) },
    });

    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    // Check if user has required level
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.level < chapter.requiredLevel) {
      return res.status(403).json({ error: "Level requirement not met" });
    }

    // Create or update progress
    const existingProgress = await prisma.storyProgress.findFirst({
      where: {
        userId,
        chapterId: chapter.id,
      },
    });

    if (!existingProgress) {
      await prisma.storyProgress.create({
        data: {
          userId,
          chapterId: chapter.id,
          completed: false,
          startedAt: new Date(),
        },
      });
    }

    res.json({
      success: true,
      message: "Chapter started!",
      chapter: {
        ...chapter,
        content: JSON.parse(chapter.content),
      },
    });
  } catch (error) {
    console.error("Error starting chapter:", error);
    res.status(500).json({ error: "Failed to start chapter" });
  }
});

// Complete a chapter
router.post("/chapters/:id/complete", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chapter = await prisma.storyChapter.findUnique({
      where: { id: parseInt(id) },
    });

    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    // Update progress
    const progress = await prisma.storyProgress.updateMany({
      where: {
        userId,
        chapterId: chapter.id,
      },
      data: {
        completed: true,
        completedAt: new Date(),
      },
    });

    // Award rewards
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: chapter.xpReward },
        coins: { increment: chapter.coinReward },
      },
    });

    res.json({
      success: true,
      message: "Chapter completed!",
      rewards: {
        xp: chapter.xpReward,
        coins: chapter.coinReward,
      },
    });
  } catch (error) {
    console.error("Error completing chapter:", error);
    res.status(500).json({ error: "Failed to complete chapter" });
  }
});

export default router;

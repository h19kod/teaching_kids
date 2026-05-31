import express from "express";
import prisma from "../db.js";
import { requireAuth } from "../auth.js";

const router = express.Router();

// Get adaptive learning recommendations for the current user
router.get("/recommendations", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's progress data
    const progressData = await prisma.progress.findMany({
      where: { userId },
      include: {
        game: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
      take: 50,
    });

    // Calculate performance metrics
    const subjectPerformance = {};
    progressData.forEach((p) => {
      const subjectName = p.game.subject.name;
      if (!subjectPerformance[subjectName]) {
        subjectPerformance[subjectName] = { totalScore: 0, gamesPlayed: 0 };
      }
      subjectPerformance[subjectName].totalScore += p.score;
      subjectPerformance[subjectName].gamesPlayed += 1;
    });

    // Calculate average scores per subject
    Object.keys(subjectPerformance).forEach((subject) => {
      const data = subjectPerformance[subject];
      data.avgScore = data.totalScore / data.gamesPlayed;
    });

    // Determine weak and strong subjects
    const sortedSubjects = Object.entries(subjectPerformance).sort(
      (a, b) => a[1].avgScore - b[1].avgScore
    );

    const weakSubject = sortedSubjects[0] ? sortedSubjects[0][0] : null;
    const strongSubject = sortedSubjects[sortedSubjects.length - 1] ? sortedSubjects[sortedSubjects.length - 1][0] : null;

    // Get recommended games based on weak subjects
    let recommendedGames = [];
    if (weakSubject) {
      const weakSubjectData = await prisma.subject.findFirst({
        where: { name: weakSubject },
      });

      if (weakSubjectData) {
        const games = await prisma.game.findMany({
          where: {
            subjectId: weakSubjectData.id,
            active: true,
          },
          take: 3,
          orderBy: { points: "desc" },
        });

        recommendedGames = games.map((game) => ({
          id: game.id,
          title: game.title,
          reason: `Practice more in ${weakSubject} to improve`,
          icon: "🎮",
        }));
      }
    }

    // Generate learning suggestions
    const suggestions = [];
    if (weakSubject) {
      suggestions.push(
        `Focus on ${weakSubject} games to strengthen your skills in this area.`
      );
    }
    if (strongSubject) {
      suggestions.push(
        `You're doing great in ${strongSubject}! Try more challenging games to level up.`
      );
    }
    if (progressData.length > 0) {
      const avgScore = progressData.reduce((sum, p) => sum + p.score, 0) / progressData.length;
      if (avgScore > 80) {
        suggestions.push("Your performance is excellent! Consider trying harder difficulty levels.");
      } else if (avgScore < 50) {
        suggestions.push("Try practicing more to improve your overall performance.");
      }
    }

    // Generate insight
    let insight = "Keep learning and exploring new games!";
    if (progressData.length > 0) {
      const recentGames = progressData.slice(0, 5);
      const recentAvgScore = recentGames.reduce((sum, p) => sum + p.score, 0) / recentGames.length;
      
      if (recentAvgScore > 80) {
        insight = "You're on fire! Your recent performance has been excellent.";
      } else if (recentAvgScore > 60) {
        insight = "Good progress! Keep up the consistent effort.";
      } else {
        insight = "Don't give up! Practice makes perfect.";
      }
    }

    res.json({
      insight,
      recommendedGames,
      suggestions,
      subjectPerformance,
    });
  } catch (error) {
    console.error("Error getting adaptive recommendations:", error);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

// Update user's difficulty level based on performance
router.post("/adjust-difficulty", requireAuth, async (req, res) => {
  try {
    const { gameId, score, userId } = req.body;

    if (!gameId || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get the game's current difficulty
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Simple difficulty adjustment logic
    // If score > 80% of max points, increase difficulty
    // If score < 50% of max points, decrease difficulty
    let newDifficulty = game.difficultyLevel;
    const maxPoints = game.points;
    const scorePercentage = (score / maxPoints) * 100;

    if (scorePercentage > 80 && newDifficulty < 5) {
      newDifficulty += 1;
    } else if (scorePercentage < 50 && newDifficulty > 1) {
      newDifficulty -= 1;
    }

    // Update game difficulty for this user (this would typically be stored in a user-specific setting)
    // For now, we'll just return the recommended difficulty
    res.json({
      currentDifficulty: game.difficultyLevel,
      recommendedDifficulty: newDifficulty,
      reason: scorePercentage > 80 ? "Excellent performance!" : scorePercentage < 50 ? "Needs more practice" : "Keep going!",
    });
  } catch (error) {
    console.error("Error adjusting difficulty:", error);
    res.status(500).json({ error: "Failed to adjust difficulty" });
  }
});

export default router;

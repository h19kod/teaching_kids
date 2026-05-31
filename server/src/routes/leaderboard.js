import { Router } from "express";
import prisma from "../db.js";
import { requireAuth } from "../auth.js";
import { publicUser } from "../auth.js";

const router = Router();

const TOP_N = 10;

// GET /leaderboards -> get all leaderboards by category
router.get("/", requireAuth, async (req, res) => {
  try {
    const categories = ["weekly", "monthly", "all_time", "math", "english", "science", "space"];
    const leaderboards = [];

    for (const category of categories) {
      const leaderboard = await prisma.leaderboard.findFirst({
        where: { category, active: true },
        include: {
          entries: {
            include: { user: true },
            orderBy: { score: "desc" },
            take: 10,
          },
        },
      });

      if (leaderboard) {
        leaderboards.push({
          id: leaderboard.id,
          name: leaderboard.name,
          category: leaderboard.category,
          period: leaderboard.period,
          entries: leaderboard.entries.map((e) => ({
            id: e.id,
            score: e.score,
            rank: e.rank,
            user: publicUser(e.user),
          })),
        });
      } else {
        // If leaderboard doesn't exist in database, create on-the-fly from progress data
        let entries = [];
        
        if (category === "all_time") {
          const progressData = await prisma.progress.findMany({
            include: { user: true },
          });
          
          const userTotals = new Map();
          progressData.forEach((p) => {
            const cur = userTotals.get(p.userId) || { user: p.user, score: 0 };
            cur.score += p.score;
            userTotals.set(p.userId, cur);
          });
          
          entries = [...userTotals.values()]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map((row, i) => ({
              id: row.user.id,
              score: row.score,
              rank: i + 1,
              user: publicUser(row.user),
            }));
        } else if (["math", "english", "science", "space"].includes(category)) {
          const subject = await prisma.subject.findFirst({
            where: { name: { equals: category, mode: "insensitive" } },
          });
          
          if (subject) {
            const progressData = await prisma.progress.findMany({
              where: { game: { subjectId: subject.id } },
              include: { user: true },
            });
            
            const userTotals = new Map();
            progressData.forEach((p) => {
              const cur = userTotals.get(p.userId) || { user: p.user, score: 0 };
              cur.score += p.score;
              userTotals.set(p.userId, cur);
            });
            
            entries = [...userTotals.values()]
              .sort((a, b) => b.score - a.score)
              .slice(0, 10)
              .map((row, i) => ({
                id: row.user.id,
                score: row.score,
                rank: i + 1,
                user: publicUser(row.user),
              }));
          }
        }

        leaderboards.push({
          id: category,
          name: category.charAt(0).toUpperCase() + category.slice(1) + " Leaderboard",
          category,
          entries,
        });
      }
    }

    res.json(leaderboards);
  } catch (error) {
    console.error("Error fetching leaderboards:", error);
    res.status(500).json({ error: "Failed to fetch leaderboards" });
  }
});

// GET /leaderboard/subject/:id -> top users by total score within a subject.
router.get("/subject/:id", requireAuth, async (req, res) => {
  const subjectId = Number(req.params.id);
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) return res.status(404).json({ error: "Subject not found" });

  // Pull all progress for games in this subject, then aggregate per user.
  const entries = await prisma.progress.findMany({
    where: { game: { subjectId } },
    include: { user: true },
  });

  const totals = new Map(); // userId -> { user, score, plays }
  for (const e of entries) {
    const cur = totals.get(e.userId) || { user: e.user, score: 0, plays: 0 };
    cur.score += e.score;
    cur.plays += 1;
    totals.set(e.userId, cur);
  }

  const leaderboard = [...totals.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N)
    .map((row, i) => ({
      rank: i + 1,
      user: publicUser(row.user),
      totalScore: row.score,
      plays: row.plays,
    }));

  res.json({ subject: { id: subject.id, name: subject.name }, leaderboard });
});

// GET /leaderboard/game/:id -> top single scores for a specific game.
router.get("/game/:id", requireAuth, async (req, res) => {
  const gameId = Number(req.params.id);
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) return res.status(404).json({ error: "Game not found" });

  const entries = await prisma.progress.findMany({
    where: { gameId },
    include: { user: true },
  });

  // Best score per user.
  const best = new Map();
  for (const e of entries) {
    const cur = best.get(e.userId);
    if (!cur || e.score > cur.score) best.set(e.userId, e);
  }

  const leaderboard = [...best.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N)
    .map((row, i) => ({
      rank: i + 1,
      user: publicUser(row.user),
      score: row.score,
      timestamp: row.timestamp,
    }));

  res.json({ game: { id: game.id, title: game.title }, leaderboard });
});

export default router;

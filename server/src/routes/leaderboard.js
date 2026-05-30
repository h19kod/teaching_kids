import { Router } from "express";
import prisma from "../db.js";
import { requireAuth } from "../auth.js";
import { publicUser } from "../auth.js";

const router = Router();

const TOP_N = 10;

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

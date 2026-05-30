import { Router } from "express";
import prisma from "../db.js";
import { requireAuth, requireRole } from "../auth.js";

const router = Router();

// Admin usage statistics for the dashboard.
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  const [userCount, gameCount, subjectCount, playCount] = await Promise.all([
    prisma.user.count(),
    prisma.game.count(),
    prisma.subject.count(),
    prisma.progress.count(),
  ]);

  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: { role: true },
  });

  // Most played games.
  const playsByGame = await prisma.progress.groupBy({
    by: ["gameId"],
    _count: { gameId: true },
    _avg: { score: true },
    orderBy: { _count: { gameId: "desc" } },
    take: 5,
  });

  const gameIds = playsByGame.map((p) => p.gameId);
  const games = await prisma.game.findMany({
    where: { id: { in: gameIds } },
    include: { subject: true },
  });
  const gameMap = Object.fromEntries(games.map((g) => [g.id, g]));

  const topGames = playsByGame.map((p) => ({
    gameId: p.gameId,
    title: gameMap[p.gameId]?.title || "Unknown",
    subject: gameMap[p.gameId]?.subject?.name || "",
    plays: p._count.gameId,
    avgScore: Math.round(p._avg.score || 0),
  }));

  res.json({
    totals: { users: userCount, games: gameCount, subjects: subjectCount, plays: playCount },
    usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count.role })),
    topGames,
  });
});

export default router;

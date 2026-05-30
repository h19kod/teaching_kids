import { Router } from "express";
import { z } from "zod";
import prisma from "../db.js";
import { requireAuth, canAccessUser } from "../auth.js";
import { evaluateAndAward } from "../achievements.js";
import { paginate, setPaginationHeaders } from "../pagination.js";

const router = Router();

const progressSchema = z.object({
  gameId: z.number().int(),
  score: z.number().int().min(0),
  completed: z.boolean().optional(),
  // Optionally record progress for a child profile owned by the parent.
  childId: z.number().int().optional(),
});

// Save a game result for the current user (or one of their children).
router.post("/", requireAuth, async (req, res) => {
  const parsed = progressSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const { gameId, score, completed, childId } = parsed.data;

  let userId = req.user.id;
  if (childId) {
    const child = await prisma.user.findUnique({ where: { id: childId } });
    if (!child || child.parentId !== req.user.id) {
      return res.status(403).json({ error: "Not allowed to record for this child" });
    }
    userId = childId;
  }

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) return res.status(404).json({ error: "Game not found" });

  const entry = await prisma.progress.create({
    data: { userId, gameId, score, completed: completed ?? true },
  });

  // Re-evaluate badges so newly-earned achievements are persisted.
  const achievements = await evaluateAndAward(userId);
  res.status(201).json({ ...entry, achievements });
});

// GET /progress/user/:userId -> all progress records for a user (paginated).
router.get("/user/:userId", requireAuth, async (req, res) => {
  const userId = Number(req.params.userId);
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return res.status(404).json({ error: "User not found" });
  if (!canAccessUser(req.user, target)) return res.status(403).json({ error: "Not allowed" });

  const { skip, take, page, limit } = paginate(req.query);
  const where = { userId };
  const [total, records] = await Promise.all([
    prisma.progress.count({ where }),
    prisma.progress.findMany({
      where,
      orderBy: { timestamp: "desc" },
      include: { game: { include: { subject: true } } },
      skip,
      take,
    }),
  ]);
  setPaginationHeaders(res, { total, page, limit });
  res.json(records);
});

// GET /progress/game/:gameId -> aggregate stats for a specific game.
router.get("/game/:gameId", requireAuth, async (req, res) => {
  const gameId = Number(req.params.gameId);
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) return res.status(404).json({ error: "Game not found" });

  const agg = await prisma.progress.aggregate({
    where: { gameId },
    _count: { _all: true },
    _avg: { score: true },
    _max: { score: true },
  });

  const completed = await prisma.progress.count({ where: { gameId, completed: true } });

  res.json({
    gameId,
    title: game.title,
    plays: agg._count._all,
    completed,
    avgScore: Math.round(agg._avg.score || 0),
    bestScore: agg._max.score || 0,
  });
});

const updateSchema = z.object({
  score: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
});

// PUT /progress/:id -> update a progress record (owner / parent / admin).
router.put("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const record = await prisma.progress.findUnique({ where: { id }, include: { user: true } });
  if (!record) return res.status(404).json({ error: "Progress not found" });
  if (!canAccessUser(req.user, record.user)) return res.status(403).json({ error: "Not allowed" });

  const updated = await prisma.progress.update({ where: { id }, data: parsed.data });
  const achievements = await evaluateAndAward(record.userId);
  res.json({ ...updated, achievements });
});

// DELETE /progress/:id -> remove a progress record (owner / parent / admin).
router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const record = await prisma.progress.findUnique({ where: { id }, include: { user: true } });
  if (!record) return res.status(404).json({ error: "Progress not found" });
  if (!canAccessUser(req.user, record.user)) return res.status(403).json({ error: "Not allowed" });

  await prisma.progress.delete({ where: { id } });
  res.json({ ok: true });
});

// Aggregated progress + achievements for the current user (or a child).
router.get("/me", requireAuth, async (req, res) => {
  const childId = req.query.childId ? Number(req.query.childId) : null;
  let userId = req.user.id;

  if (childId) {
    const child = await prisma.user.findUnique({ where: { id: childId } });
    if (!child || child.parentId !== req.user.id) {
      return res.status(403).json({ error: "Not allowed" });
    }
    userId = childId;
  }

  const entries = await prisma.progress.findMany({
    where: { userId },
    orderBy: { timestamp: "desc" },
    include: { game: { include: { subject: true } } },
  });

  const totalPoints = entries.reduce((sum, e) => sum + e.score, 0);
  const gamesCompleted = new Set(
    entries.filter((e) => e.completed).map((e) => e.gameId)
  ).size;

  // Best score per game for a clean dashboard view.
  const bestByGame = {};
  for (const e of entries) {
    if (!bestByGame[e.gameId] || e.score > bestByGame[e.gameId].score) {
      bestByGame[e.gameId] = e;
    }
  }

  // Points per subject (for charts).
  const bySubject = {};
  for (const e of entries) {
    const name = e.game.subject.name;
    bySubject[name] = (bySubject[name] || 0) + e.score;
  }

  const achievements = await evaluateAndAward(userId);

  res.json({
    totalPoints,
    gamesCompleted,
    totalPlays: entries.length,
    achievements,
    bestByGame: Object.values(bestByGame),
    bySubject,
    recent: entries.slice(0, 10),
  });
});

export default router;

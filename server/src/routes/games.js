import { Router } from "express";
import { z } from "zod";
import prisma from "../db.js";
import { requireAuth, requireRole } from "../auth.js";
import { paginate, setPaginationHeaders } from "../pagination.js";

const router = Router();

// Parse the JSON content string into an object for client convenience.
function serializeGame(game) {
  if (!game) return game;
  let content = {};
  try {
    content = JSON.parse(game.content || "{}");
  } catch {
    content = {};
  }
  return { ...game, content };
}

// List games with filters (subject, difficulty, type, q) + pagination.
// Pagination metadata is returned via X-Total-Count / X-Page headers so the
// body stays a plain array.
router.get("/", async (req, res) => {
  const { subjectId, difficulty, type, q, includeInactive } = req.query;
  const where = {};
  if (subjectId) where.subjectId = Number(subjectId);
  if (difficulty) where.difficultyLevel = Number(difficulty);
  if (type) where.type = String(type);
  if (q) {
    where.OR = [
      { title: { contains: String(q) } },
      { description: { contains: String(q) } },
    ];
  }
  if (!includeInactive) where.active = true;

  const { skip, take, page, limit } = paginate(req.query, { defaultLimit: 50 });
  const [total, games] = await Promise.all([
    prisma.game.count({ where }),
    prisma.game.findMany({
      where,
      orderBy: [{ subjectId: "asc" }, { difficultyLevel: "asc" }],
      include: { subject: true },
      skip,
      take,
    }),
  ]);

  setPaginationHeaders(res, { total, page, limit });
  res.json(games.map(serializeGame));
});

router.get("/:id", async (req, res) => {
  const game = await prisma.game.findUnique({
    where: { id: Number(req.params.id) },
    include: { subject: true },
  });
  if (!game) return res.status(404).json({ error: "Game not found" });
  res.json(serializeGame(game));
});

const gameSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  subjectId: z.number().int(),
  difficultyLevel: z.number().int().min(1).max(5).optional(),
  points: z.number().int().min(0).optional(),
  type: z.enum(["math", "quiz", "spelling", "matching"]).optional(),
  content: z.any().optional(),
  active: z.boolean().optional(),
});

function normalizeContent(content) {
  if (content === undefined) return undefined;
  return typeof content === "string" ? content : JSON.stringify(content);
}

// --- Admin CRUD ---
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = gameSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const data = { ...parsed.data, content: normalizeContent(parsed.data.content) ?? "{}" };
  try {
    const game = await prisma.game.create({ data, include: { subject: true } });
    res.status(201).json(serializeGame(game));
  } catch {
    res.status(400).json({ error: "Could not create game (check subjectId)" });
  }
});

router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = gameSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const data = { ...parsed.data };
  if (data.content !== undefined) data.content = normalizeContent(data.content);
  try {
    const game = await prisma.game.update({
      where: { id: Number(req.params.id) },
      data,
      include: { subject: true },
    });
    res.json(serializeGame(game));
  } catch {
    res.status(404).json({ error: "Game not found" });
  }
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    await prisma.game.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Game not found" });
  }
});

export default router;

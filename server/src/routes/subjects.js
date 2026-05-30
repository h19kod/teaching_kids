import { Router } from "express";
import { z } from "zod";
import prisma from "../db.js";
import { requireAuth, requireRole } from "../auth.js";

const router = Router();

// List all subjects with game counts (public for browsing).
router.get("/", async (req, res) => {
  const subjects = await prisma.subject.findMany({
    orderBy: { id: "asc" },
    include: { _count: { select: { games: true } } },
  });
  res.json(subjects);
});

router.get("/:id", async (req, res) => {
  const subject = await prisma.subject.findUnique({
    where: { id: Number(req.params.id) },
    include: { games: { where: { active: true } } },
  });
  if (!subject) return res.status(404).json({ error: "Subject not found" });
  res.json(subject);
});

const subjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

// --- Admin CRUD ---
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = subjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const subject = await prisma.subject.create({ data: parsed.data });
  res.status(201).json(subject);
});

router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = subjectSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  try {
    const subject = await prisma.subject.update({
      where: { id: Number(req.params.id) },
      data: parsed.data,
    });
    res.json(subject);
  } catch {
    res.status(404).json({ error: "Subject not found" });
  }
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    await prisma.subject.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Subject not found" });
  }
});

export default router;

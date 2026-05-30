import { Router } from "express";
import { z } from "zod";
import prisma from "../db.js";
import { requireAuth, canAccessUser } from "../auth.js";

const router = Router();

// GET /achievements/user/:id -> badges earned by a user.
router.get("/user/:id", requireAuth, async (req, res) => {
  const userId = Number(req.params.id);
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return res.status(404).json({ error: "User not found" });
  if (!canAccessUser(req.user, target)) return res.status(403).json({ error: "Not allowed" });

  const achievements = await prisma.achievement.findMany({
    where: { userId },
    orderBy: { awardedAt: "desc" },
  });
  res.json(achievements);
});

const awardSchema = z.object({
  userId: z.number().int(),
  key: z.string().min(1),
  label: z.string().min(1),
  icon: z.string().optional(),
});

// POST /achievements -> manually award a badge (admin, or a parent for their child).
router.post("/", requireAuth, async (req, res) => {
  const parsed = awardSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const { userId, key, label, icon } = parsed.data;

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return res.status(404).json({ error: "User not found" });
  if (!canAccessUser(req.user, target)) return res.status(403).json({ error: "Not allowed" });

  // Idempotent: a badge can only be earned once per user.
  const achievement = await prisma.achievement.upsert({
    where: { userId_key: { userId, key } },
    update: { label, icon },
    create: { userId, key, label, icon },
  });
  res.status(201).json(achievement);
});

export default router;

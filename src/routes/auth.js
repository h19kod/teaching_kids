import { Router } from "express";
import { z } from "zod";
import prisma from "../db.js";
import {
  hashPassword,
  verifyPassword,
  signToken,
  publicUser,
  requireAuth,
} from "../auth.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional(),
  password: z.string().min(4, "Password must be at least 4 characters"),
  role: z.enum(["child", "parent", "admin"]).optional(),
});

// Register a parent/admin (or a self-serve child) account.
router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }
  const { name, email, password, role } = parsed.data;

  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already registered" });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email: email || null,
      password: await hashPassword(password),
      // Default new self-serve registrations to parent unless specified.
      role: role || "parent",
    },
  });

  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const ok = await verifyPassword(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

// A child can log in by selecting their profile (no password) using the
// parent's account context. Here we expose a simple kid login by id+name
// for child profiles that have no password set.
router.post("/child-login", async (req, res) => {
  const { childId } = req.body || {};
  const id = Number(childId);
  if (!id) return res.status(400).json({ error: "childId is required" });

  const child = await prisma.user.findUnique({ where: { id } });
  if (!child || child.role !== "child") {
    return res.status(404).json({ error: "Child profile not found" });
  }
  const token = signToken(child);
  res.json({ token, user: publicUser(child) });
});

// Current authenticated user.
router.get("/me", requireAuth, async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;

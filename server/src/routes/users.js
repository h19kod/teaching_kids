import { Router } from "express";
import { z } from "zod";
import prisma from "../db.js";
import {
  requireAuth,
  requireRole,
  hashPassword,
  verifyPassword,
  signToken,
  publicUser,
  canAccessUser,
} from "../auth.js";

const router = Router();

// --- Spec-compliant aliases: /users/register and /users/login ---
// (The frontend uses /auth/*; these mirror the same behaviour.)
const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  password: z.string().min(4),
  role: z.enum(["child", "parent", "admin"]).optional(),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const { name, email, password, role } = parsed.data;
  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already registered" });
  }
  const user = await prisma.user.create({
    data: { name, email: email || null, password: await hashPassword(password), role: role || "parent" },
  });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password || !(await verifyPassword(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
});

// --- Parent: manage own child profiles ---
const childSchema = z.object({
  name: z.string().min(1),
  password: z.string().min(4).optional(),
});

// List children of the logged-in parent.
router.get("/children", requireAuth, async (req, res) => {
  const children = await prisma.user.findMany({
    where: { parentId: req.user.id, role: "child" },
    orderBy: { id: "asc" },
  });
  res.json(children.map(publicUser));
});

// Create a child profile under the logged-in parent.
router.post("/children", requireAuth, requireRole("parent", "admin"), async (req, res) => {
  const parsed = childSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const { name, password } = parsed.data;
  const child = await prisma.user.create({
    data: {
      name,
      role: "child",
      parentId: req.user.id,
      password: password ? await hashPassword(password) : null,
    },
  });
  res.status(201).json(publicUser(child));
});

router.delete("/children/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const child = await prisma.user.findUnique({ where: { id } });
  if (!child || child.parentId !== req.user.id) {
    return res.status(404).json({ error: "Child not found" });
  }
  await prisma.user.delete({ where: { id } });
  res.json({ ok: true });
});

// --- Admin: manage all users ---
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
    include: { _count: { select: { progress: true, children: true } } },
  });
  res.json(users.map(publicUser));
});

const adminUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().nullable().optional(),
  role: z.enum(["child", "parent", "admin"]).optional(),
});

// GET /users/:id -> retrieve a profile (self, parent of, or admin).
router.get("/:id", requireAuth, async (req, res) => {
  const target = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
  if (!target) return res.status(404).json({ error: "User not found" });
  if (!canAccessUser(req.user, target)) return res.status(403).json({ error: "Not allowed" });
  res.json(publicUser(target));
});

// PUT /users/:id -> update details. Self/parent may edit name & email;
// only admins may change roles.
router.put("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return res.status(404).json({ error: "User not found" });
  if (!canAccessUser(req.user, target)) return res.status(403).json({ error: "Not allowed" });

  const parsed = adminUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const data = { ...parsed.data };
  // Role changes are admin-only.
  if (data.role !== undefined && req.user.role !== "admin") delete data.role;

  const user = await prisma.user.update({ where: { id }, data });
  res.json(publicUser(user));
});

// DELETE /users/:id -> remove a user (admin, or a parent removing their child).
router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: "You cannot delete yourself" });
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return res.status(404).json({ error: "User not found" });
  if (!canAccessUser(req.user, target)) return res.status(403).json({ error: "Not allowed" });

  await prisma.user.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;

import prisma from "./db.js";

// Central, extendable badge catalogue.
// Each rule receives aggregate stats and returns true when earned.
export const BADGES = [
  { key: "first_steps", label: "First Steps", icon: "🎒", rule: (s) => s.totalPlays >= 1 },
  { key: "getting_started", label: "Getting Started", icon: "⭐", rule: (s) => s.gamesCompleted >= 1 },
  { key: "explorer", label: "Explorer", icon: "🧭", rule: (s) => s.gamesCompleted >= 3 },
  { key: "high_scorer", label: "High Scorer", icon: "🏆", rule: (s) => s.totalPoints >= 500 },
  { key: "champion", label: "Champion", icon: "👑", rule: (s) => s.totalPoints >= 1000 },
  { key: "perfectionist", label: "Perfect Score", icon: "💯", rule: (s) => s.perfect },
];

// Compute aggregate stats for a user from their progress records.
export function aggregateStats(entries) {
  const totalPoints = entries.reduce((sum, e) => sum + e.score, 0);
  const gamesCompleted = new Set(entries.filter((e) => e.completed).map((e) => e.gameId)).size;
  const perfect = entries.some((e) => e.score >= (e.game?.points ?? 100));
  return { totalPoints, gamesCompleted, totalPlays: entries.length, perfect };
}

// Evaluate the badge rules and persist any newly-earned badges.
// Returns the full catalogue annotated with `earned`.
export async function evaluateAndAward(userId) {
  const entries = await prisma.progress.findMany({
    where: { userId },
    include: { game: true },
  });
  const stats = aggregateStats(entries);

  const earned = BADGES.filter((b) => b.rule(stats));
  if (earned.length) {
    await prisma.$transaction(
      earned.map((b) =>
        prisma.achievement.upsert({
          where: { userId_key: { userId, key: b.key } },
          update: {},
          create: { userId, key: b.key, label: b.label, icon: b.icon },
        })
      )
    );
  }

  const earnedKeys = new Set(earned.map((b) => b.key));
  return BADGES.map((b) => ({
    key: b.key,
    label: b.label,
    icon: b.icon,
    earned: earnedKeys.has(b.key),
  }));
}

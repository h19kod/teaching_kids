import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import subjectRoutes from "./routes/subjects.js";
import gameRoutes from "./routes/games.js";
import progressRoutes from "./routes/progress.js";
import userRoutes from "./routes/users.js";
import statsRoutes from "./routes/stats.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import achievementRoutes from "./routes/achievements.js";
import adaptiveRoutes from "./routes/adaptive.js";
import missionsRoutes from "./routes/missions.js";
import rewardsRoutes from "./routes/rewards.js";
import storyRoutes from "./routes/story.js";
import charactersRoutes from "./routes/characters.js";

const app = express();
const PORT = process.env.PORT || 4000;

const origins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(cors({ origin: origins, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/adaptive", adaptiveRoutes);
app.use("/api/missions", missionsRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/story", storyRoutes);
app.use("/api/characters", charactersRoutes);

// Centralized error handler.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

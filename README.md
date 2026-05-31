# 🎓 Kids Learning Adventure Platform

An educational adventure platform designed for children to learn through interactive games, missions, and storytelling. The platform features multiple learning worlds, adaptive learning, character customization, rewards, and comprehensive parent analytics.

## ✨ Features

### Core Features
- **Educational Worlds**: Four unique learning worlds (English Kingdom, Math Kingdom, Science Lab, Space Galaxy) with themed activities
- **Adaptive Learning Engine**: Automatic difficulty adjustment and personalized recommendations based on performance
- **Missions & Quests**: Daily and weekly missions with timer-based progression and rewards
- **Achievement System**: Comprehensive achievement tracking with tiered rewards (bronze, silver, gold, platinum)
- **Reward Shop**: In-game shop with currency system (coins, stars, gems) and rarity-based items
- **Story Mode**: Chapter-based educational storytelling with narrative progression
- **Character System**: Character selection and customization with rarity levels (common, rare, epic, legendary)
- **Leaderboards**: Category-based ranking system (weekly, monthly, all-time, per subject)
- **Parent Dashboard**: Comprehensive analytics dashboard for monitoring child progress
- **Statistics & Analytics**: Detailed learning statistics and performance insights
- **Multi-Language Support**: Arabic and English language support with RTL/LTR layout support

### Original Features
- **Accounts & roles** — `parent`, `child`, and `admin`. Parents create child profiles (no password needed for kids); admins manage everything.
- **Progress tracking** — every play is saved; a colorful dashboard shows points, completed games, badges, points-by-subject and recent activity.
- **Educational games** — each linked to a subject with **5 difficulty levels** and a **points/rewards** system. Built-in game engines:
  - `math` / `quiz` — multiple choice
  - `spelling` — typed answers
  - `matching` — match words with pictures
  - `mathrunner` — runner-style math challenges
  - `wordrunner` — word collection games
  - `animalrescue` — science-themed rescue games
  - `rocketmission` — space exploration games
  - Various RPG and puzzle games
- **Subjects** — Math (addition, subtraction, multiplication, logic puzzles), English (vocabulary, spelling, sentences, picture matching), Science (animals, experiments), Space (planets, astronomy).
- **Admin panel** — usage statistics, full game CRUD, and user management.

## 🧱 Tech Stack

| Layer    | Technology                                   |
| -------- | -------------------------------------------- |
| Frontend | React + Vite + Tailwind CSS + lucide-react   |
| Backend  | Node.js + Express (REST API)                 |
| Auth     | JWT (stateless) + bcrypt password hashing    |
| ORM/DB   | Prisma + SQLite (switchable to PostgreSQL)   |

## 🗂️ Data Models

### Core Models
- **User** (id, name, email?, role, parentId?, xp, level, coins, stars, gems, selectedCharacter) — User accounts with roles, currency, and character selection
- **Subject** (id, name, description) — Learning subjects
- **Game** (id, title, description, subjectId, difficultyLevel, points, type, content) — Educational games with metadata
- **Progress** (id, userId, gameId, score, completed, timestamp) — User game progress tracking
- **Achievement** (id, userId, key, label, description, icon, tier, xpReward) — User achievements with tiers

### Adventure Platform Models
- **Character** (id, name, description, icon, type, rarity, cost, unlockedBy) — Playable characters with rarity levels
- **Reward** (id, name, description, icon, type, rarity, cost, costType, unlockedBy) — Shop items and rewards
- **Mission** (id, title, description, type, category, target, xpReward, coinReward, starReward, gemReward) — Daily/weekly missions
- **UserMission** (id, userId, missionId, progress, completed, claimed, startDate, endDate) — User mission progress
- **StoryChapter** (id, chapter, title, description, content, world, xpReward, coinReward, requiredLevel) — Story chapters
- **StoryProgress** (id, userId, chapterId, completed, completedAt, startedAt) — User story progress
- **Leaderboard** (id, name, category, period, active) — Category-based leaderboards
- **LeaderboardEntry** (id, userId, leaderboardId, score, rank, periodStart, periodEnd) — User leaderboard entries
- **Inventory** (id, userId, characterId, rewardId, equipped, obtainedAt) — User inventory
- **Statistics** (id, userId, totalPoints, gamesPlayed, accuracyRate, learningTime, completedLevels, achievementsEarned, strongSubjects, weakSubjects) — Comprehensive user statistics

## 🚀 Getting Started

### 1. Backend

```bash
cd server
npm install
npm run setup     # prisma generate + db push + seed
npm run dev       # http://localhost:4000
```

### 2. Frontend (new terminal)

```bash
cd client
npm install
npm run dev       # http://localhost:5173
```

The Vite dev server proxies `/api` to the backend, so no extra config is needed.

### Demo logins

| Role   | Email             | Password    |
| ------ | ----------------- | ----------- |
| Admin  | `admin@kids.com`  | `admin123`  |
| Parent | `parent@kids.com` | `parent123` |

Children (Lily, Max) are launched from the parent's **Family** page.

## 🐘 Switching to PostgreSQL

1. In `server/prisma/schema.prisma`, change `provider = "sqlite"` to
   `provider = "postgresql"`.
2. In `server/.env`, set `DATABASE_URL` to your Postgres connection string.
3. Run `npm run db:push && npm run db:seed`.

No model or application code changes are required.

## 📡 API Overview

All list endpoints accept `?page=` and `?limit=` and return pagination metadata
via the `X-Total-Count`, `X-Page`, `X-Per-Page` and `X-Total-Pages` headers.

### Users
```
POST   /api/users/register          Create a user (child / parent / admin)
POST   /api/users/login             Authenticate, returns JWT
GET    /api/users/:id               Retrieve profile (self / parent / admin)
PUT    /api/users/:id               Update details (role change = admin only)
DELETE /api/users/:id               Remove a user (admin / parent of child)
GET    /api/users                   List all users (admin)
GET    /api/users/children          List own children (parent)
POST   /api/users/children          Create a child profile (parent)
GET    /api/users/:id/stats         Get user statistics (parent/admin)
# Frontend also uses: /api/auth/register, /api/auth/login, /api/auth/child-login, /api/auth/me
```

### Subjects
```
GET    /api/subjects                List subjects
POST   /api/subjects                Add subject (admin)
GET    /api/subjects/:id            Subject details + its games
PUT    /api/subjects/:id            Update (admin)
DELETE /api/subjects/:id            Remove (admin)
```

### Games
```
GET    /api/games?subjectId=&difficulty=&type=&q=&page=&limit=   List + filter
POST   /api/games                   Add game (admin)
GET    /api/games/:id               Game details
PUT    /api/games/:id               Update (admin)
DELETE /api/games/:id               Remove (admin)
```

### Progress
```
POST   /api/progress                Record a play (auto-awards achievements)
GET    /api/progress/user/:userId   All records for a user (paginated)
GET    /api/progress/game/:gameId   Aggregate stats for a game
GET    /api/progress/me             Aggregated dashboard for current user
PUT    /api/progress/:id            Update a record (owner / parent / admin)
DELETE /api/progress/:id            Remove a record (owner / parent / admin)
```

### Adaptive Learning
```
GET    /api/adaptive/recommendations   Get personalized learning recommendations
POST   /api/adaptive/adjust-difficulty  Adjust game difficulty based on performance
```

### Missions
```
GET    /api/missions                  Get user missions (daily/weekly)
POST   /api/missions/update           Update mission progress
POST   /api/missions/claim/:id        Claim mission rewards
```

### Rewards
```
GET    /api/rewards                   Get available rewards in shop
POST   /api/rewards/:id/purchase      Purchase a reward
GET    /api/rewards/inventory         Get user inventory
POST   /api/rewards/inventory/:id/equip Equip an item from inventory
```

### Story Mode
```
GET    /api/story/chapters            Get all story chapters
GET    /api/story/chapters/:id        Get specific chapter details
POST   /api/story/chapters/:id/start  Start a chapter
POST   /api/story/chapters/:id/complete Complete a chapter
```

### Characters
```
GET    /api/characters                Get all available characters
POST   /api/characters/:id/select     Select a character
GET    /api/characters/inventory      Get user's character inventory
```

### Leaderboards
```
GET    /api/leaderboards              Get all leaderboards by category
GET    /api/leaderboard/subject/:id   Top users by total score in a subject
GET    /api/leaderboard/game/:id       Top single scores for a game
```

### Achievements
```
GET    /api/achievements/user/:id     Badges earned by a user
POST   /api/achievements              Award a badge (admin / parent of child)
```

### Admin
```
GET    /api/stats                     Usage statistics (admin)
```

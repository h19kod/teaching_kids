# 🎓 Kids Learning Adventure

A full-stack educational games platform for children. Kids play games across
subjects (Math, English, Science…), earn points and badges, and parents/admins
track progress.

## ✨ Features

- **Accounts & roles** — `parent`, `child`, and `admin`. Parents create child
  profiles (no password needed for kids); admins manage everything.
- **Progress & achievements** — every play is saved; a colorful dashboard shows
  points, completed games, badges, points-by-subject and recent activity.
- **Educational games** — each linked to a subject with **5 difficulty levels**
  and a **points/rewards** system. Built-in game engines:
  - `math` / `quiz` — multiple choice
  - `spelling` — typed answers
  - `matching` — match words with pictures
- **Subjects** — Math (addition, subtraction, multiplication, logic puzzles),
  English (vocabulary, spelling, sentences, picture matching), plus Science as
  an extensibility demo. New subjects/games are added from the Admin panel.
- **Admin panel** — usage statistics, full game CRUD, and user management.

## 🧱 Tech Stack

| Layer    | Technology                                   |
| -------- | -------------------------------------------- |
| Frontend | React + Vite + Tailwind CSS + lucide-react   |
| Backend  | Node.js + Express (REST API)                 |
| Auth     | JWT (stateless) + bcrypt password hashing    |
| ORM/DB   | Prisma + SQLite (switchable to PostgreSQL)   |

## 🗂️ Data Models

`User` (id, name, email?, role, parentId?) · `Subject` (id, name, description) ·
`Game` (id, title, description, subjectId, difficultyLevel, points, type,
content) · `Progress` (id, userId, gameId, score, completed, timestamp).

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

### Leaderboard & Achievements
```
GET    /api/leaderboard/subject/:id Top users by total score in a subject
GET    /api/leaderboard/game/:id    Top single scores for a game
GET    /api/achievements/user/:id   Badges earned by a user
POST   /api/achievements            Award a badge (admin / parent of child)
```

### Admin
```
GET    /api/stats                   Usage statistics (admin)
```

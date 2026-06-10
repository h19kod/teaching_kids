# 📡 API Documentation - Kids Learning Adventure Platform

Complete REST API documentation for the Kids Learning educational games platform.

**Base URL:** `http://localhost:4000/api`  
**Authentication:** Bearer Token (JWT)

---

## 🔐 Authentication

All protected endpoints require an `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

---

## 📖 Table of Contents

1. [Health Check](#health-check)
2. [Authentication Routes](#authentication-routes)
3. [User Routes](#user-routes)
4. [Subject Routes](#subject-routes)
5. [Game Routes](#game-routes)
6. [Progress Routes](#progress-routes)
7. [Achievement Routes](#achievement-routes)
8. [Leaderboard Routes](#leaderboard-routes)
9. [Mission Routes](#mission-routes)
10. [Rewards Routes](#rewards-routes)
11. [Story Routes](#story-routes)
12. [Character Routes](#character-routes)
13. [Adaptive Learning Routes](#adaptive-learning-routes)
14. [Admin Routes](#admin-routes)

---

## Health Check

### GET `/api/health`

Check if the API server is running.

**Response:**
```json
{
  "status": "ok"
}
```

---

## Authentication Routes

### POST `/api/auth/register`

Register a new parent or admin account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "parent"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "parent"
  }
}
```

### POST `/api/auth/login`

Authenticate and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "parent"
  }
}
```

### POST `/api/auth/child-login`

Login as a child profile (no password required, parent context).

**Request Body:**
```json
{
  "childId": 3
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 3,
    "name": "Lily",
    "role": "child"
  }
}
```

### GET `/api/auth/me`

Get current authenticated user info.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "parent"
  }
}
```

---

## User Routes

### POST `/api/users/register`

Alias for `/api/auth/register`.

### POST `/api/users/login`

Alias for `/api/auth/login`.

### GET `/api/users/me`

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

### GET `/api/users/:id`

Get user profile by ID.

**Headers:** `Authorization: Bearer <token>`  
**Access:** Self, parent of child, or admin

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "parent",
  "xp": 150,
  "level": 2,
  "coins": 50,
  "stars": 10,
  "gems": 5
}
```

### PUT `/api/users/:id`

Update user profile.

**Headers:** `Authorization: Bearer <token>`  
**Access:** Self (name/email), Admin (all fields including role)

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

### DELETE `/api/users/:id`

Delete a user account.

**Headers:** `Authorization: Bearer <token>`  
**Access:** Self, parent of child, or admin

**Response (200):**
```json
{ "ok": true }
```

### GET `/api/users`

List all users (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Access:** Admin only

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "parent"
  },
  {
    "id": 2,
    "name": "Lily",
    "role": "child",
    "parentId": 1
  }
]
```

### GET `/api/users/children`

List all children of logged-in parent.

**Headers:** `Authorization: Bearer <token>`  
**Access:** Parent or Admin

**Response (200):**
```json
[
  {
    "id": 3,
    "name": "Lily",
    "role": "child",
    "xp": 200,
    "level": 3
  },
  {
    "id": 4,
    "name": "Max",
    "role": "child",
    "xp": 150,
    "level": 2
  }
]
```

### POST `/api/users/children`

Create a child profile under the parent.

**Headers:** `Authorization: Bearer <token>`  
**Access:** Parent or Admin

**Request Body:**
```json
{
  "name": "Emma",
  "password": "optional123"
}
```

**Response (201):**
```json
{
  "id": 5,
  "name": "Emma",
  "role": "child",
  "parentId": 1
}
```

### DELETE `/api/users/children/:id`

Delete a child profile.

**Headers:** `Authorization: Bearer <token>`  
**Access:** Parent of the child

### GET `/api/users/:id/stats`

Get detailed statistics for a user.

**Headers:** `Authorization: Bearer <token>`  
**Access:** Parent or Admin

**Response (200):**
```json
{
  "totalPoints": 1250,
  "gamesPlayed": 45,
  "accuracyRate": 78,
  "learningTime": 120,
  "completedLevels": 32,
  "achievementsEarned": 8,
  "strongSubjects": "Math, Science",
  "weakSubjects": "English",
  "bySubject": {
    "Math": 500,
    "Science": 400,
    "English": 200,
    "Space": 150
  },
  "weeklyPlayTime": 60,
  "monthlyPlayTime": 180
}
```

---

## Subject Routes

### GET `/api/subjects`

List all subjects with game counts.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Math",
    "description": "Mathematics learning games",
    "icon": "🧮",
    "color": "blue",
    "_count": {
      "games": 10
    }
  },
  {
    "id": 2,
    "name": "English",
    "description": "Language and vocabulary games",
    "icon": "📚",
    "color": "green",
    "_count": {
      "games": 8
    }
  }
]
```

### GET `/api/subjects/:id`

Get subject details with its games.

**Response (200):**
```json
{
  "id": 1,
  "name": "Math",
  "description": "Mathematics learning games",
  "icon": "🧮",
  "color": "blue",
  "games": [
    {
      "id": 1,
      "title": "Addition Adventure",
      "difficultyLevel": 1,
      "type": "math"
    }
  ]
}
```

### POST `/api/subjects`

Create a new subject (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Access:** Admin only

**Request Body:**
```json
{
  "name": "Science",
  "description": "Science experiments and learning",
  "icon": "🔬",
  "color": "purple"
}
```

**Response (201):**
```json
{
  "id": 3,
  "name": "Science",
  "description": "Science experiments and learning",
  "icon": "🔬",
  "color": "purple"
}
```

### PUT `/api/subjects/:id`

Update a subject (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Access:** Admin only

**Request Body:**
```json
{
  "description": "Updated description"
}
```

### DELETE `/api/subjects/:id`

Delete a subject (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Access:** Admin only

---

## Game Routes

### GET `/api/games`

List all games with filters and pagination.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `subjectId` | number | Filter by subject |
| `difficulty` | number | Filter by difficulty level (1-5) |
| `type` | string | Filter by game type |
| `q` | string | Search query |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 50) |
| `includeInactive` | boolean | Include inactive games |

**Response Headers:**
- `X-Total-Count`: Total number of games
- `X-Page`: Current page
- `X-Per-Page`: Items per page
- `X-Total-Pages`: Total pages

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Addition Adventure",
    "description": "Learn addition with fun",
    "subjectId": 1,
    "subject": {
      "id": 1,
      "name": "Math"
    },
    "difficultyLevel": 1,
    "points": 100,
    "type": "math",
    "content": {
      "questions": [
        {
          "question": "What is 2 + 2?",
          "options": ["3", "4", "5"],
          "correct": 1
        }
      ]
    },
    "active": true
  }
]
```

### GET `/api/games/:id`

Get a specific game.

**Response (200):**
```json
{
  "id": 1,
  "title": "Addition Adventure",
  "description": "Learn addition with fun",
  "subjectId": 1,
  "subject": {
    "id": 1,
    "name": "Math"
  },
  "difficultyLevel": 1,
  "points": 100,
  "type": "math",
  "content": {
    "questions": [...]
  },
  "active": true
}
```

### POST `/api/games`

Create a new game (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Access:** Admin only

**Request Body:**
```json
{
  "title": "Multiplication Master",
  "description": "Practice multiplication",
  "subjectId": 1,
  "difficultyLevel": 3,
  "points": 150,
  "type": "math",
  "content": {
    "questions": [
      {
        "question": "What is 5 × 5?",
        "options": ["20", "25", "30"],
        "correct": 1
      }
    ]
  },
  "active": true
}
```

### PUT `/api/games/:id`

Update a game (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Access:** Admin only

### DELETE `/api/games/:id`

Delete a game (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Access:** Admin only

---

## Progress Routes

### POST `/api/progress`

Record a game result.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "gameId": 1,
  "score": 85,
  "completed": true,
  "childId": 3
}
```

**Note:** `childId` is optional. Use it when recording progress for a parent's child.

**Response (201):**
```json
{
  "id": 1,
  "userId": 3,
  "gameId": 1,
  "score": 85,
  "completed": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "achievements": [
    {
      "id": 1,
      "key": "first_game",
      "label": "First Game Completed",
      "tier": "bronze"
    }
  ]
}
```

### GET `/api/progress/user/:userId`

Get all progress records for a user.

**Headers:** `Authorization: Bearer <token>`  
**Access:** Self, parent of child, or admin

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page

**Response (200):**
```json
[
  {
    "id": 1,
    "userId": 3,
    "gameId": 1,
    "score": 85,
    "completed": true,
    "timestamp": "2024-01-15T10:30:00Z",
    "game": {
      "id": 1,
      "title": "Addition Adventure",
      "subject": {
        "id": 1,
        "name": "Math"
      }
    }
  }
]
```

### GET `/api/progress/game/:gameId`

Get aggregate stats for a game.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "gameId": 1,
  "title": "Addition Adventure",
  "plays": 150,
  "completed": 120,
  "avgScore": 75,
  "bestScore": 100
}
```

### GET `/api/progress/me`

Get aggregated dashboard for current user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `childId` - Get progress for a specific child (parent only)

**Response (200):**
```json
{
  "totalPoints": 1250,
  "gamesCompleted": 15,
  "totalPlays": 45,
  "achievements": [...],
  "bestByGame": [...],
  "bySubject": {
    "Math": 500,
    "Science": 400
  },
  "recent": [...]
}
```

### PUT `/api/progress/:id`

Update a progress record.

**Headers:** `Authorization: Bearer <token>`  
**Access:** Owner, parent of child, or admin

**Request Body:**
```json
{
  "score": 90,
  "completed": true
}
```

### DELETE `/api/progress/:id`

Delete a progress record.

**Headers:** `Authorization: Bearer <token>`  
**Access:** Owner, parent of child, or admin

---

## Achievement Routes

### GET `/api/achievements/user/:id`

Get all achievements for a user.

**Headers:** `Authorization: Bearer <token>`  
**Access:** Self, parent of child, or admin

**Response (200):**
```json
[
  {
    "id": 1,
    "userId": 3,
    "key": "first_game",
    "label": "First Game Completed",
    "description": "Complete your first game",
    "icon": "🎮",
    "tier": "bronze",
    "xpReward": 50,
    "awardedAt": "2024-01-15T10:30:00Z"
  }
]
```

### POST `/api/achievements`

Manually award an achievement (admin/parent only).

**Headers:** `Authorization: Bearer <token>`  
**Access:** Admin or parent of child

**Request Body:**
```json
{
  "userId": 3,
  "key": "high_scorer",
  "label": "High Scorer",
  "icon": "🏆"
}
```

---

## Leaderboard Routes

### GET `/api/leaderboard`

Get all leaderboards by category.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Weekly Leaderboard",
    "category": "weekly",
    "entries": [
      {
        "id": 1,
        "score": 1250,
        "rank": 1,
        "user": {
          "id": 3,
          "name": "Lily"
        }
      }
    ]
  }
]
```

### GET `/api/leaderboard/subject/:id`

Get leaderboard for a specific subject.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "subject": {
    "id": 1,
    "name": "Math"
  },
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "id": 3,
        "name": "Lily"
      },
      "totalScore": 2500,
      "plays": 45
    }
  ]
}
```

### GET `/api/leaderboard/game/:id`

Get leaderboard for a specific game (best single scores).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "game": {
    "id": 1,
    "title": "Addition Adventure"
  },
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "id": 3,
        "name": "Lily"
      },
      "score": 100,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## Mission Routes

### GET `/api/missions`

Get all missions for current user (daily and weekly).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "daily": [
    {
      "id": 1,
      "title": "Play 3 Games",
      "description": "Complete 3 games today",
      "target": 3,
      "progress": 1,
      "completed": false,
      "claimed": false,
      "xpReward": 50,
      "coinReward": 20,
      "starReward": 5,
      "gemReward": 0
    }
  ],
  "weekly": [
    {
      "id": 2,
      "title": "Earn 500 Points",
      "description": "Collect 500 points this week",
      "target": 500,
      "progress": 200,
      "completed": false,
      "claimed": false,
      "xpReward": 100,
      "coinReward": 50,
      "starReward": 10,
      "gemReward": 1
    }
  ]
}
```

### POST `/api/missions/update`

Update mission progress.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "missionId": 1,
  "progress": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "progress": 2,
  "completed": true,
  "rewards": {
    "xp": 50,
    "coins": 20,
    "stars": 5,
    "gems": 0
  }
}
```

### POST `/api/missions/claim/:id`

Claim rewards for a completed mission.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Rewards claimed successfully!"
}
```

---

## Rewards Routes

### GET `/api/rewards`

Get all available rewards in shop.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Golden Crown",
    "description": "A shiny golden crown",
    "icon": "👑",
    "type": "costume",
    "rarity": "legendary",
    "cost": 100,
    "costType": "gems",
    "active": true
  }
]
```

### POST `/api/rewards/:id/purchase`

Purchase a reward.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Reward purchased successfully!",
  "reward": {
    "id": 1,
    "name": "Golden Crown"
  }
}
```

### GET `/api/rewards/inventory`

Get user's inventory.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": 1,
    "userId": 3,
    "rewardId": 1,
    "reward": {
      "name": "Golden Crown",
      "icon": "👑"
    },
    "equipped": false,
    "obtainedAt": "2024-01-15T10:30:00Z"
  }
]
```

### POST `/api/rewards/inventory/:id/equip`

Equip an item from inventory.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Item equipped successfully!"
}
```

---

## Story Routes

### GET `/api/story/chapters`

Get all story chapters with user progress.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": 1,
    "chapter": 1,
    "title": "The Beginning",
    "description": "Start your adventure",
    "world": "english",
    "xpReward": 100,
    "coinReward": 50,
    "requiredLevel": 1,
    "completed": false,
    "completedAt": null,
    "content": {
      "scenes": [...]
    }
  }
]
```

### GET `/api/story/chapters/:id`

Get specific chapter details.

**Headers:** `Authorization: Bearer <token>`

### POST `/api/story/chapters/:id/start`

Start a story chapter.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Chapter started!",
  "chapter": {
    "id": 1,
    "title": "The Beginning",
    "content": {...}
  }
}
```

### POST `/api/story/chapters/:id/complete`

Complete a story chapter and claim rewards.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Chapter completed!",
  "rewards": {
    "xp": 100,
    "coins": 50
  }
}
```

---

## Character Routes

### GET `/api/characters`

Get all available characters.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Explorer Kid",
    "description": "Brave adventurer",
    "icon": "🧒",
    "type": "explorer",
    "rarity": "common",
    "cost": 0,
    "unlockedBy": null
  },
  {
    "id": 2,
    "name": "Space Ranger",
    "description": "Galaxy protector",
    "icon": "👨‍🚀",
    "type": "space_ranger",
    "rarity": "rare",
    "cost": 50,
    "unlockedBy": "space_explorer"
  }
]
```

### POST `/api/characters/:id/select`

Select a character (purchase if needed).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Character selected successfully!",
  "character": {
    "id": 1,
    "name": "Explorer Kid"
  }
}
```

### GET `/api/characters/inventory`

Get user's character inventory.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": 1,
    "userId": 3,
    "characterId": 1,
    "character": {
      "name": "Explorer Kid",
      "icon": "🧒"
    },
    "equipped": true,
    "obtainedAt": "2024-01-15T10:30:00Z"
  }
]
```

---

## Adaptive Learning Routes

### GET `/api/adaptive/recommendations`

Get personalized learning recommendations.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "insight": "You're on fire! Your recent performance has been excellent.",
  "recommendedGames": [
    {
      "id": 5,
      "title": "Word Wizard",
      "reason": "Practice more in English to improve",
      "icon": "🎮"
    }
  ],
  "suggestions": [
    "Focus on English games to strengthen your skills in this area.",
    "You're doing great in Math! Try more challenging games to level up."
  ],
  "subjectPerformance": {
    "Math": {
      "totalScore": 500,
      "gamesPlayed": 10,
      "avgScore": 50
    },
    "English": {
      "totalScore": 200,
      "gamesPlayed": 5,
      "avgScore": 40
    }
  }
}
```

### POST `/api/adaptive/adjust-difficulty`

Adjust game difficulty based on performance.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "gameId": 1,
  "score": 85,
  "userId": 3
}
```

**Response (200):**
```json
{
  "currentDifficulty": 2,
  "recommendedDifficulty": 3,
  "reason": "Excellent performance!"
}
```

---

## Admin Routes

### GET `/api/stats`

Get usage statistics (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Access:** Admin only

**Response (200):**
```json
{
  "totals": {
    "users": 50,
    "games": 25,
    "subjects": 4,
    "plays": 1200
  },
  "usersByRole": [
    { "role": "child", "count": 40 },
    { "role": "parent", "count": 8 },
    { "role": "admin", "count": 2 }
  ],
  "topGames": [
    {
      "gameId": 1,
      "title": "Addition Adventure",
      "subject": "Math",
      "plays": 350,
      "avgScore": 75
    }
  ]
}
```

---

## 📊 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Not allowed to access |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## 📝 Data Types

### User Roles
- `child` - Child profile
- `parent` - Parent account
- `admin` - Administrator

### Game Types
- `math` - Math games
- `quiz` - Quiz games
- `spelling` - Spelling games
- `matching` - Matching games

### Rarity Levels
- `common`
- `rare`
- `epic`
- `legendary`

### Achievement Tiers
- `bronze`
- `silver`
- `gold`
- `platinum`

### Currency Types
- `coins`
- `stars`
- `gems`

---

**API Version:** 1.0.0  
**Last Updated:** June 2024

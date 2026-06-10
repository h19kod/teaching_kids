# 🚀 Installation Guide - Kids Learning Adventure Platform

Complete step-by-step installation guide for the Kids Learning educational games platform.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for cloning)

### Verify Installation

```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
```

---

## 🗂️ Project Structure

```
teaching_child_js/
├── server/                 # Backend API
│   ├── src/
│   │   ├── index.js        # Server entry point
│   │   ├── routes/         # API route handlers
│   │   ├── auth.js         # Authentication utilities
│   │   ├── db.js           # Database connection
│   │   ├── achievements.js # Achievement system
│   │   └── pagination.js   # Pagination utilities
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js         # Seed data
│   ├── .env                # Environment variables
│   ├── .env.example        # Example environment file
│   └── package.json
│
├── client/                 # Frontend React App
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── README.md
└── INSTALLATION.md         # This file
```

---

## ⚙️ Backend Installation

### Step 1: Navigate to Server Directory

```bash
cd server
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Express.js - Web framework
- Prisma - Database ORM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- cors - Cross-origin resource sharing
- morgan - HTTP request logger
- zod - Schema validation
- dotenv - Environment variables

### Step 3: Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Or create it manually with this content:

```env
# Database Configuration (SQLite - Zero setup for development)
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=4000

# Client Origin (CORS)
CLIENT_ORIGIN="http://localhost:5173"
```

#### Environment Variables Explained

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `file:./dev.db` |
| `JWT_SECRET` | Secret key for JWT signing | Change in production |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d` |
| `PORT` | Server port | `4000` |
| `CLIENT_ORIGIN` | Allowed client origin for CORS | `http://localhost:5173` |

### Step 4: Setup Database

Run the database setup command:

```bash
npm run setup
```

This command will:
1. Generate Prisma client
2. Push database schema
3. Seed database with sample data

#### Manual Database Commands

```bash
# Generate Prisma client only
npx prisma generate

# Push schema to database
npx prisma db push

# Run seed data only
npm run db:seed

# Reset database (⚠️ Deletes all data)
npm run db:reset
```

### Step 5: Start the Server

#### Development Mode (with auto-reload)

```bash
npm run dev
```

The server will start on `http://localhost:4000`

#### Production Mode

```bash
npm start
```

### Step 6: Verify Backend

Test the API health endpoint:

```bash
curl http://localhost:4000/api/health
```

Expected response:
```json
{ "status": "ok" }
```

---

## 🎨 Frontend Installation

### Step 1: Navigate to Client Directory

Open a new terminal window/tab and run:

```bash
cd client
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- React 18 - UI library
- React Router DOM - Navigation
- Lucide React - Icons
- Tailwind CSS - Styling
- Vite - Build tool
- Vite PWA Plugin - PWA support

### Step 3: Start the Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### Step 4: Verify Frontend

Open your browser and navigate to:

```
http://localhost:5173
```

You should see the Kids Learning Adventure Platform login page.

---

## 🐘 Switching to PostgreSQL (Production)

For production environments, it's recommended to use PostgreSQL instead of SQLite.

### Step 1: Install PostgreSQL

Ensure PostgreSQL is installed and running on your system.

### Step 2: Update Schema

Edit `server/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 3: Update Environment Variables

Edit `server/.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/kidslearning"
```

### Step 4: Migrate Database

```bash
cd server
npx prisma db push
npm run db:seed
```

---

## 🔐 Demo Accounts

After installation, you can log in with these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@kids.com` | `admin123` |
| **Parent** | `parent@kids.com` | `parent123` |

Child profiles (Lily, Max) are created under the parent account and can be accessed from the parent's **Family** page.

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:** `EADDRINUSE: Address already in use :::4000`

**Solution:**
```bash
# Find and kill the process using port 4000
# On Windows:
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# On macOS/Linux:
lsof -ti:4000 | xargs kill -9
```

#### 2. Database Permission Errors

**Error:** `Error: EPERM: operation not permitted`

**Solution:**
```bash
# Remove the database file and regenerate
cd server
rm -f prisma/dev.db
rm -rf prisma/migrations
npm run setup
```

#### 3. Prisma Client Generation Error

**Solution:**
```bash
cd server
npx prisma generate --force
```

#### 4. CORS Errors in Browser

**Solution:** Check that `CLIENT_ORIGIN` in `.env` matches your frontend URL.

#### 5. JWT Token Expired

**Solution:** Login again or increase `JWT_EXPIRES_IN` in `.env`

---

## 📦 Production Deployment

### Backend Deployment

1. **Set environment variables:**
   ```env
   NODE_ENV=production
   JWT_SECRET=your-production-secret-key
   DATABASE_URL=your-production-database-url
   CLIENT_ORIGIN=https://yourdomain.com
   ```

2. **Install production dependencies:**
   ```bash
   cd server
   npm ci --production
   ```

3. **Setup database:**
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

4. **Start server:**
   ```bash
   npm start
   ```

### Frontend Deployment

1. **Build for production:**
   ```bash
   cd client
   npm run build
   ```

2. **Serve the `dist/` folder** using your preferred web server (nginx, Apache, etc.)

---

## 🔧 Development Scripts

### Backend Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Run database seed |
| `npm run db:reset` | Reset database (⚠️ Deletes data) |
| `npm run setup` | Full setup (generate + push + seed) |

### Frontend Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)

---

## ✅ Installation Checklist

- [ ] Node.js v18+ installed
- [ ] Backend dependencies installed (`cd server && npm install`)
- [ ] `.env` file created in server directory
- [ ] Database setup complete (`npm run setup`)
- [ ] Backend server running (`npm run dev`)
- [ ] Frontend dependencies installed (`cd client && npm install`)
- [ ] Frontend server running (`npm run dev`)
- [ ] Both servers accessible in browser
- [ ] Demo login successful

---

**Happy Learning! 🎓✨**

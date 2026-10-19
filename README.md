# 🎮 ClusterHub — Gaming Tournament & Match Management System

<div align="center">

**Organize tournaments. Manage matches. Track the competition.**

A modern, full-stack esports and gaming tournament management platform connecting games, tournaments, teams, registrations, match fixtures, and real-time leaderboards.

<br>

![Project Status](https://img.shields.io/badge/Status-Fully%20Verified%20%26%20Active-16a34a?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-API-000000?style=for-the-badge&logo=express&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

<br>

[Repository](https://github.com/Ahad-Panhwer/ClusterHub) · [Source Code](https://github.com/Ahad-Panhwer/ClusterHub/tree/main) · [Report an Issue](https://github.com/Ahad-Panhwer/ClusterHub/issues)

</div>

---

## 📌 Architecture & System Flow

```mermaid
graph TD
    A[React 19 Frontend - Vite] --> B[Centralized DataContext]
    B --> C[API Client - fetch with Bearer Token]
    C -->|HTTP REST on :4000| D[Express REST API]
    D --> E[Security: Helmet, CORS, Rate Limit]
    D --> F[Auth & Role Verification]
    D --> G[Zod Schema Validation]
    G --> H[Repository Layer]
    H -->|Production| I[(Supabase PostgreSQL)]
    H -->|Local Dev Fallback| J[In-Memory Store with Seed Data]
```

ClusterHub uses a clean full-stack monorepo architecture:
- **`frontend/`**: React 19 + TypeScript + Vite + Tailwind CSS v4 with glassmorphism dark gaming UI.
- **`backend/`**: Node.js + Express + TypeScript REST API providing full validation, authorization, and dual base path support (`/api/*` and `/api/v1/*`).
- **`database/`**: Versioned PostgreSQL migrations, Row-Level Security (RLS) policies, and seed data for Supabase.
- **`docs/`**: Complete engineering specifications, API contracts, database schema, and deployment plans.

---

## 📂 Repository Structure

```text
ClusterHub/
├── package.json               # Root workspace scripts (run both frontend and backend)
├── render.yaml                # 1-click Render blueprint deployment specification
├── README.md                  # Master documentation
├── .gitignore                 # Root Git exclusion rules
│
├── frontend/                  # React 19 + TypeScript Web UI
│   ├── package.json
│   ├── vite.config.ts         # Vite bundler configuration
│   ├── netlify.toml           # Netlify SPA rewrite configuration
│   ├── .env.example           # Example environment variables
│   ├── .env.local             # Local environment configuration (points to port 4000)
│   ├── public/
│   │   └── _redirects         # Single Page Application routing rewrite rule
│   └── src/
│       ├── components/        # Layout (TopNav, Sidebar), charts, and UI primitives
│       ├── context/           # AuthContext (Abdul Ahad profile), DataContext, ToastContext
│       ├── pages/             # Dashboard, Games, Tournaments, Matches, Teams, Registrations, Leaderboard, Settings, Auth
│       ├── services/          # apiClient, gamesService, tournamentsService, matchesService, etc.
│       └── types/             # Shared TypeScript type definitions
│
├── backend/                   # Node.js + Express + TypeScript REST API
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js         # Jest ESM configuration
│   ├── .env.example           # Environment template
│   ├── src/
│   │   ├── app.ts             # Express app setup, middleware, and route mounting
│   │   ├── server.ts          # Server listener on port 4000
│   │   ├── config/            # Environment variable validation & Supabase auto-detection
│   │   ├── lib/               # In-memory store fallback and Supabase client
│   │   ├── middleware/        # auth, errorHandler, validate
│   │   ├── repositories/      # Games, Tournaments, Matches, Teams, Registrations repositories
│   │   ├── routes/            # Express routers for all CRUD modules
│   │   ├── types/             # Backend TypeScript interfaces
│   │   └── validators/        # Zod input schemas
│   └── tests/
│       └── api.test.ts        # 34 automated Jest & Supertest integration tests
│
├── database/                  # Supabase PostgreSQL Database Setup
│   ├── README.md
│   ├── migrations/
│   │   ├── 0001_initial_schema.sql       # Relational tables, indexes, constraints
│   │   └── 0002_row_level_security.sql   # RLS policies for role-based security
│   └── seeds/
│       └── 0001_seed_demo_data.sql       # Initial seed fixtures
│
└── docs/                      # Project Specifications & Design Docs
    ├── API_CONTRACT.md        # REST API endpoints, status codes, and rules
    ├── ARCHITECTURE.md        # System design, data flow, security model
    ├── DATABASE_SCHEMA.md     # Relational schema reference and constraints
    ├── DEVELOPMENT_PLAN.md    # Implementation phases and milestones
    ├── PROJECT_SPEC.md        # Core requirements and scope
    └── TESTING_AND_DEPLOYMENT.md # Test matrix and deployment guide
```

---

## ✨ Features & Module Capabilities

### 🎮 Games Management (Mandatory CRUD)
- **Create**: Add new games with genre, platform, description, max players per team (1–64), and release year.
- **Read**: Interactive search, genre filters, platform filters, and game detail modal.
- **Update**: Edit game metadata with immediate UI update.
- **Delete**: Safe deletion with conflict protection (`409 Conflict` if dependent tournaments exist).

### 🏆 Tournament Management (Mandatory CRUD)
- **Create**: Create tournaments with formats (*Single Elimination*, *Double Elimination*, *Round Robin*, *Swiss*), capacity (2–128 teams), start/end dates, and prize pool.
- **Read**: Status filtering (*Draft*, *Registration Open*, *In Progress*, *Completed*), live team registration count badge, and game linkage.
- **Update**: Transition statuses, edit rules, dates, and prize distribution.
- **Delete**: Safely cascades cleanup of associated matches and registrations.

### ⚔️ Matches & Results (Mandatory CRUD)
- **Create**: Pair teams into bracket rounds. Automatically highlights registered teams and enforces that **both teams must have an active tournament registration**.
- **Read**: Match fixtures viewable as cards or schedule table, filtered by tournament and status.
- **Update & Score Recording**: Record match scores, specify winner, and enter caster/referee notes.
- **Delete**: Remove unplayed fixtures.

### 👥 Teams & Registrations
- **Teams**: Register esports teams, unique uppercase team tags (conflict detection prevents duplicate tags), and captain contacts.
- **Registrations**: One-click team registration into tournaments with duplicate prevention and automatic waitlisting once tournament capacity is reached.

### 📊 Live Derived Leaderboard
- Dynamically calculated from verified completed match records:
  - **Win**: 3 points
  - **Loss**: 0 points
  - Ranked by Points $\rightarrow$ Win Rate $\rightarrow$ Wins $\rightarrow$ Team Name.

### 🔐 Authentication & Roles
- **Active Profile**: **Abdul Ahad (Lead Organizer)**.
- **Roles**: Support for `organizer`, `admin`, and `captain`.
- **Security**: Bearer JWT token verification on all protected endpoints, centralized error handling (no stack traces in production), Helmet HTTP headers, CORS origin validation, and rate limiting.

---

## 💻 Run ClusterHub Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (v9 or higher)

### 1. Clone the repository
```bash
git clone https://github.com/Ahad-Panhwer/ClusterHub.git
cd ClusterHub
```

### 2. Install dependencies
```bash
# Install backend dependencies
npm --prefix backend install

# Install frontend dependencies
npm --prefix frontend install
```

### 3. Start the Backend API Server
```bash
npm run dev:backend
```
The Express REST API will start at **`http://localhost:4000`** (Health endpoint: `http://localhost:4000/api/health`).

### 4. Start the Frontend Application
In a second terminal window:
```bash
npm run dev:frontend
```
The Vite React application will start at **`http://localhost:5173`**.

---

## 🧪 Testing & Verification

ClusterHub includes a complete automated integration test suite covering all CRUD endpoints, authentication enforcement, input validation, and business logic constraints:

```bash
# Run the 34 automated backend Jest integration tests
npm run test:backend

# Type-check both frontend and backend
npm run lint

# Build production bundles for both frontend and backend
npm run build
```

**Test Results:**
```text
Test Suites: 1 passed, 1 total
Tests:       34 passed, 34 total
Snapshots:   0 total
Time:        ~4s
```

---

## 🚀 Production Deployment Guide

### Backend — Render Web Service
1. In [Render Dashboard](https://dashboard.render.com/), choose **New $\rightarrow$ Blueprint** and select your ClusterHub repository (or create a Web Service using the included `render.yaml`).
2. Set environment variables:
   - `PORT`: `10000`
   - `NODE_ENV`: `production`
   - `FRONTEND_ORIGIN`: Your Netlify frontend domain
   - `SUPABASE_URL`: Your Supabase project URL (optional for in-memory mode)
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### Frontend — Netlify Static Hosting
1. In [Netlify](https://app.netlify.com/), click **Add new site $\rightarrow$ Import an existing project**.
2. Settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Environment variables:
   - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com/api`

---

## 🔗 Project Links & License

- **GitHub Repository:** [https://github.com/Ahad-Panhwer/ClusterHub](https://github.com/Ahad-Panhwer/ClusterHub)
- **Issue Tracker:** [https://github.com/Ahad-Panhwer/ClusterHub/issues](https://github.com/Ahad-Panhwer/ClusterHub/issues)
- **Lead Organizer / Developer:** **Abdul Ahad**

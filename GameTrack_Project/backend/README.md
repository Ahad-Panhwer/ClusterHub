# ClusterHub Backend — Express + TypeScript REST API

High-performance, secure Express REST API powering ClusterHub (Gaming Tournament & Match Management System).

## Features
- **TypeScript & ESM**: Fully typed, clean architecture.
- **Dual Persistence Mode**: 
  - Automatically connects to **Supabase PostgreSQL** when credentials are provided.
  - Automatically falls back to an **In-Memory Store** seeded with realistic mock data for zero-config offline development & testing.
- **Dual Base Paths**: Serves `/api/*` (frontend client) and `/api/v1/*` (standard API contract).
- **Authentication & Security**:
  - Supabase JWT token verification via `Authorization: Bearer <token>`.
  - Development bypass support with demo tokens (`demo-token-*`).
  - Helmet HTTP security headers.
  - Granular CORS handling.
  - Express Rate Limiting (500 requests / 15m window, 30 requests / 15m for auth).
- **Zod Validation**: Strict schema validation for all payload mutations.
- **Error Handling**: Centralized error middleware with no stack traces leaked in production.
- **Automated Test Suite**: 34 unit & integration tests covering all CRUD endpoints using Jest and Supertest.

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | Listening HTTP port | `4000` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| `FRONTEND_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:5173,http://localhost:3000` |
| `SUPABASE_URL` | Supabase project URL (optional for dev) | `""` |
| `SUPABASE_ANON_KEY` | Supabase public anon key (optional) | `""` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (optional) | `""` |

### 3. Run Development Server
```bash
npm run dev
```
Server starts on `http://localhost:4000`.

### 4. Run Test Suite
```bash
npm test
```
Executes all 34 automated integration tests with Jest and Supertest.

### 5. Build for Production
```bash
npm run build
npm start
```

## API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health`, `/api/health`, `/api/v1/health` | Service health status | No |
| `GET` | `/api/games` | List all games | No |
| `POST` | `/api/games` | Create game | Yes |
| `GET` | `/api/games/:id` | Get game details | No |
| `PATCH` / `PUT` | `/api/games/:id` | Update game | Yes |
| `DELETE` | `/api/games/:id` | Delete game | Yes |
| `GET` | `/api/tournaments` | List all tournaments | No |
| `POST` | `/api/tournaments` | Create tournament | Yes |
| `GET` | `/api/tournaments/:id` | Get tournament details | No |
| `PATCH` / `PUT` | `/api/tournaments/:id` | Update tournament | Yes |
| `DELETE` | `/api/tournaments/:id` | Delete tournament | Yes |
| `GET` | `/api/tournaments/:id/leaderboard` | Standings for tournament | No |
| `GET` | `/api/matches` | List matches (`?tournament_id=...`) | No |
| `POST` | `/api/matches` | Schedule match | Yes |
| `GET` | `/api/matches/:id` | Get match details | No |
| `PATCH` / `PUT` | `/api/matches/:id` | Update match / record score | Yes |
| `DELETE` | `/api/matches/:id` | Delete match | Yes |
| `GET` | `/api/teams` | List teams | No |
| `POST` | `/api/teams` | Register team | Yes |
| `GET` | `/api/teams/:id` | Get team details | No |
| `PATCH` / `PUT` | `/api/teams/:id` | Update team | Yes |
| `DELETE` | `/api/teams/:id` | Delete team | Yes |
| `GET` | `/api/registrations` | List tournament registrations | No |
| `POST` | `/api/registrations` | Register team for tournament | Yes |
| `PATCH` | `/api/registrations/:id` | Update registration status | Yes |
| `DELETE` | `/api/registrations/:id` | Cancel registration | Yes |
| `GET` | `/api/leaderboard` | Global or filtered leaderboard | No |

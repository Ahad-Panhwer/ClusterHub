# ClusterHub Frontend — React + TypeScript + Vite + TailwindCSS

Modern, high-performance web user interface for **ClusterHub — Gaming Tournament & Match Management System**.

## Tech Stack
- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 8 + TSX
- **Styling**: Tailwind CSS v4 + Glassmorphism aesthetic with dark gaming UI theme
- **Icons & Motion**: Lucide React + Motion (Framer Motion)
- **Routing**: React Router DOM v7
- **Data & State**: Centralized `DataContext` with seamless dual-mode support (Live Express Backend API + Offline Mock Mode toggle)
- **Notifications**: Toast notification system & live status indicators

## Project Structure
```text
src/
├── components/
│   ├── charts/           # Dashboard analytics & tournament activity charts
│   ├── layout/           # AppLayout, Sidebar, TopNav, breadcrumbs
│   └── ui/               # Reusable UI components (Modal, Button, Input, Card, Badge, etc.)
├── context/
│   ├── AuthContext.tsx   # Auth state (Supabase Auth / Demo Organizer / Admin)
│   ├── DataContext.tsx   # Centralized data provider (Games, Tournaments, Matches, Teams, etc.)
│   └── ToastContext.tsx  # User feedback alerts and toasts
├── pages/
│   ├── DashboardPage.tsx     # Overview metrics, upcoming matches, quick actions
│   ├── GamesPage.tsx         # Full CRUD for games
│   ├── TournamentsPage.tsx   # Full CRUD for tournaments with status badges & filter
│   ├── MatchesPage.tsx       # Full CRUD for matches & score recording
│   ├── TeamsPage.tsx         # Full CRUD for teams
│   ├── RegistrationsPage.tsx # Tournament registration management & approval
│   ├── LeaderboardPage.tsx   # Dynamic calculated standings
│   ├── SettingsPage.tsx      # System preferences & API/Mock mode switcher
│   └── AuthPage.tsx          # Login & role switcher
├── services/
│   ├── apiClient.ts          # Centralized fetch wrapper with Bearer token & error handling
│   ├── authService.ts        # Supabase and demo auth session provider
│   ├── gamesService.ts       # Games API integration
│   ├── tournamentsService.ts # Tournaments API integration
│   ├── matchesService.ts     # Matches API integration
│   ├── teamsService.ts       # Teams API integration
│   ├── registrationsService.ts # Registrations API integration
│   └── leaderboardService.ts # Leaderboard calculation
└── types/
    └── index.ts              # Full TypeScript type definitions
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure `VITE_API_BASE_URL`:
```env
# Points to the local Express backend:
VITE_API_BASE_URL=http://localhost:4000/api
```

### 3. Start Development Server
```bash
npm run dev
# or
npx vite
```
Access the application at `http://localhost:5173` (or `http://localhost:3000` via `npm run dev`).

### 4. Build for Production
```bash
npm run build
```
Creates production-ready static assets in the `dist/` directory.

### 5. Type Check
```bash
npm run lint
```
Runs `tsc --noEmit` to verify type safety across all components and pages.

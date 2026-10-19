# 🎮 ClusterHub Frontend — React 19 + TypeScript + Vite

Modern, high-performance web user interface for **ClusterHub — Gaming Tournament & Match Management System**.

## 🛠️ Technology Stack
- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 8 + TSX
- **Styling**: Tailwind CSS v4 + Custom glassmorphic esports dark gaming theme
- **Icons & Motion**: Lucide React + Motion (Framer Motion)
- **Routing**: React Router DOM v7
- **State & Data**: Centralized `DataContext` with seamless dual-mode capability (live Express backend connection via `apiClient.ts` + offline mock fallback)
- **Identity**: `AuthContext` with active organizer profile **Abdul Ahad**

## 📂 Frontend Architecture & Component Hierarchy

```text
frontend/
├── index.html               # Main HTML entrypoint
├── vite.config.ts           # Vite build configuration with alias resolution
├── netlify.toml             # Netlify deployment rewrite rules
├── public/
│   └── _redirects           # SPA route fallback for static hosting
├── src/
│   ├── main.tsx             # React DOM root render
│   ├── App.tsx              # Router & global Context Providers setup
│   ├── index.css            # Tailwind CSS v4 styling & color design tokens
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx     # Shell layout with responsive navigation
│   │   │   ├── Sidebar.tsx       # Desktop & mobile collapsible sidebar
│   │   │   └── TopNav.tsx        # Search, notifications, and Abdul Ahad user profile
│   │   ├── charts/
│   │   │   ├── StatsCard.tsx     # Metrics summary card component
│   │   │   └── TournamentActivityChart.tsx # Live activity analytics chart
│   │   └── ui/                   # Reusable glassmorphic UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Textarea.tsx
│   │       ├── Modal.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── Badge.tsx
│   │       ├── Skeleton.tsx
│   │       ├── EmptyState.tsx
│   │       └── SearchModal.tsx
│   │
│   ├── context/
│   │   ├── AuthContext.tsx       # Auth session state & user role management
│   │   ├── DataContext.tsx       # Centralized state for Games, Tournaments, Matches, Teams, Leaderboard
│   │   └── ToastContext.tsx      # User action feedback alerts & toasts
│   │
│   ├── pages/
│   │   ├── DashboardPage.tsx     # High-level KPIs, upcoming fixtures, recent tournaments
│   │   ├── GamesPage.tsx         # Full CRUD operations for gaming catalogue
│   │   ├── TournamentsPage.tsx   # Full CRUD operations for tournaments & status filtering
│   │   ├── MatchesPage.tsx       # Full CRUD operations for match scheduling & score recording
│   │   ├── TeamsPage.tsx         # Full CRUD operations for esports teams
│   │   ├── RegistrationsPage.tsx # Tournament registration approvals & waitlists
│   │   ├── LeaderboardPage.tsx   # Real-time calculated tournament standings
│   │   ├── SettingsPage.tsx      # System preferences & backend API connection toggles
│   │   └── AuthPage.tsx          # Login & role switcher
│   │
│   ├── services/
│   │   ├── apiClient.ts          # Centralized fetch wrapper with Bearer token & error normalization
│   │   ├── authService.ts        # Supabase and demo auth provider
│   │   ├── gamesService.ts       # Games API client
│   │   ├── tournamentsService.ts # Tournaments API client
│   │   ├── matchesService.ts     # Matches API client
│   │   ├── teamsService.ts       # Teams API client
│   │   ├── registrationsService.ts # Registrations API client
│   │   └── leaderboardService.ts # Dynamic standings calculation
│   │
│   └── types/
│       └── index.ts              # TypeScript interface contracts
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Ensure `VITE_API_BASE_URL` points to your backend instance:
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```
Creates an optimized static bundle in `dist/`.

### 5. Type-Check
```bash
npm run lint
```
Verifies TypeScript compilation with zero errors.

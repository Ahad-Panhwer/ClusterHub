# Database Schema

## 1. Database choice

Use Supabase PostgreSQL. It is a hosted relational database and supports foreign keys, transactions, constraints, indexes, and SQL migrations. The database is separate from the frontend and backend hosts.

## 2. Tables

### profiles
- `id UUID PRIMARY KEY` — matches the authenticated user's ID.
- `username TEXT UNIQUE NOT NULL`
- `display_name TEXT NOT NULL`
- `role TEXT NOT NULL` — `admin`, `organizer`, or `captain`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`

### games
- `id UUID PRIMARY KEY`
- `title TEXT NOT NULL`
- `genre TEXT NOT NULL`
- `platform TEXT NOT NULL`
- `description TEXT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`

### teams
- `id UUID PRIMARY KEY`
- `name TEXT NOT NULL`
- `captain_id UUID NOT NULL REFERENCES profiles(id)`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`

### team_members
- `team_id UUID REFERENCES teams(id)`
- `player_id UUID REFERENCES profiles(id)`
- `joined_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- Composite primary key: `(team_id, player_id)`

### tournaments
- `id UUID PRIMARY KEY`
- `game_id UUID NOT NULL REFERENCES games(id) ON DELETE RESTRICT`
- `organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT`
- `name TEXT NOT NULL`
- `format TEXT NOT NULL` — keep supported formats limited initially, e.g. `single_elimination` and `round_robin`.
- `capacity INTEGER NOT NULL CHECK (capacity > 0)`
- `start_at TIMESTAMPTZ NOT NULL`
- `end_at TIMESTAMPTZ NULL`
- `status TEXT NOT NULL` — `draft`, `open`, `in_progress`, `completed`, `cancelled`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- Check: end time must not precede start time.

### registrations
- `id UUID PRIMARY KEY`
- `tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE RESTRICT`
- `team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT`
- `status TEXT NOT NULL` — `registered`, `withdrawn`
- `registered_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- Unique constraint: `(tournament_id, team_id)`

### matches
- `id UUID PRIMARY KEY`
- `tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE RESTRICT`
- `round_number INTEGER NOT NULL CHECK (round_number > 0)`
- `team_a_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT`
- `team_b_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT`
- `score_a INTEGER NULL CHECK (score_a >= 0)`
- `score_b INTEGER NULL CHECK (score_b >= 0)`
- `status TEXT NOT NULL` — `scheduled`, `in_progress`, `completed`, `cancelled`
- `scheduled_at TIMESTAMPTZ NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- Check: `team_a_id <> team_b_id`.

## 3. Relationship and business rules

- One game can have many tournaments.
- One organizer can organize many tournaments.
- A team has one captain and can have multiple members.
- A tournament can have multiple registrations and matches.
- A team can enter a tournament only once.
- Both match teams must have active registrations in the same tournament.
- Completed matches must have valid scores.
- A leaderboard includes completed matches only.
- Deletion must not silently orphan or erase referenced records.
- Capacity must be enforced safely in the backend, preferably within a transaction or another concurrency-safe database operation.

Some cross-table rules cannot be expressed by ordinary foreign keys alone. Enforce them in the service layer and, where appropriate, through database constraints/triggers.

## 4. Migration policy

- Keep schema changes in numbered SQL migration files.
- Apply migrations to a development project first.
- Do not rely on manual dashboard-only schema changes.
- Keep seed/demo data separate from production migrations.
- Never include real secrets in SQL files.
- Verify the schema from a clean database before deployment.

## 5. Indexes to consider

Add indexes on foreign-key columns and frequently filtered fields:
- `tournaments(game_id)`
- `tournaments(organizer_id)`
- `registrations(tournament_id)`
- `registrations(team_id)`
- `matches(tournament_id)`
- `matches(scheduled_at)`
- `matches(status)`

Use `EXPLAIN` or query profiling only if performance issues arise; do not over-engineer a small student project.

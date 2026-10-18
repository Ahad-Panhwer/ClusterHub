-- GameTrack initial schema migration (starter).
-- Apply only to a new development Supabase project after reviewing DATABASE_SCHEMA.md.
-- Supabase Auth user IDs are referenced from auth.users.
-- This migration creates the core relational tables; authentication policies and
-- any project-specific triggers should be added in a reviewed follow-up migration.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'captain'
        CHECK (role IN ('admin', 'organizer', 'captain')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    genre TEXT NOT NULL CHECK (length(trim(genre)) > 0),
    platform TEXT NOT NULL CHECK (length(trim(platform)) > 0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    captain_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (team_id, player_id)
);

CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE RESTRICT,
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    format TEXT NOT NULL DEFAULT 'single_elimination'
        CHECK (format IN ('single_elimination', 'round_robin')),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'open', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_at IS NULL OR end_at >= start_at)
);

CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE RESTRICT,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'registered'
        CHECK (status IN ('registered', 'withdrawn')),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tournament_id, team_id)
);

CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE RESTRICT,
    round_number INTEGER NOT NULL CHECK (round_number > 0),
    team_a_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
    team_b_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
    score_a INTEGER CHECK (score_a >= 0),
    score_b INTEGER CHECK (score_b >= 0),
    status TEXT NOT NULL DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (team_a_id <> team_b_id),
    CHECK (
        status <> 'completed'
        OR (score_a IS NOT NULL AND score_b IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_tournaments_game_id
    ON public.tournaments(game_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_organizer_id
    ON public.tournaments(organizer_id);
CREATE INDEX IF NOT EXISTS idx_registrations_tournament_id
    ON public.registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_team_id
    ON public.registrations(team_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament_id
    ON public.matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_scheduled_at
    ON public.matches(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_matches_status
    ON public.matches(status);

-- IMPORTANT SECURITY NOTE:
-- This migration does not enable Row Level Security or create policies.
-- Do not expose these tables directly to an untrusted client until a reviewed
-- RLS policy strategy is implemented. The planned Express backend must verify
-- user identity and authorization for all protected operations.
-- Cross-table rules (e.g. both match teams registered for the same tournament)
-- must be enforced in backend logic or an additional database constraint/trigger.

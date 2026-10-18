-- Migration 0002: Row Level Security (RLS) Policies
-- ClusterHub — Gaming Tournament & Match Management System
-- Applies to Supabase PostgreSQL

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- 2. Profiles policies
-- Anyone authenticated can view user profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

-- Users can only insert or update their own profile
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 3. Games policies
-- Anyone can view games
CREATE POLICY "Games are viewable by everyone"
    ON public.games FOR SELECT
    USING (true);

-- Only organizers and admins can manage games (or service role)
CREATE POLICY "Organizers and admins can insert games"
    ON public.games FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'organizer')
        )
    );

CREATE POLICY "Organizers and admins can update games"
    ON public.games FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'organizer')
        )
    );

CREATE POLICY "Admins can delete games"
    ON public.games FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 4. Teams policies
-- Teams are public viewable
CREATE POLICY "Teams are viewable by everyone"
    ON public.teams FOR SELECT
    USING (true);

-- Authenticated users can create teams
CREATE POLICY "Authenticated users can create teams"
    ON public.teams FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Team captains or admins can update team details
CREATE POLICY "Captains and admins can update their team"
    ON public.teams FOR UPDATE
    USING (
        captain_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Captains and admins can delete their team"
    ON public.teams FOR DELETE
    USING (
        captain_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 5. Tournaments policies
-- Tournaments are viewable by everyone
CREATE POLICY "Tournaments are viewable by everyone"
    ON public.tournaments FOR SELECT
    USING (true);

-- Organizers and admins can create tournaments
CREATE POLICY "Organizers and admins can create tournaments"
    ON public.tournaments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'organizer')
        )
    );

CREATE POLICY "Organizers can update their own tournaments; admins can update all"
    ON public.tournaments FOR UPDATE
    USING (
        organizer_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Organizers can delete their own tournaments; admins can delete all"
    ON public.tournaments FOR DELETE
    USING (
        organizer_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 6. Registrations policies
-- Registrations viewable by everyone
CREATE POLICY "Registrations are viewable by everyone"
    ON public.registrations FOR SELECT
    USING (true);

-- Captains can register their own team; organizers/admins can register any
CREATE POLICY "Captains and organizers can create registrations"
    ON public.registrations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.teams
            WHERE teams.id = team_id
            AND teams.captain_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'organizer')
        )
    );

CREATE POLICY "Captains can withdraw their team; organizers/admins can update"
    ON public.registrations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.teams
            WHERE teams.id = team_id
            AND teams.captain_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'organizer')
        )
    );

-- 7. Matches policies
-- Matches viewable by everyone
CREATE POLICY "Matches are viewable by everyone"
    ON public.matches FOR SELECT
    USING (true);

-- Only tournament organizers and admins can schedule/update/delete matches
CREATE POLICY "Organizers and admins can manage matches"
    ON public.matches FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.tournaments
            WHERE tournaments.id = matches.tournament_id
            AND (
                tournaments.organizer_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                )
            )
        )
    );

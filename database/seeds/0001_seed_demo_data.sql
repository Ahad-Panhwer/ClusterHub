-- Seed Data for ClusterHub / GameTrack
-- Run this in the Supabase SQL Editor after 0001_initial_schema.sql and 0002_row_level_security.sql

-- 1. Games
INSERT INTO public.games (id, title, genre, platform, description) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Valorant', 'Tactical Shooter', 'PC', 'A 5v5 character-based tactical shooter where precise gunplay meets unique agent abilities.'),
    ('00000000-0000-0000-0000-000000000002', 'Rocket League', 'Sports / Arcade', 'Multiplatform', 'Soccer meets driving in an award-winning, physics-based vehicular chaos action game.'),
    ('00000000-0000-0000-0000-000000000003', 'Counter-Strike 2', 'Tactical Shooter', 'PC', 'The next chapter in competitive first-person shooter history, built on Source 2.'),
    ('00000000-0000-0000-0000-000000000004', 'Apex Legends', 'Battle Royale', 'Multiplatform', 'Master an expanding roster of legendary characters with powerful abilities in squad battle.')
ON CONFLICT (id) DO NOTHING;

-- 2. Mock Profiles (for testing without auth users, or with service_role bypass)
-- In live Supabase Auth, profiles are created when auth.users signs up
-- The backend uses in-memory or authenticated profiles.

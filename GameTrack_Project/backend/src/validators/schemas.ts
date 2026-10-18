import { z } from 'zod';

const TOURNAMENT_FORMATS = ['Single Elimination', 'Double Elimination', 'Round Robin', 'Swiss'] as const;
const TOURNAMENT_STATUSES = ['draft', 'registration_open', 'in_progress', 'completed', 'cancelled'] as const;
const MATCH_STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled'] as const;
const REGISTRATION_STATUSES = ['confirmed', 'pending', 'waitlist', 'cancelled'] as const;

const nonEmptyString = z.string().trim().min(1, 'Cannot be empty');

// ----------- Games -----------

export const createGameSchema = z.object({
  title: nonEmptyString.max(100),
  genre: nonEmptyString.max(60),
  platform: nonEmptyString.max(60),
  description: nonEmptyString.max(1000),
  max_players_per_team: z.number().int().min(1).max(64),
  release_year: z.number().int().min(1980).max(2030),
  banner_color: z.string().optional(),
  icon_theme: z.string().optional(),
});

export const updateGameSchema = z.object({
  title: nonEmptyString.max(100).optional(),
  genre: nonEmptyString.max(60).optional(),
  platform: nonEmptyString.max(60).optional(),
  description: nonEmptyString.max(1000).optional(),
  max_players_per_team: z.number().int().min(1).max(64).optional(),
  release_year: z.number().int().min(1980).max(2030).optional(),
  banner_color: z.string().optional(),
  icon_theme: z.string().optional(),
  is_active: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update.',
});

// ----------- Tournaments -----------

export const createTournamentSchema = z.object({
  title: nonEmptyString.max(120),
  game_id: z.string().uuid('game_id must be a valid UUID').or(z.string().min(1)),
  format: z.enum(TOURNAMENT_FORMATS),
  status: z.enum(TOURNAMENT_STATUSES).optional(),
  start_date: z.string().refine((v) => !isNaN(Date.parse(v)), 'start_date must be a valid ISO date'),
  end_date: z.string().refine((v) => !isNaN(Date.parse(v)), 'end_date must be a valid ISO date'),
  max_teams: z.number().int().min(2).max(128),
  prize_pool: z.number().min(0),
  description: nonEmptyString.max(2000),
  rules: z.string().max(2000).optional(),
}).refine(
  (data) => new Date(data.end_date) > new Date(data.start_date),
  { message: 'end_date must be after start_date', path: ['end_date'] }
);

export const updateTournamentSchema = z.object({
  title: nonEmptyString.max(120).optional(),
  game_id: z.string().min(1).optional(),
  format: z.enum(TOURNAMENT_FORMATS).optional(),
  status: z.enum(TOURNAMENT_STATUSES).optional(),
  start_date: z.string().refine((v) => !isNaN(Date.parse(v)), 'start_date must be a valid ISO date').optional(),
  end_date: z.string().refine((v) => !isNaN(Date.parse(v)), 'end_date must be a valid ISO date').optional(),
  max_teams: z.number().int().min(2).max(128).optional(),
  prize_pool: z.number().min(0).optional(),
  description: nonEmptyString.max(2000).optional(),
  rules: z.string().max(2000).optional(),
});

// ----------- Matches -----------

export const createMatchSchema = z.object({
  tournament_id: z.string().min(1, 'tournament_id is required'),
  team1_id: z.string().min(1, 'team1_id is required'),
  team2_id: z.string().min(1, 'team2_id is required'),
  round: nonEmptyString.max(80),
  round_number: z.number().int().min(1).optional(),
  scheduled_at: z.string().refine((v) => !isNaN(Date.parse(v)), 'scheduled_at must be a valid ISO date'),
  notes: z.string().max(500).optional(),
}).refine((data) => data.team1_id !== data.team2_id, {
  message: 'team1_id and team2_id must be different teams',
  path: ['team2_id'],
});

export const updateMatchSchema = z.object({
  scheduled_at: z.string().refine((v) => !isNaN(Date.parse(v)), 'scheduled_at must be a valid ISO date').optional(),
  round: nonEmptyString.max(80).optional(),
  round_number: z.number().int().min(1).optional(),
  status: z.enum(MATCH_STATUSES).optional(),
  team1_score: z.number().int().min(0).optional(),
  team2_score: z.number().int().min(0).optional(),
  winner_id: z.string().nullable().optional(),
  notes: z.string().max(500).optional(),
});

// ----------- Teams -----------

export const createTeamSchema = z.object({
  name: nonEmptyString.max(80),
  tag: z.string().trim().min(2, 'Tag must be 2-5 characters').max(5, 'Tag must be 2-5 characters'),
  captain_name: nonEmptyString.max(100),
  captain_email: z.string().email('Must be a valid email address'),
  logo_color: z.string().optional(),
  members_count: z.number().int().min(1).max(64).optional(),
});

export const updateTeamSchema = z.object({
  name: nonEmptyString.max(80).optional(),
  tag: z.string().trim().min(2).max(5).optional(),
  captain_name: nonEmptyString.max(100).optional(),
  captain_email: z.string().email().optional(),
  logo_color: z.string().optional(),
  members_count: z.number().int().min(1).max(64).optional(),
});

// ----------- Registrations -----------

export const createRegistrationSchema = z.object({
  tournament_id: z.string().min(1, 'tournament_id is required'),
  team_id: z.string().min(1, 'team_id is required'),
  status: z.enum(REGISTRATION_STATUSES).optional(),
});

export const updateRegistrationStatusSchema = z.object({
  status: z.enum(REGISTRATION_STATUSES),
});

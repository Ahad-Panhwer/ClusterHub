/**
 * ClusterHub Backend Types
 * These mirror the frontend types/index.ts to ensure consistency.
 * The backend is the source of truth for validation; types here must match DB schema.
 */

export interface Game {
  id: string;
  title: string;
  genre: string;
  platform: string;
  description: string;
  max_players_per_team: number;
  release_year: number;
  icon_theme?: string;
  banner_color?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export type TournamentFormat = 'Single Elimination' | 'Double Elimination' | 'Round Robin' | 'Swiss';
export type TournamentStatus = 'draft' | 'registration_open' | 'in_progress' | 'completed' | 'cancelled';

export interface Tournament {
  id: string;
  title: string;
  game_id: string;
  game?: Game;
  format: TournamentFormat;
  status: TournamentStatus;
  start_date: string;
  end_date: string;
  max_teams: number;
  prize_pool: number;
  description: string;
  rules?: string;
  registered_teams_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  captain_name: string;
  captain_email: string;
  logo_color: string;
  members_count: number;
  created_at: string;
  updated_at?: string;
}

export type RegistrationStatus = 'confirmed' | 'pending' | 'waitlist' | 'cancelled';

export interface Registration {
  id: string;
  tournament_id: string;
  team_id: string;
  status: RegistrationStatus;
  registered_at: string;
  seed_number?: number;
  tournament?: Tournament;
  team?: Team;
}

export type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Match {
  id: string;
  tournament_id: string;
  tournament?: Tournament;
  team1_id: string;
  team1?: Team;
  team2_id: string;
  team2?: Team;
  round: string;
  round_number: number;
  scheduled_at: string;
  status: MatchStatus;
  team1_score: number;
  team2_score: number;
  winner_id?: string | null;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface LeaderboardEntry {
  team_id: string;
  team: Team;
  matches_played: number;
  wins: number;
  losses: number;
  points: number;
  win_rate: number;
  rank: number;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'organizer' | 'admin' | 'referee';
}

// DTO types used by request validators
export interface CreateGameDto {
  title: string;
  genre: string;
  platform: string;
  description: string;
  max_players_per_team: number;
  release_year: number;
  banner_color?: string;
  icon_theme?: string;
}

export interface UpdateGameDto extends Partial<CreateGameDto> {
  is_active?: boolean;
}

export interface CreateTournamentDto {
  title: string;
  game_id: string;
  format: TournamentFormat;
  status?: TournamentStatus;
  start_date: string;
  end_date: string;
  max_teams: number;
  prize_pool: number;
  description: string;
  rules?: string;
}

export interface UpdateTournamentDto extends Partial<CreateTournamentDto> {}

export interface CreateMatchDto {
  tournament_id: string;
  team1_id: string;
  team2_id: string;
  round: string;
  round_number?: number;
  scheduled_at: string;
  notes?: string;
}

export interface UpdateMatchDto {
  scheduled_at?: string;
  round?: string;
  round_number?: number;
  status?: MatchStatus;
  team1_score?: number;
  team2_score?: number;
  winner_id?: string | null;
  notes?: string;
}

export interface CreateTeamDto {
  name: string;
  tag: string;
  captain_name: string;
  captain_email: string;
  logo_color?: string;
  members_count?: number;
}

export interface UpdateTeamDto extends Partial<CreateTeamDto> {}

export interface CreateRegistrationDto {
  tournament_id: string;
  team_id: string;
  status?: RegistrationStatus;
}

// Standardised API response wrappers
export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiListResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

// Extended request type with optional user identity from auth middleware
export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: string;
}

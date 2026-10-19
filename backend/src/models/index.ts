import mongoose, { Schema, Model } from 'mongoose';
import {
  TournamentFormat,
  TournamentStatus,
  MatchStatus,
  RegistrationStatus,
} from '../types/index.js';

// Helper to serialize Mongoose documents into clean TypeScript entities with 'id'
export function toEntity<T>(doc: any): T {
  if (!doc) return null as any;
  const raw = doc.toObject ? doc.toObject() : { ...doc };
  const id = raw._id ? String(raw._id) : raw.id;
  delete raw._id;
  delete raw.__v;
  return { ...raw, id } as T;
}

// ─── Game Schema ─────────────────────────────────────────────────────────────
export interface IGame {
  _id: string;
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

const gameSchema = new Schema<IGame>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    platform: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    max_players_per_team: { type: Number, required: true, default: 5 },
    release_year: { type: Number, required: true },
    icon_theme: { type: String, default: 'gamepad' },
    banner_color: { type: String, default: '#8B7CF6' },
    is_active: { type: Boolean, default: true },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String },
  },
  { collection: 'games', versionKey: false }
);

// ─── Tournament Schema ───────────────────────────────────────────────────────
export interface ITournament {
  _id: string;
  title: string;
  game_id: string;
  format: TournamentFormat;
  status: TournamentStatus;
  start_date: string;
  end_date: string;
  max_teams: number;
  prize_pool: number;
  description: string;
  rules?: string;
  created_at: string;
  updated_at?: string;
}

const tournamentSchema = new Schema<ITournament>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    game_id: { type: String, required: true, index: true },
    format: {
      type: String,
      required: true,
      enum: ['Single Elimination', 'Double Elimination', 'Round Robin', 'Swiss'],
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'registration_open', 'in_progress', 'completed', 'cancelled'],
      default: 'registration_open',
      index: true,
    },
    start_date: { type: String, required: true },
    end_date: { type: String, required: true },
    max_teams: { type: Number, required: true, default: 8 },
    prize_pool: { type: Number, required: true, default: 0 },
    description: { type: String, default: '', trim: true },
    rules: { type: String, default: '' },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String },
  },
  { collection: 'tournaments', versionKey: false }
);

// ─── Team Schema ─────────────────────────────────────────────────────────────
export interface ITeam {
  _id: string;
  name: string;
  tag: string;
  captain_name: string;
  captain_email: string;
  logo_color: string;
  members_count: number;
  created_at: string;
  updated_at?: string;
}

const teamSchema = new Schema<ITeam>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    tag: { type: String, required: true, trim: true, uppercase: true, index: true },
    captain_name: { type: String, required: true, trim: true },
    captain_email: { type: String, required: true, trim: true, lowercase: true },
    logo_color: { type: String, default: '#8B7CF6' },
    members_count: { type: Number, default: 5 },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String },
  },
  { collection: 'teams', versionKey: false }
);

// ─── Match Schema ────────────────────────────────────────────────────────────
export interface IMatch {
  _id: string;
  tournament_id: string;
  team1_id: string;
  team2_id: string;
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

const matchSchema = new Schema<IMatch>(
  {
    _id: { type: String, required: true },
    tournament_id: { type: String, required: true, index: true },
    team1_id: { type: String, required: true, index: true },
    team2_id: { type: String, required: true, index: true },
    round: { type: String, default: 'Round 1' },
    round_number: { type: Number, default: 1 },
    scheduled_at: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    team1_score: { type: Number, default: 0 },
    team2_score: { type: Number, default: 0 },
    winner_id: { type: String, default: null },
    notes: { type: String, default: '' },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String },
  },
  { collection: 'matches', versionKey: false }
);

// ─── Registration Schema ─────────────────────────────────────────────────────
export interface IRegistration {
  _id: string;
  tournament_id: string;
  team_id: string;
  status: RegistrationStatus;
  registered_at: string;
  seed_number?: number;
}

const registrationSchema = new Schema<IRegistration>(
  {
    _id: { type: String, required: true },
    tournament_id: { type: String, required: true, index: true },
    team_id: { type: String, required: true, index: true },
    status: {
      type: String,
      required: true,
      enum: ['confirmed', 'pending', 'waitlist', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
    registered_at: { type: String, default: () => new Date().toISOString() },
    seed_number: { type: Number },
  },
  { collection: 'registrations', versionKey: false }
);

// Prevent mongoose model overwrite error during hot reloads or multiple imports
export const GameModel: Model<IGame> =
  mongoose.models.Game || mongoose.model<IGame>('Game', gameSchema);

export const TournamentModel: Model<ITournament> =
  mongoose.models.Tournament || mongoose.model<ITournament>('Tournament', tournamentSchema);

export const TeamModel: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>('Team', teamSchema);

export const MatchModel: Model<IMatch> =
  mongoose.models.Match || mongoose.model<IMatch>('Match', matchSchema);

export const RegistrationModel: Model<IRegistration> =
  mongoose.models.Registration || mongoose.model<IRegistration>('Registration', registrationSchema);

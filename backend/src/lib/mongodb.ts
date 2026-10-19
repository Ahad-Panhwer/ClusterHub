import mongoose from 'mongoose';
import { config, isMongoConfigured } from '../config/index.js';
import {
  GameModel,
  TournamentModel,
  TeamModel,
  MatchModel,
  RegistrationModel,
} from '../models/index.js';
import {
  seedGames,
  seedTeams,
  seedTournaments,
  seedMatches,
  seedRegistrations,
} from './store.js';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.__mongooseCache || { conn: null, promise: null };
if (!global.__mongooseCache) {
  global.__mongooseCache = cached;
}

/**
 * Connect to MongoDB Atlas with connection caching for long-running servers and Vercel serverless.
 */
export async function connectMongo(): Promise<typeof mongoose | null> {
  if (!isMongoConfigured()) {
    return null;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(config.mongodb.uri, opts).then((m) => {
      console.log('🍃 Connected to MongoDB Atlas successfully.');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    console.error('❌ Failed to connect to MongoDB Atlas:', error);
    throw error;
  }

  return cached.conn;
}

/**
 * Checks if MongoDB is currently in an active connected state.
 */
export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Automatically seeds initial demo data into MongoDB Atlas if collections are empty.
 */
export async function seedMongoIfEmpty(): Promise<void> {
  if (!isMongoConfigured()) return;

  try {
    await connectMongo();
    const gameCount = await GameModel.countDocuments();
    if (gameCount > 0) {
      return; // Already populated
    }

    console.log('🌱 MongoDB Atlas is empty. Auto-seeding initial tournament data...');

    // 1. Seed Games
    for (const g of seedGames) {
      await GameModel.updateOne(
        { _id: g.id },
        {
          $set: {
            _id: g.id,
            title: g.title,
            genre: g.genre,
            platform: g.platform,
            description: g.description,
            max_players_per_team: g.max_players_per_team,
            release_year: g.release_year,
            icon_theme: g.icon_theme,
            banner_color: g.banner_color,
            is_active: g.is_active,
            created_at: g.created_at,
          },
        },
        { upsert: true }
      );
    }

    // 2. Seed Teams
    for (const t of seedTeams) {
      await TeamModel.updateOne(
        { _id: t.id },
        {
          $set: {
            _id: t.id,
            name: t.name,
            tag: t.tag,
            captain_name: t.captain_name,
            captain_email: t.captain_email,
            logo_color: t.logo_color,
            members_count: t.members_count,
            created_at: t.created_at,
          },
        },
        { upsert: true }
      );
    }

    // 3. Seed Tournaments
    for (const tourn of seedTournaments) {
      await TournamentModel.updateOne(
        { _id: tourn.id },
        {
          $set: {
            _id: tourn.id,
            title: tourn.title,
            game_id: tourn.game_id,
            format: tourn.format,
            status: tourn.status,
            start_date: tourn.start_date,
            end_date: tourn.end_date,
            max_teams: tourn.max_teams,
            prize_pool: tourn.prize_pool,
            description: tourn.description,
            rules: tourn.rules ?? '',
            created_at: tourn.created_at,
          },
        },
        { upsert: true }
      );
    }

    // 4. Seed Registrations
    for (const reg of seedRegistrations) {
      await RegistrationModel.updateOne(
        { _id: reg.id },
        {
          $set: {
            _id: reg.id,
            tournament_id: reg.tournament_id,
            team_id: reg.team_id,
            status: reg.status,
            registered_at: reg.registered_at,
            seed_number: reg.seed_number,
          },
        },
        { upsert: true }
      );
    }

    // 5. Seed Matches
    for (const m of seedMatches) {
      await MatchModel.updateOne(
        { _id: m.id },
        {
          $set: {
            _id: m.id,
            tournament_id: m.tournament_id,
            team1_id: m.team1_id,
            team2_id: m.team2_id,
            round: m.round,
            round_number: m.round_number,
            scheduled_at: m.scheduled_at,
            status: m.status,
            team1_score: m.team1_score,
            team2_score: m.team2_score,
            winner_id: m.winner_id,
            notes: m.notes ?? '',
            created_at: m.created_at,
          },
        },
        { upsert: true }
      );
    }

    console.log('✅ MongoDB Atlas auto-seeding completed successfully!');
  } catch (err) {
    console.error('⚠️ MongoDB Atlas auto-seeding warning:', err);
  }
}

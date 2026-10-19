/**
 * MongoDB Atlas Seeding Script
 * Seeds or resets the ClusterHub database on MongoDB Atlas.
 *
 * Usage:
 *   npm --prefix backend run seed:mongo
 *   npm --prefix backend run seed:mongo -- --force
 */

import { connectMongo } from '../lib/mongodb.js';
import { isMongoConfigured } from '../config/index.js';
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
} from '../lib/store.js';

async function main() {
  console.log('🚀 ClusterHub MongoDB Atlas Seeder');
  console.log('────────────────────────────────────');

  if (!isMongoConfigured()) {
    console.error('❌ Error: MONGODB_URI is not configured in backend/.env.local or environment variables.');
    console.error('👉 Please add MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/clusterhub');
    process.exit(1);
  }

  const isForce = process.argv.includes('--force');

  try {
    await connectMongo();

    if (isForce) {
      console.log('🧹 Force flag detected. Dropping existing collections...');
      await Promise.all([
        GameModel.deleteMany({}),
        TournamentModel.deleteMany({}),
        TeamModel.deleteMany({}),
        MatchModel.deleteMany({}),
        RegistrationModel.deleteMany({}),
      ]);
      console.log('✨ Collections wiped.');
    }

    console.log(`📦 Upserting ${seedGames.length} games...`);
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

    console.log(`👥 Upserting ${seedTeams.length} teams...`);
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

    console.log(`🏆 Upserting ${seedTournaments.length} tournaments...`);
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

    console.log(`📝 Upserting ${seedRegistrations.length} registrations...`);
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

    console.log(`⚔️ Upserting ${seedMatches.length} matches...`);
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

    console.log('────────────────────────────────────');
    console.log('🎉 MongoDB Atlas seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

main();

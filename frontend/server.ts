import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Types
import {
  Game,
  Tournament,
  Match,
  Team,
  Registration,
  TournamentFormat,
  TournamentStatus,
  MatchStatus,
  RegistrationStatus,
} from './src/types';
import {
  INITIAL_GAMES,
  INITIAL_TOURNAMENTS,
  INITIAL_TEAMS,
  INITIAL_MATCHES,
  INITIAL_REGISTRATIONS,
} from './src/services/mockData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory or file-backed database store
let dbGames: Game[] = [...INITIAL_GAMES];
let dbTournaments: Tournament[] = [...INITIAL_TOURNAMENTS];
let dbTeams: Team[] = [...INITIAL_TEAMS];
let dbMatches: Match[] = [...INITIAL_MATCHES];
let dbRegistrations: Registration[] = [...INITIAL_REGISTRATIONS];

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'ClusterHub API',
      timestamp: new Date().toISOString(),
      counts: {
        games: dbGames.length,
        tournaments: dbTournaments.length,
        matches: dbMatches.length,
        teams: dbTeams.length,
        registrations: dbRegistrations.length,
      },
    });
  });

  // ==========================================
  // GAMES ENDPOINTS
  // ==========================================
  // GET /api/games
  app.get('/api/games', (req: Request, res: Response) => {
    res.json(dbGames);
  });

  // GET /api/games/:id
  app.get('/api/games/:id', (req: Request, res: Response) => {
    const game = dbGames.find((g) => g.id === req.params.id);
    if (!game) {
      res.status(404).json({ error: 'Game not found', message: `No game found with id ${req.params.id}` });
      return;
    }
    res.json(game);
  });

  // POST /api/games
  app.post('/api/games', (req: Request, res: Response) => {
    const { title, genre, platform, description, max_players_per_team, release_year, banner_color, icon_theme } = req.body;

    // Field validations
    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Validation Error', message: 'Field "title" is required.' });
      return;
    }
    if (!genre || typeof genre !== 'string' || !genre.trim()) {
      res.status(400).json({ error: 'Validation Error', message: 'Field "genre" is required.' });
      return;
    }
    if (!platform || typeof platform !== 'string' || !platform.trim()) {
      res.status(400).json({ error: 'Validation Error', message: 'Field "platform" is required.' });
      return;
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      res.status(400).json({ error: 'Validation Error', message: 'Field "description" is required.' });
      return;
    }
    const players = Number(max_players_per_team);
    if (isNaN(players) || players < 1 || players > 64) {
      res.status(400).json({ error: 'Validation Error', message: 'Field "max_players_per_team" must be a number between 1 and 64.' });
      return;
    }
    const year = Number(release_year);
    if (isNaN(year) || year < 1980 || year > 2030) {
      res.status(400).json({ error: 'Validation Error', message: 'Field "release_year" must be a valid year (1980-2030).' });
      return;
    }

    const newGame: Game = {
      id: `game-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      genre: genre.trim(),
      platform: platform.trim(),
      description: description.trim(),
      max_players_per_team: players,
      release_year: year,
      banner_color: banner_color || '#8B7CF6',
      icon_theme: icon_theme || 'gamepad',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    dbGames.unshift(newGame);
    res.status(201).json(newGame);
  });

  // PUT /api/games/:id
  app.put('/api/games/:id', (req: Request, res: Response) => {
    const idx = dbGames.findIndex((g) => g.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Game not found', message: `No game found with id ${req.params.id}` });
      return;
    }

    const current = dbGames[idx];
    const { title, genre, platform, description, max_players_per_team, release_year, banner_color, icon_theme, is_active } = req.body;

    if (title !== undefined && (!title || !title.trim())) {
      res.status(400).json({ error: 'Validation Error', message: 'Field "title" cannot be empty.' });
      return;
    }
    if (max_players_per_team !== undefined && (isNaN(Number(max_players_per_team)) || Number(max_players_per_team) < 1)) {
      res.status(400).json({ error: 'Validation Error', message: 'Field "max_players_per_team" must be at least 1.' });
      return;
    }

    const updated: Game = {
      ...current,
      title: title !== undefined ? title.trim() : current.title,
      genre: genre !== undefined ? genre.trim() : current.genre,
      platform: platform !== undefined ? platform.trim() : current.platform,
      description: description !== undefined ? description.trim() : current.description,
      max_players_per_team: max_players_per_team !== undefined ? Number(max_players_per_team) : current.max_players_per_team,
      release_year: release_year !== undefined ? Number(release_year) : current.release_year,
      banner_color: banner_color !== undefined ? banner_color : current.banner_color,
      icon_theme: icon_theme !== undefined ? icon_theme : current.icon_theme,
      is_active: is_active !== undefined ? Boolean(is_active) : current.is_active,
      updated_at: new Date().toISOString(),
    };

    dbGames[idx] = updated;
    res.json(updated);
  });

  // DELETE /api/games/:id
  app.delete('/api/games/:id', (req: Request, res: Response) => {
    const idx = dbGames.findIndex((g) => g.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Game not found', message: `No game found with id ${req.params.id}` });
      return;
    }
    dbGames.splice(idx, 1);
    res.status(200).json({ success: true, message: `Game ${req.params.id} successfully deleted.` });
  });

  // ==========================================
  // TOURNAMENTS ENDPOINTS
  // ==========================================
  // GET /api/tournaments
  app.get('/api/tournaments', (req: Request, res: Response) => {
    const list = dbTournaments.map((t) => ({
      ...t,
      game: dbGames.find((g) => g.id === t.game_id),
      registered_teams_count: dbRegistrations.filter((r) => r.tournament_id === t.id && r.status === 'confirmed').length,
    }));
    res.json(list);
  });

  // GET /api/tournaments/:id
  app.get('/api/tournaments/:id', (req: Request, res: Response) => {
    const t = dbTournaments.find((item) => item.id === req.params.id);
    if (!t) {
      res.status(404).json({ error: 'Tournament not found', message: `No tournament with id ${req.params.id}` });
      return;
    }
    res.json({
      ...t,
      game: dbGames.find((g) => g.id === t.game_id),
      registered_teams_count: dbRegistrations.filter((r) => r.tournament_id === t.id && r.status === 'confirmed').length,
    });
  });

  // POST /api/tournaments
  app.post('/api/tournaments', (req: Request, res: Response) => {
    const { title, game_id, format, status, start_date, end_date, max_teams, prize_pool, description, rules } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Validation Error', message: 'Field "title" is required.' });
      return;
    }
    if (!game_id) {
      res.status(400).json({ error: 'Validation Error', message: 'Field "game_id" is required.' });
      return;
    }
    const gameExists = dbGames.some((g) => g.id === game_id);
    if (!gameExists) {
      res.status(400).json({ error: 'Validation Error', message: `Referenced game "${game_id}" does not exist.` });
      return;
    }
    if (!start_date || isNaN(Date.parse(start_date))) {
      res.status(400).json({ error: 'Validation Error', message: 'Valid "start_date" ISO string is required.' });
      return;
    }
    if (!end_date || isNaN(Date.parse(end_date))) {
      res.status(400).json({ error: 'Validation Error', message: 'Valid "end_date" ISO string is required.' });
      return;
    }
    if (new Date(start_date) >= new Date(end_date)) {
      res.status(400).json({ error: 'Validation Error', message: '"end_date" must be after "start_date".' });
      return;
    }
    const maxTeamsNum = Number(max_teams);
    if (isNaN(maxTeamsNum) || maxTeamsNum < 2 || maxTeamsNum > 128) {
      res.status(400).json({ error: 'Validation Error', message: '"max_teams" must be a number between 2 and 128.' });
      return;
    }
    const pool = Number(prize_pool);
    if (isNaN(pool) || pool < 0) {
      res.status(400).json({ error: 'Validation Error', message: '"prize_pool" cannot be negative.' });
      return;
    }
    if (!description || !description.trim()) {
      res.status(400).json({ error: 'Validation Error', message: 'Field "description" is required.' });
      return;
    }

    const newTourn: Tournament = {
      id: `tourn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      game_id,
      format: (format as TournamentFormat) || 'Single Elimination',
      status: (status as TournamentStatus) || 'registration_open',
      start_date: new Date(start_date).toISOString(),
      end_date: new Date(end_date).toISOString(),
      max_teams: maxTeamsNum,
      prize_pool: pool,
      description: description.trim(),
      rules: rules ? rules.trim() : undefined,
      created_at: new Date().toISOString(),
    };

    dbTournaments.unshift(newTourn);

    res.status(201).json({
      ...newTourn,
      game: dbGames.find((g) => g.id === newTourn.game_id),
      registered_teams_count: 0,
    });
  });

  // PUT /api/tournaments/:id
  app.put('/api/tournaments/:id', (req: Request, res: Response) => {
    const idx = dbTournaments.findIndex((t) => t.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Tournament not found', message: `No tournament with id ${req.params.id}` });
      return;
    }

    const current = dbTournaments[idx];
    const { title, game_id, format, status, start_date, end_date, max_teams, prize_pool, description, rules } = req.body;

    if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
      res.status(400).json({ error: 'Validation Error', message: '"end_date" must be after "start_date".' });
      return;
    }

    const updated: Tournament = {
      ...current,
      title: title !== undefined ? title.trim() : current.title,
      game_id: game_id !== undefined ? game_id : current.game_id,
      format: format !== undefined ? format : current.format,
      status: status !== undefined ? status : current.status,
      start_date: start_date !== undefined ? new Date(start_date).toISOString() : current.start_date,
      end_date: end_date !== undefined ? new Date(end_date).toISOString() : current.end_date,
      max_teams: max_teams !== undefined ? Number(max_teams) : current.max_teams,
      prize_pool: prize_pool !== undefined ? Number(prize_pool) : current.prize_pool,
      description: description !== undefined ? description.trim() : current.description,
      rules: rules !== undefined ? rules.trim() : current.rules,
      updated_at: new Date().toISOString(),
    };

    dbTournaments[idx] = updated;

    res.json({
      ...updated,
      game: dbGames.find((g) => g.id === updated.game_id),
      registered_teams_count: dbRegistrations.filter((r) => r.tournament_id === updated.id && r.status === 'confirmed').length,
    });
  });

  // DELETE /api/tournaments/:id
  app.delete('/api/tournaments/:id', (req: Request, res: Response) => {
    const idx = dbTournaments.findIndex((t) => t.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Tournament not found', message: `No tournament with id ${req.params.id}` });
      return;
    }
    const tournId = req.params.id;
    dbTournaments.splice(idx, 1);
    // Cascade delete associated matches and registrations
    dbMatches = dbMatches.filter((m) => m.tournament_id !== tournId);
    dbRegistrations = dbRegistrations.filter((r) => r.tournament_id !== tournId);

    res.status(200).json({ success: true, message: `Tournament ${tournId} and related fixtures removed.` });
  });

  // ==========================================
  // MATCHES ENDPOINTS
  // ==========================================
  // GET /api/matches
  app.get('/api/matches', (req: Request, res: Response) => {
    let list = dbMatches;
    if (req.query.tournament_id) {
      list = list.filter((m) => m.tournament_id === req.query.tournament_id);
    }
    const populated = list.map((m) => ({
      ...m,
      tournament: dbTournaments.find((t) => t.id === m.tournament_id),
      team1: dbTeams.find((tm) => tm.id === m.team1_id),
      team2: dbTeams.find((tm) => tm.id === m.team2_id),
    }));
    res.json(populated);
  });

  // GET /api/matches/:id
  app.get('/api/matches/:id', (req: Request, res: Response) => {
    const m = dbMatches.find((match) => match.id === req.params.id);
    if (!m) {
      res.status(404).json({ error: 'Match not found', message: `No match with id ${req.params.id}` });
      return;
    }
    res.json({
      ...m,
      tournament: dbTournaments.find((t) => t.id === m.tournament_id),
      team1: dbTeams.find((tm) => tm.id === m.team1_id),
      team2: dbTeams.find((tm) => tm.id === m.team2_id),
    });
  });

  // POST /api/matches
  app.post('/api/matches', (req: Request, res: Response) => {
    const { tournament_id, team1_id, team2_id, round, round_number, scheduled_at, notes } = req.body;

    if (!tournament_id) {
      res.status(400).json({ error: 'Validation Error', message: 'Field "tournament_id" is required.' });
      return;
    }
    if (!team1_id || !team2_id) {
      res.status(400).json({ error: 'Validation Error', message: 'Both "team1_id" and "team2_id" are required.' });
      return;
    }
    if (team1_id === team2_id) {
      res.status(400).json({ error: 'Validation Error', message: 'Team 1 and Team 2 must be distinct competitors.' });
      return;
    }
    if (!round || !round.trim()) {
      res.status(400).json({ error: 'Validation Error', message: 'Field "round" is required.' });
      return;
    }
    if (!scheduled_at || isNaN(Date.parse(scheduled_at))) {
      res.status(400).json({ error: 'Validation Error', message: 'Valid "scheduled_at" ISO date string is required.' });
      return;
    }

    const newMatch: Match = {
      id: `match-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tournament_id,
      team1_id,
      team2_id,
      round: round.trim(),
      round_number: round_number ? Number(round_number) : 1,
      scheduled_at: new Date(scheduled_at).toISOString(),
      status: 'scheduled',
      team1_score: 0,
      team2_score: 0,
      winner_id: null,
      notes: notes ? notes.trim() : '',
      created_at: new Date().toISOString(),
    };

    dbMatches.unshift(newMatch);

    res.status(201).json({
      ...newMatch,
      tournament: dbTournaments.find((t) => t.id === newMatch.tournament_id),
      team1: dbTeams.find((tm) => tm.id === newMatch.team1_id),
      team2: dbTeams.find((tm) => tm.id === newMatch.team2_id),
    });
  });

  // PUT /api/matches/:id
  app.put('/api/matches/:id', (req: Request, res: Response) => {
    const idx = dbMatches.findIndex((m) => m.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Match not found', message: `No match with id ${req.params.id}` });
      return;
    }

    const current = dbMatches[idx];
    const { scheduled_at, round, round_number, status, team1_score, team2_score, winner_id, notes } = req.body;

    let computedWinner = winner_id;
    if (status === 'completed' && computedWinner === undefined && team1_score !== undefined && team2_score !== undefined) {
      if (Number(team1_score) > Number(team2_score)) computedWinner = current.team1_id;
      else if (Number(team2_score) > Number(team1_score)) computedWinner = current.team2_id;
      else computedWinner = null;
    }

    const updated: Match = {
      ...current,
      scheduled_at: scheduled_at !== undefined ? new Date(scheduled_at).toISOString() : current.scheduled_at,
      round: round !== undefined ? round.trim() : current.round,
      round_number: round_number !== undefined ? Number(round_number) : current.round_number,
      status: status !== undefined ? (status as MatchStatus) : current.status,
      team1_score: team1_score !== undefined ? Number(team1_score) : current.team1_score,
      team2_score: team2_score !== undefined ? Number(team2_score) : current.team2_score,
      winner_id: computedWinner !== undefined ? computedWinner : current.winner_id,
      notes: notes !== undefined ? notes.trim() : current.notes,
      updated_at: new Date().toISOString(),
    };

    dbMatches[idx] = updated;

    res.json({
      ...updated,
      tournament: dbTournaments.find((t) => t.id === updated.tournament_id),
      team1: dbTeams.find((tm) => tm.id === updated.team1_id),
      team2: dbTeams.find((tm) => tm.id === updated.team2_id),
    });
  });

  // DELETE /api/matches/:id
  app.delete('/api/matches/:id', (req: Request, res: Response) => {
    const idx = dbMatches.findIndex((m) => m.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Match not found', message: `No match with id ${req.params.id}` });
      return;
    }
    const matchId = req.params.id;
    dbMatches.splice(idx, 1);
    res.status(200).json({ success: true, message: `Match ${matchId} deleted.` });
  });

  // ==========================================
  // TEAMS ENDPOINTS
  // ==========================================
  app.get('/api/teams', (req: Request, res: Response) => {
    res.json(dbTeams);
  });

  app.get('/api/teams/:id', (req: Request, res: Response) => {
    const team = dbTeams.find((t) => t.id === req.params.id);
    if (!team) {
      res.status(404).json({ error: 'Team not found', message: `No team with id ${req.params.id}` });
      return;
    }
    res.json(team);
  });

  app.post('/api/teams', (req: Request, res: Response) => {
    const { name, tag, captain_name, captain_email, logo_color, members_count } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Validation Error', message: 'Field "name" is required.' });
      return;
    }
    if (!tag || !tag.trim() || tag.trim().length < 2 || tag.trim().length > 5) {
      res.status(400).json({ error: 'Validation Error', message: 'Field "tag" must be between 2 and 5 characters.' });
      return;
    }
    if (!captain_name || !captain_name.trim()) {
      res.status(400).json({ error: 'Validation Error', message: 'Field "captain_name" is required.' });
      return;
    }
    if (!captain_email || !captain_email.includes('@')) {
      res.status(400).json({ error: 'Validation Error', message: 'Valid "captain_email" is required.' });
      return;
    }

    const newTeam: Team = {
      id: `team-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      tag: tag.trim().toUpperCase(),
      captain_name: captain_name.trim(),
      captain_email: captain_email.trim(),
      logo_color: logo_color || '#8B7CF6',
      members_count: members_count ? Number(members_count) : 5,
      created_at: new Date().toISOString(),
    };

    dbTeams.unshift(newTeam);
    res.status(201).json(newTeam);
  });

  app.put('/api/teams/:id', (req: Request, res: Response) => {
    const idx = dbTeams.findIndex((t) => t.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Team not found', message: `No team with id ${req.params.id}` });
      return;
    }
    const current = dbTeams[idx];
    const { name, tag, captain_name, captain_email, logo_color, members_count } = req.body;

    const updated: Team = {
      ...current,
      name: name !== undefined ? name.trim() : current.name,
      tag: tag !== undefined ? tag.trim().toUpperCase() : current.tag,
      captain_name: captain_name !== undefined ? captain_name.trim() : current.captain_name,
      captain_email: captain_email !== undefined ? captain_email.trim() : current.captain_email,
      logo_color: logo_color !== undefined ? logo_color : current.logo_color,
      members_count: members_count !== undefined ? Number(members_count) : current.members_count,
      updated_at: new Date().toISOString(),
    };

    dbTeams[idx] = updated;
    res.json(updated);
  });

  app.delete('/api/teams/:id', (req: Request, res: Response) => {
    const idx = dbTeams.findIndex((t) => t.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Team not found', message: `No team with id ${req.params.id}` });
      return;
    }
    dbTeams.splice(idx, 1);
    res.status(200).json({ success: true, message: `Team ${req.params.id} deleted.` });
  });

  // ==========================================
  // REGISTRATIONS ENDPOINTS
  // ==========================================
  app.get('/api/registrations', (req: Request, res: Response) => {
    let list = dbRegistrations;
    if (req.query.tournament_id) {
      list = list.filter((r) => r.tournament_id === req.query.tournament_id);
    }
    const populated = list.map((r) => ({
      ...r,
      tournament: dbTournaments.find((t) => t.id === r.tournament_id),
      team: dbTeams.find((tm) => tm.id === r.team_id),
    }));
    res.json(populated);
  });

  app.post('/api/registrations', (req: Request, res: Response) => {
    const { tournament_id, team_id, status } = req.body;
    if (!tournament_id || !team_id) {
      res.status(400).json({ error: 'Validation Error', message: 'Both "tournament_id" and "team_id" are required.' });
      return;
    }

    const alreadyReg = dbRegistrations.find(
      (r) => r.tournament_id === tournament_id && r.team_id === team_id
    );
    if (alreadyReg) {
      res.status(409).json({ error: 'Conflict', message: 'This team is already registered for this tournament.' });
      return;
    }

    const targetTourn = dbTournaments.find((t) => t.id === tournament_id);
    const confirmedCount = dbRegistrations.filter(
      (r) => r.tournament_id === tournament_id && r.status === 'confirmed'
    ).length;

    let assignedStatus: RegistrationStatus = (status as RegistrationStatus) || 'confirmed';
    if (targetTourn && confirmedCount >= targetTourn.max_teams && assignedStatus === 'confirmed') {
      assignedStatus = 'waitlist';
    }

    const newReg: Registration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tournament_id,
      team_id,
      status: assignedStatus,
      registered_at: new Date().toISOString(),
      seed_number: confirmedCount + 1,
    };

    dbRegistrations.push(newReg);

    res.status(201).json({
      ...newReg,
      tournament: dbTournaments.find((t) => t.id === newReg.tournament_id),
      team: dbTeams.find((tm) => tm.id === newReg.team_id),
    });
  });

  app.patch('/api/registrations/:id', (req: Request, res: Response) => {
    const idx = dbRegistrations.findIndex((r) => r.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Registration not found', message: `No registration with id ${req.params.id}` });
      return;
    }
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ error: 'Validation Error', message: 'Field "status" is required.' });
      return;
    }

    dbRegistrations[idx].status = status as RegistrationStatus;
    res.json({
      ...dbRegistrations[idx],
      tournament: dbTournaments.find((t) => t.id === dbRegistrations[idx].tournament_id),
      team: dbTeams.find((tm) => tm.id === dbRegistrations[idx].team_id),
    });
  });

  app.delete('/api/registrations/:id', (req: Request, res: Response) => {
    const idx = dbRegistrations.findIndex((r) => r.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Registration not found', message: `No registration with id ${req.params.id}` });
      return;
    }
    const regId = req.params.id;
    dbRegistrations.splice(idx, 1);
    res.status(200).json({ success: true, message: `Registration ${regId} deleted.` });
  });

  // ==========================================
  // LEADERBOARD ENDPOINT
  // ==========================================
  app.get('/api/leaderboard', (req: Request, res: Response) => {
    const tournamentId = req.query.tournament_id as string | undefined;
    let completed = dbMatches.filter((m) => m.status === 'completed');
    if (tournamentId && tournamentId !== 'all') {
      completed = completed.filter((m) => m.tournament_id === tournamentId);
    }

    const map = new Map<string, { played: number; wins: number; losses: number; points: number }>();
    for (const team of dbTeams) {
      map.set(team.id, { played: 0, wins: 0, losses: 0, points: 0 });
    }

    for (const match of completed) {
      const stats1 = map.get(match.team1_id);
      const stats2 = map.get(match.team2_id);
      if (stats1) stats1.played += 1;
      if (stats2) stats2.played += 1;

      const winnerId = match.winner_id || (match.team1_score > match.team2_score ? match.team1_id : match.team2_score > match.team1_score ? match.team2_id : null);
      if (winnerId === match.team1_id && stats1 && stats2) {
        stats1.wins += 1;
        stats1.points += 3;
        stats2.losses += 1;
      } else if (winnerId === match.team2_id && stats1 && stats2) {
        stats2.wins += 1;
        stats2.points += 3;
        stats1.losses += 1;
      }
    }

    const entries = dbTeams.map((team) => {
      const stats = map.get(team.id) || { played: 0, wins: 0, losses: 0, points: 0 };
      const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
      return {
        team_id: team.id,
        team,
        matches_played: stats.played,
        wins: stats.wins,
        losses: stats.losses,
        points: stats.points,
        win_rate: winRate,
        rank: 0,
      };
    });

    entries.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.win_rate !== a.win_rate) return b.win_rate - a.win_rate;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.team.name.localeCompare(b.team.name);
    });

    const ranked = entries.map((e, i) => ({ ...e, rank: i + 1 }));
    res.json(ranked);
  });

  // ==========================================
  // VITE / STATIC CLIENT INTEGRATION
  // ==========================================
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClusterHub full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ClusterHub server:', err);
  process.exit(1);
});

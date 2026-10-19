import { Router, Request, Response } from 'express';
import { tournamentsRepo } from '../repositories/tournamentsRepo.js';
import { gamesRepo } from '../repositories/gamesRepo.js';
import { matchesRepo } from '../repositories/matchesRepo.js';
import { teamsRepo } from '../repositories/teamsRepo.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTournamentSchema, updateTournamentSchema } from '../validators/schemas.js';
import { LeaderboardEntry } from '../types/index.js';

export const tournamentsRouter = Router();

// GET /tournaments — list all tournaments
tournamentsRouter.get('/', async (_req: Request, res: Response) => {
  const tournaments = await tournamentsRepo.getAll();
  res.json(tournaments);
});

// GET /tournaments/:id — get one tournament
tournamentsRouter.get('/:id', async (req: Request, res: Response) => {
  const tournament = await tournamentsRepo.getById(req.params.id);
  if (!tournament) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Tournament not found: ${req.params.id}` } });
    return;
  }
  res.json(tournament);
});

// GET /tournaments/:id/leaderboard — leaderboard for a tournament
tournamentsRouter.get('/:id/leaderboard', async (req: Request, res: Response) => {
  const tournament = await tournamentsRepo.getById(req.params.id);
  if (!tournament) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Tournament not found: ${req.params.id}` } });
    return;
  }

  const [matches, teams] = await Promise.all([
    matchesRepo.getCompletedByTournament(req.params.id),
    teamsRepo.getAll(),
  ]);

  const leaderboard = calculateLeaderboard(teams, matches);
  res.json(leaderboard);
});

// POST /tournaments — create (protected)
tournamentsRouter.post('/', authenticate, validate(createTournamentSchema), async (req: Request, res: Response) => {
  // Verify referenced game exists
  const game = await gamesRepo.getById(req.body.game_id);
  if (!game) {
    res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: `Referenced game does not exist: ${req.body.game_id}` },
    });
    return;
  }

  const tournament = await tournamentsRepo.create(req.body);
  res.status(201).json(tournament);
});

// PATCH /tournaments/:id — update (protected)
tournamentsRouter.patch('/:id', authenticate, validate(updateTournamentSchema), async (req: Request, res: Response) => {
  const tournament = await tournamentsRepo.update(req.params.id, req.body);
  if (!tournament) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Tournament not found: ${req.params.id}` } });
    return;
  }
  res.json(tournament);
});

// PUT /tournaments/:id — alias for PATCH (frontend uses PUT)
tournamentsRouter.put('/:id', authenticate, validate(updateTournamentSchema), async (req: Request, res: Response) => {
  const tournament = await tournamentsRepo.update(req.params.id, req.body);
  if (!tournament) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Tournament not found: ${req.params.id}` } });
    return;
  }
  res.json(tournament);
});

// DELETE /tournaments/:id — delete (protected)
tournamentsRouter.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const tournament = await tournamentsRepo.getById(req.params.id);
  if (!tournament) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Tournament not found: ${req.params.id}` } });
    return;
  }

  const deleted = await tournamentsRepo.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Tournament not found: ${req.params.id}` } });
    return;
  }
  res.json({ success: true, message: `Tournament ${req.params.id} and related fixtures removed.` });
});

/** Calculate leaderboard standings from completed matches */
function calculateLeaderboard(teams: any[], matches: any[]): LeaderboardEntry[] {
  const map = new Map<string, { played: number; wins: number; losses: number; points: number }>();
  for (const team of teams) {
    map.set(team.id, { played: 0, wins: 0, losses: 0, points: 0 });
  }

  for (const match of matches) {
    const s1 = map.get(match.team1_id);
    const s2 = map.get(match.team2_id);
    if (s1) s1.played += 1;
    if (s2) s2.played += 1;

    const winnerId = match.winner_id ||
      (match.team1_score > match.team2_score ? match.team1_id :
        match.team2_score > match.team1_score ? match.team2_id : null);

    if (winnerId === match.team1_id && s1 && s2) {
      s1.wins += 1; s1.points += 3; s2.losses += 1;
    } else if (winnerId === match.team2_id && s1 && s2) {
      s2.wins += 1; s2.points += 3; s1.losses += 1;
    }
  }

  const entries: LeaderboardEntry[] = teams
    .filter((t) => map.has(t.id))
    .map((team) => {
      const stats = map.get(team.id)!;
      const win_rate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
      return { team_id: team.id, team, matches_played: stats.played, wins: stats.wins, losses: stats.losses, points: stats.points, win_rate, rank: 0 };
    });

  entries.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.win_rate !== a.win_rate) return b.win_rate - a.win_rate;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.team.name.localeCompare(b.team.name);
  });

  return entries.map((e, i) => ({ ...e, rank: i + 1 }));
}

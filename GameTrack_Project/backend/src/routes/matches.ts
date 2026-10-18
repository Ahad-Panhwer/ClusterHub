import { Router, Request, Response } from 'express';
import { matchesRepo } from '../repositories/matchesRepo.js';
import { tournamentsRepo } from '../repositories/tournamentsRepo.js';
import { registrationsRepo } from '../repositories/registrationsRepo.js';
import { teamsRepo } from '../repositories/teamsRepo.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createMatchSchema, updateMatchSchema } from '../validators/schemas.js';

export const matchesRouter = Router();

// GET /matches — list, optionally filtered by tournament_id or status
matchesRouter.get('/', async (req: Request, res: Response) => {
  const tournamentId = req.query.tournament_id as string | undefined;
  const status = req.query.status as string | undefined;
  
  let matches = await matchesRepo.getAll(tournamentId);
  if (status) matches = matches.filter((m) => m.status === status);
  
  res.json(matches);
});

// GET /matches/:id — get one match
matchesRouter.get('/:id', async (req: Request, res: Response) => {
  const match = await matchesRepo.getById(req.params.id);
  if (!match) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Match not found: ${req.params.id}` } });
    return;
  }
  res.json(match);
});

// POST /matches — create (protected)
matchesRouter.post('/', authenticate, validate(createMatchSchema), async (req: Request, res: Response) => {
  const { tournament_id, team1_id, team2_id } = req.body;

  // Verify tournament exists
  const tournament = await tournamentsRepo.getById(tournament_id);
  if (!tournament) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: `Tournament does not exist: ${tournament_id}` } });
    return;
  }

  // Verify both teams exist
  const [team1, team2] = await Promise.all([
    teamsRepo.getById(team1_id),
    teamsRepo.getById(team2_id),
  ]);
  if (!team1) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: `Team not found: ${team1_id}` } });
    return;
  }
  if (!team2) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: `Team not found: ${team2_id}` } });
    return;
  }

  // Verify both teams are registered for this tournament (active registrations)
  const [reg1, reg2] = await Promise.all([
    registrationsRepo.findExisting(tournament_id, team1_id),
    registrationsRepo.findExisting(tournament_id, team2_id),
  ]);
  if (!reg1 || reg1.status === 'cancelled') {
    res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: `Team ${team1_id} does not have an active registration for this tournament.` },
    });
    return;
  }
  if (!reg2 || reg2.status === 'cancelled') {
    res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: `Team ${team2_id} does not have an active registration for this tournament.` },
    });
    return;
  }

  const match = await matchesRepo.create(req.body);
  res.status(201).json(match);
});

const updateMatchHandler = async (req: Request, res: Response) => {
  // If completing, ensure scores are provided
  if (req.body.status === 'completed') {
    const existing = await matchesRepo.getById(req.params.id);
    if (existing) {
      const s1 = req.body.team1_score ?? existing.team1_score;
      const s2 = req.body.team2_score ?? existing.team2_score;
      if (s1 === undefined || s2 === undefined || s1 === null || s2 === null) {
        res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Scores must be provided when completing a match.' },
        });
        return;
      }
    }
  }

  const match = await matchesRepo.update(req.params.id, req.body);
  if (!match) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Match not found: ${req.params.id}` } });
    return;
  }
  res.json(match);
};

// PATCH /matches/:id — update schedule/result (protected)
matchesRouter.patch('/:id', authenticate, validate(updateMatchSchema), updateMatchHandler);

// PUT /matches/:id — alias for PATCH (frontend uses PUT)
matchesRouter.put('/:id', authenticate, validate(updateMatchSchema), updateMatchHandler);

// DELETE /matches/:id — delete (protected)
matchesRouter.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const deleted = await matchesRepo.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Match not found: ${req.params.id}` } });
    return;
  }
  res.json({ success: true, message: `Match ${req.params.id} deleted.` });
});

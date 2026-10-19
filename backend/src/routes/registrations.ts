import { Router, Request, Response } from 'express';
import { registrationsRepo } from '../repositories/registrationsRepo.js';
import { tournamentsRepo } from '../repositories/tournamentsRepo.js';
import { teamsRepo } from '../repositories/teamsRepo.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createRegistrationSchema, updateRegistrationStatusSchema } from '../validators/schemas.js';

export const registrationsRouter = Router();

// GET /registrations — list all registrations, optionally filtered by tournament_id
registrationsRouter.get('/', async (req: Request, res: Response) => {
  const tournamentId = req.query.tournament_id as string | undefined;
  const registrations = await registrationsRepo.getAll(tournamentId);
  res.json(registrations);
});

// GET /registrations/:id — get one registration
registrationsRouter.get('/:id', async (req: Request, res: Response) => {
  const reg = await registrationsRepo.getById(req.params.id);
  if (!reg) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Registration not found: ${req.params.id}` } });
    return;
  }
  res.json(reg);
});

// POST /registrations — create (protected)
registrationsRouter.post('/', authenticate, validate(createRegistrationSchema), async (req: Request, res: Response) => {
  const { tournament_id, team_id, status } = req.body;

  // Verify tournament exists
  const tournament = await tournamentsRepo.getById(tournament_id);
  if (!tournament) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: `Tournament does not exist: ${tournament_id}` } });
    return;
  }

  // Only allow registration when tournament is open
  if (tournament.status !== 'registration_open' && tournament.status !== 'draft') {
    res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: `Tournament "${tournament.title}" is not accepting registrations (status: ${tournament.status}).`,
      },
    });
    return;
  }

  // Verify team exists
  const team = await teamsRepo.getById(team_id);
  if (!team) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: `Team does not exist: ${team_id}` } });
    return;
  }

  // Check for duplicate registration
  const existing = await registrationsRepo.findExisting(tournament_id, team_id);
  if (existing) {
    res.status(409).json({
      error: { code: 'CONFLICT', message: 'This team is already registered for this tournament.' },
    });
    return;
  }

  // Determine status based on capacity
  const confirmedCount = await registrationsRepo.countConfirmed(tournament_id);
  let assignedStatus: 'confirmed' | 'waitlist' = 'confirmed';
  if (confirmedCount >= tournament.max_teams) {
    assignedStatus = 'waitlist';
  }

  const finalStatus = (status as any) ?? assignedStatus;
  const seedNumber = confirmedCount + 1;

  const registration = await registrationsRepo.create(req.body, finalStatus, seedNumber);
  res.status(201).json(registration);
});

// PATCH /registrations/:id — update status (protected)
registrationsRouter.patch('/:id', authenticate, validate(updateRegistrationStatusSchema), async (req: Request, res: Response) => {
  const reg = await registrationsRepo.updateStatus(req.params.id, req.body.status);
  if (!reg) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Registration not found: ${req.params.id}` } });
    return;
  }
  res.json(reg);
});

// DELETE /registrations/:id — delete/withdraw (protected)
registrationsRouter.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const deleted = await registrationsRepo.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Registration not found: ${req.params.id}` } });
    return;
  }
  res.json({ success: true, message: `Registration ${req.params.id} removed.` });
});

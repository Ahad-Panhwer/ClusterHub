import { Router, Request, Response } from 'express';
import { teamsRepo } from '../repositories/teamsRepo.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTeamSchema, updateTeamSchema } from '../validators/schemas.js';

export const teamsRouter = Router();

// GET /teams — list all teams
teamsRouter.get('/', async (_req: Request, res: Response) => {
  const teams = await teamsRepo.getAll();
  res.json(teams);
});

// GET /teams/:id — get one team
teamsRouter.get('/:id', async (req: Request, res: Response) => {
  const team = await teamsRepo.getById(req.params.id);
  if (!team) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Team not found: ${req.params.id}` } });
    return;
  }
  res.json(team);
});

// POST /teams — create (protected)
teamsRouter.post('/', authenticate, validate(createTeamSchema), async (req: Request, res: Response) => {
  // Check for duplicate tag
  const existing = await teamsRepo.findByTag(req.body.tag);
  if (existing) {
    res.status(409).json({
      error: { code: 'CONFLICT', message: `Team tag "${req.body.tag.toUpperCase()}" is already registered.` },
    });
    return;
  }

  const team = await teamsRepo.create(req.body);
  res.status(201).json(team);
});

// PATCH /teams/:id — update (protected)
teamsRouter.patch('/:id', authenticate, validate(updateTeamSchema), async (req: Request, res: Response) => {
  // If tag is being changed, check for duplicate
  if (req.body.tag) {
    const existing = await teamsRepo.findByTag(req.body.tag);
    if (existing && existing.id !== req.params.id) {
      res.status(409).json({
        error: { code: 'CONFLICT', message: `Team tag "${req.body.tag.toUpperCase()}" is already in use.` },
      });
      return;
    }
  }

  const team = await teamsRepo.update(req.params.id, req.body);
  if (!team) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Team not found: ${req.params.id}` } });
    return;
  }
  res.json(team);
});

// PUT /teams/:id — alias for PATCH (frontend uses PUT)
teamsRouter.put('/:id', authenticate, validate(updateTeamSchema), async (req: Request, res: Response) => {
  if (req.body.tag) {
    const existing = await teamsRepo.findByTag(req.body.tag);
    if (existing && existing.id !== req.params.id) {
      res.status(409).json({
        error: { code: 'CONFLICT', message: `Team tag "${req.body.tag.toUpperCase()}" is already in use.` },
      });
      return;
    }
  }
  const team = await teamsRepo.update(req.params.id, req.body);
  if (!team) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Team not found: ${req.params.id}` } });
    return;
  }
  res.json(team);
});

// DELETE /teams/:id — delete (protected)
teamsRouter.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const deleted = await teamsRepo.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Team not found: ${req.params.id}` } });
    return;
  }
  res.json({ success: true, message: `Team ${req.params.id} deleted.` });
});

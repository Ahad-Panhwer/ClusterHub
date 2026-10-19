import { Router, Request, Response } from 'express';
import { gamesRepo } from '../repositories/gamesRepo.js';
import { tournamentsRepo } from '../repositories/tournamentsRepo.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createGameSchema, updateGameSchema } from '../validators/schemas.js';

export const gamesRouter = Router();

// GET /games — list all games
gamesRouter.get('/', async (_req: Request, res: Response) => {
  const games = await gamesRepo.getAll();
  res.json(games);
});

// GET /games/:id — get one game
gamesRouter.get('/:id', async (req: Request, res: Response) => {
  const game = await gamesRepo.getById(req.params.id);
  if (!game) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Game not found: ${req.params.id}` } });
    return;
  }
  res.json(game);
});

// POST /games — create (protected)
gamesRouter.post('/', authenticate, validate(createGameSchema), async (req: Request, res: Response) => {
  const game = await gamesRepo.create(req.body);
  res.status(201).json(game);
});

// PATCH /games/:id — update (protected)
gamesRouter.patch('/:id', authenticate, validate(updateGameSchema), async (req: Request, res: Response) => {
  const game = await gamesRepo.update(req.params.id, req.body);
  if (!game) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Game not found: ${req.params.id}` } });
    return;
  }
  res.json(game);
});

// PUT /games/:id — alias for PATCH (frontend uses PUT)
gamesRouter.put('/:id', authenticate, validate(updateGameSchema), async (req: Request, res: Response) => {
  const game = await gamesRepo.update(req.params.id, req.body);
  if (!game) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Game not found: ${req.params.id}` } });
    return;
  }
  res.json(game);
});

// DELETE /games/:id — delete (protected)
gamesRouter.delete('/:id', authenticate, async (req: Request, res: Response) => {
  // Check for dependent tournaments
  const tournaments = await tournamentsRepo.getAll();
  const hasDependent = tournaments.some((t) => t.game_id === req.params.id);
  if (hasDependent) {
    res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'Cannot delete a game that has associated tournaments. Remove the tournaments first.',
      },
    });
    return;
  }

  const deleted = await gamesRepo.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Game not found: ${req.params.id}` } });
    return;
  }
  res.json({ success: true, message: `Game ${req.params.id} deleted.` });
});

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { config, isMongoConfigured, isSupabaseConfigured } from './config/index.js';
import { gamesRouter } from './routes/games.js';
import { tournamentsRouter } from './routes/tournaments.js';
import { matchesRouter } from './routes/matches.js';
import { teamsRouter } from './routes/teams.js';
import { registrationsRouter } from './routes/registrations.js';
import { leaderboardRouter } from './routes/leaderboard.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // ── Security headers ──────────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow server-to-server and same-origin requests (no origin header)
        if (!origin) return callback(null, true);
        if (config.frontendOrigins.includes('*') || config.frontendOrigins.includes(origin)) return callback(null, true);
        // Allow Vercel preview & production deployments
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        // In development, allow all
        if (!config.isProduction) return callback(null, true);
        callback(new Error(`CORS: Origin "${origin}" is not allowed.`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMIT', message: 'Too many requests. Please wait and retry.' } },
  });
  app.use(limiter);

  // Stricter limit for auth-adjacent endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
  });

  // ── Body parsing ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));

  // ── Health check ──────────────────────────────────────────────────────────
  const healthHandler = (_req: express.Request, res: express.Response) => {
    res.json({
      status: 'ok',
      service: 'ClusterHub API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      mode: isMongoConfigured()
        ? 'mongodb-atlas'
        : isSupabaseConfigured()
        ? 'supabase'
        : 'in-memory',
    });
  };

  app.get('/api/health', healthHandler);
  app.get('/api/v1/health', healthHandler);

  // Also support /health without prefix for Render health checks
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // ── API routes (support both /api and /api/v1 base paths) ─────────────────
  const routePairs: [string, express.Router][] = [
    ['/games', gamesRouter],
    ['/tournaments', tournamentsRouter],
    ['/matches', matchesRouter],
    ['/teams', teamsRouter],
    ['/registrations', registrationsRouter],
    ['/leaderboard', leaderboardRouter],
  ];

  for (const [subPath, router] of routePairs) {
    app.use(`/api${subPath}`, router);
    app.use(`/api/v1${subPath}`, router);
  }

  // ── Development info route ────────────────────────────────────────────────
  if (!config.isProduction) {
    app.get('/api', (_req, res) => {
      res.json({
        name: 'ClusterHub REST API',
        version: '1.0.0',
        mode: isMongoConfigured()
          ? 'mongodb-atlas'
          : isSupabaseConfigured()
          ? 'supabase-postgres'
          : 'in-memory-development',
        endpoints: [
          'GET  /api/health',
          'GET  /api/games',
          'POST /api/games',
          'GET  /api/games/:id',
          'PATCH /api/games/:id',
          'DELETE /api/games/:id',
          'GET  /api/tournaments',
          'POST /api/tournaments',
          'GET  /api/tournaments/:id',
          'PATCH /api/tournaments/:id',
          'DELETE /api/tournaments/:id',
          'GET  /api/tournaments/:id/leaderboard',
          'GET  /api/matches',
          'POST /api/matches',
          'GET  /api/matches/:id',
          'PATCH /api/matches/:id',
          'DELETE /api/matches/:id',
          'GET  /api/teams',
          'POST /api/teams',
          'GET  /api/teams/:id',
          'PATCH /api/teams/:id',
          'DELETE /api/teams/:id',
          'GET  /api/registrations',
          'POST /api/registrations',
          'GET  /api/registrations/:id',
          'PATCH /api/registrations/:id',
          'DELETE /api/registrations/:id',
          'GET  /api/leaderboard',
        ],
      });
    });
  }

  // ── 404 and error handlers (must be last) ─────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

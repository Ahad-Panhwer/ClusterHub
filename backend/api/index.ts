import { createApp } from '../src/app.js';
import { connectMongo, seedMongoIfEmpty } from '../src/lib/mongodb.js';
import { isMongoConfigured } from '../src/config/index.js';

const app = createApp();

/**
 * MongoDB init runs at most once per minute per serverless instance — not on
 * every request. Previously this handler awaited connectMongo() +
 * seedMongoIfEmpty() for EVERY request, so health checks also paid a full
 * connection attempt (and seeding query) before being answered.
 */
const INIT_RETRY_MS = 60_000;
let initPromise: Promise<void> | null = null;
let initStartedAt = 0;

function ensureMongoInit(): Promise<void> {
  if (!isMongoConfigured()) return Promise.resolve();
  if (initPromise && Date.now() - initStartedAt < INIT_RETRY_MS) {
    return initPromise;
  }
  initStartedAt = Date.now();
  initPromise = (async () => {
    try {
      await connectMongo();
      await seedMongoIfEmpty();
    } catch (err) {
      // Never let a database problem fail the request itself: repositories
      // fall back to the next data tier when MongoDB is unavailable.
      console.error('MongoDB Atlas serverless init error:', err);
    }
  })();
  return initPromise;
}

// Warm up on cold start, without blocking the first request.
void ensureMongoInit();

const FAST_PATHS = ['/', '/api', '/api/v1', '/health', '/api/health', '/api/v1/health'];

export default async function handler(req: any, res: any) {
  const path = String(req.url || '').split('?')[0];
  // Health/root endpoints must answer immediately and never wait on the DB.
  if (!FAST_PATHS.includes(path)) {
    await ensureMongoInit();
  }
  return app(req, res);
}

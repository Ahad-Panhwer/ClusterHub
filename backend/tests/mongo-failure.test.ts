/**
 * Regression test for the live outage of 2026-10-27:
 * MONGODB_URI was set but Atlas was unreachable, and every data endpoint
 * hung forever (no response) instead of answering.
 *
 * With an unreachable MongoDB, data endpoints must still respond in bounded
 * time — by falling back to the next data tier — and health must stay up.
 *
 * The env var is set BEFORE the app modules are imported (config is read at
 * import time), using a dynamic import. Nothing is listening on 127.0.0.1:27099.
 */

import request from 'supertest';
import type { Express } from 'express';

process.env.MONGODB_URI = 'mongodb://127.0.0.1:27099/clusterhub-regression';

let app: Express;

beforeAll(async () => {
  const m = await import('../src/app.js');
  app = m.createApp();
}, 30_000);

afterAll(() => {
  delete process.env.MONGODB_URI;
});

describe('Unreachable MongoDB (regression)', () => {
  it('GET /api/health still returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it(
    'GET /api/games responds with fallback data instead of hanging',
    async () => {
      const start = Date.now();
      const res = await request(app).get('/api/games');
      const elapsed = Date.now() - start;
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(elapsed).toBeLessThan(25_000);
    },
    30_000
  );

  it(
    'GET /api/tournaments responds instead of hanging (fast after cooldown)',
    async () => {
      const start = Date.now();
      const res = await request(app).get('/api/tournaments');
      const elapsed = Date.now() - start;
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Second request must not pay another full connection timeout:
      // the failure cooldown should make it (nearly) immediate.
      expect(elapsed).toBeLessThan(10_000);
    },
    30_000
  );

  it('GET /api/leaderboard responds instead of hanging', async () => {
    const res = await request(app).get('/api/leaderboard');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  }, 30_000);
});

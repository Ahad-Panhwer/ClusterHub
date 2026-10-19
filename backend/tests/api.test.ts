/**
 * ClusterHub Backend API Tests
 * Tests the full CRUD pipeline in-memory mode (no Supabase credentials needed).
 *
 * Run with: npm test
 */

import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

// Use a consistent demo token that the auth middleware accepts in dev mode
const AUTH_TOKEN = 'Bearer demo-token-test-12345678';

// ─── Health ───────────────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('ClusterHub API');
  });
});

// ─── Games CRUD ───────────────────────────────────────────────────────────────

describe('Games CRUD', () => {
  let gameId: string;

  it('GET /api/games returns an array', async () => {
    const res = await request(app).get('/api/games');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST /api/games requires auth', async () => {
    const res = await request(app).post('/api/games').send({
      title: 'Test Game',
      genre: 'Action',
      platform: 'PC',
      description: 'A test game.',
      max_players_per_team: 5,
      release_year: 2024,
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/games creates a game (authenticated)', async () => {
    const res = await request(app)
      .post('/api/games')
      .set('Authorization', AUTH_TOKEN)
      .send({
        title: 'Test Game',
        genre: 'Action',
        platform: 'PC',
        description: 'A test game for unit testing.',
        max_players_per_team: 5,
        release_year: 2024,
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Game');
    expect(res.body.id).toBeTruthy();
    gameId = res.body.id;
  });

  it('POST /api/games rejects invalid data', async () => {
    const res = await request(app)
      .post('/api/games')
      .set('Authorization', AUTH_TOKEN)
      .send({ title: '', genre: 'Action', platform: 'PC', description: 'Test', max_players_per_team: 5, release_year: 2024 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/games/:id retrieves the created game', async () => {
    const res = await request(app).get(`/api/games/${gameId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(gameId);
  });

  it('PATCH /api/games/:id updates the game', async () => {
    const res = await request(app)
      .patch(`/api/games/${gameId}`)
      .set('Authorization', AUTH_TOKEN)
      .send({ title: 'Updated Test Game' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Test Game');
  });

  it('GET /api/games/:id returns 404 for missing game', async () => {
    const res = await request(app).get('/api/games/nonexistent-id-xyz');
    expect(res.status).toBe(404);
  });

  it('DELETE /api/games/:id deletes the game', async () => {
    const res = await request(app)
      .delete(`/api/games/${gameId}`)
      .set('Authorization', AUTH_TOKEN);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /api/games/:id returns 404 after deletion', async () => {
    const res = await request(app)
      .delete(`/api/games/${gameId}`)
      .set('Authorization', AUTH_TOKEN);
    expect(res.status).toBe(404);
  });
});

// ─── Tournaments CRUD ─────────────────────────────────────────────────────────

describe('Tournaments CRUD', () => {
  let tournamentId: string;
  const existingGameId = 'game-1'; // from seed data

  it('GET /api/tournaments returns an array', async () => {
    const res = await request(app).get('/api/tournaments');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/tournaments creates a tournament', async () => {
    const res = await request(app)
      .post('/api/tournaments')
      .set('Authorization', AUTH_TOKEN)
      .send({
        title: 'Test Tournament',
        game_id: existingGameId,
        format: 'Single Elimination',
        status: 'draft',
        start_date: '2027-01-01T12:00:00Z',
        end_date: '2027-01-10T12:00:00Z',
        max_teams: 8,
        prize_pool: 1000,
        description: 'A test tournament for unit testing.',
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Tournament');
    tournamentId = res.body.id;
  });

  it('POST /api/tournaments rejects invalid date range', async () => {
    const res = await request(app)
      .post('/api/tournaments')
      .set('Authorization', AUTH_TOKEN)
      .send({
        title: 'Bad Dates Tournament',
        game_id: existingGameId,
        format: 'Round Robin',
        start_date: '2027-01-10T12:00:00Z',
        end_date: '2027-01-01T12:00:00Z',  // end before start
        max_teams: 8,
        prize_pool: 0,
        description: 'This should fail.',
      });
    expect(res.status).toBe(400);
  });

  it('GET /api/tournaments/:id retrieves tournament', async () => {
    const res = await request(app).get(`/api/tournaments/${tournamentId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(tournamentId);
  });

  it('PATCH /api/tournaments/:id updates tournament', async () => {
    const res = await request(app)
      .patch(`/api/tournaments/${tournamentId}`)
      .set('Authorization', AUTH_TOKEN)
      .send({ status: 'registration_open' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('registration_open');
  });

  it('DELETE /api/tournaments/:id deletes tournament', async () => {
    const res = await request(app)
      .delete(`/api/tournaments/${tournamentId}`)
      .set('Authorization', AUTH_TOKEN);
    expect(res.status).toBe(200);
  });
});

// ─── Teams CRUD ───────────────────────────────────────────────────────────────

describe('Teams CRUD', () => {
  let teamId: string;

  it('GET /api/teams returns an array', async () => {
    const res = await request(app).get('/api/teams');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/teams creates a team', async () => {
    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', AUTH_TOKEN)
      .send({
        name: 'Test Warriors',
        tag: 'TST',
        captain_name: 'Test Captain',
        captain_email: 'captain@test.gg',
      });
    expect(res.status).toBe(201);
    expect(res.body.tag).toBe('TST');
    teamId = res.body.id;
  });

  it('POST /api/teams rejects duplicate tag', async () => {
    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', AUTH_TOKEN)
      .send({
        name: 'Test Warriors 2',
        tag: 'TST',  // duplicate
        captain_name: 'Other Captain',
        captain_email: 'other@test.gg',
      });
    expect(res.status).toBe(409);
  });

  it('POST /api/teams rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', AUTH_TOKEN)
      .send({
        name: 'Invalid Email Team',
        tag: 'IET',
        captain_name: 'Captain',
        captain_email: 'not-an-email',
      });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/teams/:id updates a team', async () => {
    const res = await request(app)
      .patch(`/api/teams/${teamId}`)
      .set('Authorization', AUTH_TOKEN)
      .send({ name: 'Updated Warriors' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Warriors');
  });

  it('DELETE /api/teams/:id deletes a team', async () => {
    const res = await request(app)
      .delete(`/api/teams/${teamId}`)
      .set('Authorization', AUTH_TOKEN);
    expect(res.status).toBe(200);
  });
});

// ─── Matches CRUD ─────────────────────────────────────────────────────────────

describe('Matches CRUD', () => {
  let matchId: string;

  it('GET /api/matches returns an array', async () => {
    const res = await request(app).get('/api/matches');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/matches filtered by tournament_id', async () => {
    const res = await request(app).get('/api/matches?tournament_id=tourn-1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((m: any) => expect(m.tournament_id).toBe('tourn-1'));
  });

  it('POST /api/matches rejects teams not registered', async () => {
    const res = await request(app)
      .post('/api/matches')
      .set('Authorization', AUTH_TOKEN)
      .send({
        tournament_id: 'tourn-1',
        team1_id: 'team-1',
        team2_id: 'team-6',  // team-6 not registered for tourn-1 in seed
        round: 'Quarter-Finals',
        round_number: 1,
        scheduled_at: '2027-10-01T18:00:00Z',
      });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/matches/:id updates a match', async () => {
    // Use existing seed match
    const res = await request(app)
      .patch('/api/matches/match-1')
      .set('Authorization', AUTH_TOKEN)
      .send({ status: 'scheduled' });
    expect(res.status).toBe(200);
  });

  it('GET /api/matches/:id returns 404 for missing match', async () => {
    const res = await request(app).get('/api/matches/nonexistent-xyz');
    expect(res.status).toBe(404);
  });
});

// ─── Registrations ────────────────────────────────────────────────────────────

describe('Registrations', () => {
  it('GET /api/registrations returns an array', async () => {
    const res = await request(app).get('/api/registrations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/registrations rejects duplicate registration', async () => {
    // team-1 is already registered for tourn-1 in seed data
    const res = await request(app)
      .post('/api/registrations')
      .set('Authorization', AUTH_TOKEN)
      .send({ tournament_id: 'tourn-1', team_id: 'team-1' });
    expect(res.status).toBe(409);
  });
});

// ─── Leaderboard ─────────────────────────────────────────────────────────────

describe('Leaderboard', () => {
  it('GET /api/leaderboard returns ranked entries', async () => {
    const res = await request(app).get('/api/leaderboard');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Entries should have ranks
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('rank');
      expect(res.body[0]).toHaveProperty('points');
      expect(res.body[0]).toHaveProperty('wins');
      expect(res.body[0]).toHaveProperty('team');
    }
  });

  it('GET /api/leaderboard?tournament_id=tourn-1 filters by tournament', async () => {
    const res = await request(app).get('/api/leaderboard?tournament_id=tourn-1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/tournaments/:id/leaderboard returns tournament standings', async () => {
    const res = await request(app).get('/api/tournaments/tourn-1/leaderboard');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ─── 404 and Error handling ───────────────────────────────────────────────────

describe('Error handling', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 401 for protected routes without token', async () => {
    const res = await request(app).post('/api/games').send({});
    expect(res.status).toBe(401);
  });
});

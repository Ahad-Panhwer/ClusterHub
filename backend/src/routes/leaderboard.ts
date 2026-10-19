import { Router, Request, Response } from 'express';
import { matchesRepo } from '../repositories/matchesRepo.js';
import { teamsRepo } from '../repositories/teamsRepo.js';
import { LeaderboardEntry } from '../types/index.js';

export const leaderboardRouter = Router();

// GET /leaderboard — global leaderboard, optionally filtered by tournament_id
leaderboardRouter.get('/', async (req: Request, res: Response) => {
  const tournamentId = req.query.tournament_id as string | undefined;

  const [matches, teams] = await Promise.all([
    matchesRepo.getCompletedByTournament(
      tournamentId && tournamentId !== 'all' ? tournamentId : undefined
    ),
    teamsRepo.getAll(),
  ]);

  const leaderboard = calculateLeaderboard(teams, matches);
  res.json(leaderboard);
});

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

    const winnerId =
      match.winner_id ||
      (match.team1_score > match.team2_score
        ? match.team1_id
        : match.team2_score > match.team1_score
          ? match.team2_id
          : null);

    if (winnerId === match.team1_id && s1 && s2) {
      s1.wins += 1;
      s1.points += 3;
      s2.losses += 1;
    } else if (winnerId === match.team2_id && s1 && s2) {
      s2.wins += 1;
      s2.points += 3;
      s1.losses += 1;
    }
  }

  const entries: LeaderboardEntry[] = teams
    .filter((t) => map.has(t.id))
    .map((team) => {
      const stats = map.get(team.id)!;
      const win_rate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
      return {
        team_id: team.id,
        team,
        matches_played: stats.played,
        wins: stats.wins,
        losses: stats.losses,
        points: stats.points,
        win_rate,
        rank: 0,
      };
    });

  entries.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.win_rate !== a.win_rate) return b.win_rate - a.win_rate;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.team.name.localeCompare(b.team.name);
  });

  return entries.map((e, i) => ({ ...e, rank: i + 1 }));
}

import { LeaderboardEntry, Match, Team } from '../types';
import { apiClient } from './apiClient';
import { storage } from './storage';

export const leaderboardService = {
  calculateStandings(
    teams: Team[],
    matches: Match[],
    tournamentId?: string
  ): LeaderboardEntry[] {
    let filteredMatches = matches.filter((m) => m.status === 'completed');
    if (tournamentId && tournamentId !== 'all') {
      filteredMatches = filteredMatches.filter((m) => m.tournament_id === tournamentId);
    }

    const map = new Map<string, { played: number; wins: number; losses: number; points: number }>();

    // Initialize all teams
    for (const team of teams) {
      map.set(team.id, { played: 0, wins: 0, losses: 0, points: 0 });
    }

    // Accumulate from verified match records
    for (const match of filteredMatches) {
      const stats1 = map.get(match.team1_id);
      const stats2 = map.get(match.team2_id);

      if (stats1) stats1.played += 1;
      if (stats2) stats2.played += 1;

      if (match.winner_id) {
        if (match.winner_id === match.team1_id && stats1 && stats2) {
          stats1.wins += 1;
          stats1.points += 3;
          stats2.losses += 1;
        } else if (match.winner_id === match.team2_id && stats1 && stats2) {
          stats2.wins += 1;
          stats2.points += 3;
          stats1.losses += 1;
        }
      } else {
        // Fallback to score comparison if winner_id wasn't populated explicitly
        if (match.team1_score > match.team2_score && stats1 && stats2) {
          stats1.wins += 1;
          stats1.points += 3;
          stats2.losses += 1;
        } else if (match.team2_score > match.team1_score && stats1 && stats2) {
          stats2.wins += 1;
          stats2.points += 3;
          stats1.losses += 1;
        }
      }
    }

    const entries: LeaderboardEntry[] = teams.map((team) => {
      const stats = map.get(team.id) || { played: 0, wins: 0, losses: 0, points: 0 };
      const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
      return {
        team_id: team.id,
        team,
        matches_played: stats.played,
        wins: stats.wins,
        losses: stats.losses,
        points: stats.points,
        win_rate: winRate,
        rank: 0, // will assign next
      };
    });

    // Sort by points desc, win_rate desc, wins desc, matches_played desc
    entries.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.win_rate !== a.win_rate) return b.win_rate - a.win_rate;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.team.name.localeCompare(b.team.name);
    });

    // Assign ranking
    return entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  },

  async getStandings(tournamentId?: string, useMock = false): Promise<LeaderboardEntry[]> {
    if (useMock) {
      const teams = storage.getTeams();
      const matches = storage.getMatches();
      return this.calculateStandings(teams, matches, tournamentId);
    }
    const query = tournamentId && tournamentId !== 'all' ? `?tournament_id=${tournamentId}` : '';
    return apiClient.get<LeaderboardEntry[]>(`/leaderboard${query}`);
  },
};

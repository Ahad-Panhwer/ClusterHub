import { Match, MatchStatus } from '../types';
import { apiClient } from './apiClient';
import { storage } from './storage';

export interface CreateMatchDto {
  tournament_id: string;
  team1_id: string;
  team2_id: string;
  round: string;
  round_number?: number;
  scheduled_at: string;
  notes?: string;
}

export interface UpdateMatchDto {
  scheduled_at?: string;
  round?: string;
  round_number?: number;
  status?: MatchStatus;
  team1_score?: number;
  team2_score?: number;
  winner_id?: string | null;
  notes?: string;
}

export const matchesService = {
  async getAll(tournamentId?: string, useMock = false): Promise<Match[]> {
    if (useMock) {
      let matches = storage.getMatches();
      if (tournamentId) {
        matches = matches.filter((m) => m.tournament_id === tournamentId);
      }
      const teams = storage.getTeams();
      const tournaments = storage.getTournaments();

      return matches.map((m) => ({
        ...m,
        tournament: tournaments.find((t) => t.id === m.tournament_id),
        team1: teams.find((t) => t.id === m.team1_id),
        team2: teams.find((t) => t.id === m.team2_id),
      }));
    }

    const endpoint = tournamentId ? `/matches?tournament_id=${tournamentId}` : '/matches';
    return apiClient.get<Match[]>(endpoint);
  },

  async getById(id: string, useMock = false): Promise<Match> {
    if (useMock) {
      const match = storage.getMatches().find((m) => m.id === id);
      if (!match) throw new Error('Match not found');
      const teams = storage.getTeams();
      const tournaments = storage.getTournaments();
      return {
        ...match,
        tournament: tournaments.find((t) => t.id === match.tournament_id),
        team1: teams.find((t) => t.id === match.team1_id),
        team2: teams.find((t) => t.id === match.team2_id),
      };
    }
    return apiClient.get<Match>(`/matches/${id}`);
  },

  async create(data: CreateMatchDto, useMock = false): Promise<Match> {
    if (useMock) {
      const newMatch: Match = {
        id: `match-${Date.now()}`,
        tournament_id: data.tournament_id,
        team1_id: data.team1_id,
        team2_id: data.team2_id,
        round: data.round,
        round_number: data.round_number || 1,
        scheduled_at: data.scheduled_at,
        status: 'scheduled',
        team1_score: 0,
        team2_score: 0,
        winner_id: null,
        notes: data.notes || '',
        created_at: new Date().toISOString(),
      };
      const list = [newMatch, ...storage.getMatches()];
      storage.setMatches(list);
      return newMatch;
    }
    return apiClient.post<Match>('/matches', data);
  },

  async update(id: string, data: UpdateMatchDto, useMock = false): Promise<Match> {
    if (useMock) {
      const list = storage.getMatches();
      const idx = list.findIndex((m) => m.id === id);
      if (idx === -1) throw new Error('Match not found');

      let winnerId = data.winner_id;
      if (
        data.status === 'completed' &&
        winnerId === undefined &&
        data.team1_score !== undefined &&
        data.team2_score !== undefined
      ) {
        if (data.team1_score > data.team2_score) winnerId = list[idx].team1_id;
        else if (data.team2_score > data.team1_score) winnerId = list[idx].team2_id;
        else winnerId = null;
      }

      const updated: Match = {
        ...list[idx],
        ...data,
        winner_id: winnerId !== undefined ? winnerId : list[idx].winner_id,
        updated_at: new Date().toISOString(),
      };
      list[idx] = updated;
      storage.setMatches(list);
      return updated;
    }
    return apiClient.put<Match>(`/matches/${id}`, data);
  },

  async delete(id: string, useMock = false): Promise<void> {
    if (useMock) {
      const list = storage.getMatches().filter((m) => m.id !== id);
      storage.setMatches(list);
      return;
    }
    return apiClient.delete<void>(`/matches/${id}`);
  },
};

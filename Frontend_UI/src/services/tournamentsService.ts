import { Tournament, TournamentFormat, TournamentStatus } from '../types';
import { apiClient } from './apiClient';
import { storage } from './storage';

export interface CreateTournamentDto {
  title: string;
  game_id: string;
  format: TournamentFormat;
  status?: TournamentStatus;
  start_date: string;
  end_date: string;
  max_teams: number;
  prize_pool: number;
  description: string;
  rules?: string;
}

export interface UpdateTournamentDto extends Partial<CreateTournamentDto> {
  status?: TournamentStatus;
}

export const tournamentsService = {
  async getAll(useMock = false): Promise<Tournament[]> {
    if (useMock) {
      const tournaments = storage.getTournaments();
      const games = storage.getGames();
      const registrations = storage.getRegistrations();
      return tournaments.map((t) => ({
        ...t,
        game: games.find((g) => g.id === t.game_id),
        registered_teams_count: registrations.filter((r) => r.tournament_id === t.id && r.status === 'confirmed').length,
      }));
    }
    return apiClient.get<Tournament[]>('/tournaments');
  },

  async getById(id: string, useMock = false): Promise<Tournament> {
    if (useMock) {
      const tournaments = storage.getTournaments();
      const t = tournaments.find((item) => item.id === id);
      if (!t) throw new Error('Tournament not found');
      const games = storage.getGames();
      const registrations = storage.getRegistrations();
      return {
        ...t,
        game: games.find((g) => g.id === t.game_id),
        registered_teams_count: registrations.filter((r) => r.tournament_id === t.id && r.status === 'confirmed').length,
      };
    }
    return apiClient.get<Tournament>(`/tournaments/${id}`);
  },

  async create(data: CreateTournamentDto, useMock = false): Promise<Tournament> {
    if (useMock) {
      const newTourn: Tournament = {
        id: `tourn-${Date.now()}`,
        ...data,
        status: data.status || 'registration_open',
        registered_teams_count: 0,
        created_at: new Date().toISOString(),
      };
      const list = [newTourn, ...storage.getTournaments()];
      storage.setTournaments(list);
      return newTourn;
    }
    return apiClient.post<Tournament>('/tournaments', data);
  },

  async update(id: string, data: UpdateTournamentDto, useMock = false): Promise<Tournament> {
    if (useMock) {
      const list = storage.getTournaments();
      const idx = list.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error('Tournament not found');
      const updated: Tournament = {
        ...list[idx],
        ...data,
        updated_at: new Date().toISOString(),
      };
      list[idx] = updated;
      storage.setTournaments(list);
      return updated;
    }
    return apiClient.put<Tournament>(`/tournaments/${id}`, data);
  },

  async delete(id: string, useMock = false): Promise<void> {
    if (useMock) {
      const list = storage.getTournaments().filter((t) => t.id !== id);
      storage.setTournaments(list);
      // Clean up orphaned registrations and matches
      const regs = storage.getRegistrations().filter((r) => r.tournament_id !== id);
      storage.setRegistrations(regs);
      const matches = storage.getMatches().filter((m) => m.tournament_id !== id);
      storage.setMatches(matches);
      return;
    }
    return apiClient.delete<void>(`/tournaments/${id}`);
  },
};

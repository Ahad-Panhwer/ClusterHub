import { Registration, RegistrationStatus } from '../types';
import { apiClient } from './apiClient';
import { storage } from './storage';

export interface CreateRegistrationDto {
  tournament_id: string;
  team_id: string;
  status?: RegistrationStatus;
}

export const registrationsService = {
  async getAll(tournamentId?: string, useMock = false): Promise<Registration[]> {
    if (useMock) {
      let regs = storage.getRegistrations();
      if (tournamentId) {
        regs = regs.filter((r) => r.tournament_id === tournamentId);
      }
      const teams = storage.getTeams();
      const tournaments = storage.getTournaments();

      return regs.map((r) => ({
        ...r,
        team: teams.find((t) => t.id === r.team_id),
        tournament: tournaments.find((t) => t.id === r.tournament_id),
      }));
    }

    const endpoint = tournamentId ? `/registrations?tournament_id=${tournamentId}` : '/registrations';
    return apiClient.get<Registration[]>(endpoint);
  },

  async create(data: CreateRegistrationDto, useMock = false): Promise<Registration> {
    if (useMock) {
      const regs = storage.getRegistrations();
      const tournaments = storage.getTournaments();
      const tourn = tournaments.find((t) => t.id === data.tournament_id);

      if (!tourn) {
        throw new Error('Tournament not found.');
      }

      // Check duplicate registration
      const existing = regs.find(
        (r) => r.tournament_id === data.tournament_id && r.team_id === data.team_id && r.status !== 'cancelled'
      );
      if (existing) {
        throw new Error('This team is already registered for this tournament.');
      }

      // Check max teams
      const confirmedCount = regs.filter(
        (r) => r.tournament_id === data.tournament_id && r.status === 'confirmed'
      ).length;

      let assignedStatus: RegistrationStatus = data.status || 'confirmed';
      if (confirmedCount >= tourn.max_teams && assignedStatus === 'confirmed') {
        assignedStatus = 'waitlist';
      }

      const newReg: Registration = {
        id: `reg-${Date.now()}`,
        tournament_id: data.tournament_id,
        team_id: data.team_id,
        status: assignedStatus,
        registered_at: new Date().toISOString(),
        seed_number: confirmedCount + 1,
      };

      const updated = [newReg, ...regs];
      storage.setRegistrations(updated);

      const teams = storage.getTeams();
      return {
        ...newReg,
        team: teams.find((t) => t.id === data.team_id),
        tournament: tourn,
      };
    }

    return apiClient.post<Registration>('/registrations', data);
  },

  async updateStatus(id: string, status: RegistrationStatus, useMock = false): Promise<Registration> {
    if (useMock) {
      const regs = storage.getRegistrations();
      const idx = regs.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('Registration not found');

      regs[idx].status = status;
      storage.setRegistrations(regs);

      const teams = storage.getTeams();
      const tournaments = storage.getTournaments();
      return {
        ...regs[idx],
        team: teams.find((t) => t.id === regs[idx].team_id),
        tournament: tournaments.find((t) => t.id === regs[idx].tournament_id),
      };
    }

    return apiClient.patch<Registration>(`/registrations/${id}`, { status });
  },

  async delete(id: string, useMock = false): Promise<void> {
    if (useMock) {
      const list = storage.getRegistrations().filter((r) => r.id !== id);
      storage.setRegistrations(list);
      return;
    }
    return apiClient.delete<void>(`/registrations/${id}`);
  },
};

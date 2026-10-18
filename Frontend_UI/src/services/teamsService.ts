import { Team } from '../types';
import { apiClient } from './apiClient';
import { storage } from './storage';

export interface CreateTeamDto {
  name: string;
  tag: string;
  captain_name: string;
  captain_email: string;
  logo_color?: string;
  members_count?: number;
}

export interface UpdateTeamDto extends Partial<CreateTeamDto> {}

export const teamsService = {
  async getAll(useMock = false): Promise<Team[]> {
    if (useMock) {
      return storage.getTeams();
    }
    return apiClient.get<Team[]>('/teams');
  },

  async getById(id: string, useMock = false): Promise<Team> {
    if (useMock) {
      const team = storage.getTeams().find((t) => t.id === id);
      if (!team) throw new Error('Team not found');
      return team;
    }
    return apiClient.get<Team>(`/teams/${id}`);
  },

  async create(data: CreateTeamDto, useMock = false): Promise<Team> {
    if (useMock) {
      const teams = storage.getTeams();
      // Check duplicate tag
      if (teams.some((t) => t.tag.toLowerCase() === data.tag.toLowerCase())) {
        throw new Error(`Team tag "${data.tag.toUpperCase()}" is already registered.`);
      }
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        name: data.name,
        tag: data.tag.toUpperCase(),
        captain_name: data.captain_name,
        captain_email: data.captain_email,
        logo_color: data.logo_color || '#8B7CF6',
        members_count: data.members_count || 5,
        created_at: new Date().toISOString(),
      };
      const list = [newTeam, ...teams];
      storage.setTeams(list);
      return newTeam;
    }
    return apiClient.post<Team>('/teams', data);
  },

  async update(id: string, data: UpdateTeamDto, useMock = false): Promise<Team> {
    if (useMock) {
      const list = storage.getTeams();
      const idx = list.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error('Team not found');

      if (data.tag && data.tag.toLowerCase() !== list[idx].tag.toLowerCase()) {
        if (list.some((t) => t.id !== id && t.tag.toLowerCase() === data.tag!.toLowerCase())) {
          throw new Error(`Team tag "${data.tag.toUpperCase()}" is already in use.`);
        }
      }

      const updated: Team = {
        ...list[idx],
        ...data,
        tag: data.tag ? data.tag.toUpperCase() : list[idx].tag,
        updated_at: new Date().toISOString(),
      };
      list[idx] = updated;
      storage.setTeams(list);
      return updated;
    }
    return apiClient.put<Team>(`/teams/${id}`, data);
  },

  async delete(id: string, useMock = false): Promise<void> {
    if (useMock) {
      const list = storage.getTeams().filter((t) => t.id !== id);
      storage.setTeams(list);
      // Clean up orphaned registrations
      const regs = storage.getRegistrations().filter((r) => r.team_id !== id);
      storage.setRegistrations(regs);
      return;
    }
    return apiClient.delete<void>(`/teams/${id}`);
  },
};

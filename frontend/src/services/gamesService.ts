import { Game } from '../types';
import { apiClient } from './apiClient';
import { storage } from './storage';

export interface CreateGameDto {
  title: string;
  genre: string;
  platform: string;
  description: string;
  max_players_per_team: number;
  release_year: number;
  banner_color?: string;
  icon_theme?: string;
}

export interface UpdateGameDto extends Partial<CreateGameDto> {
  is_active?: boolean;
}

export const gamesService = {
  async getAll(useMock = false): Promise<Game[]> {
    if (useMock) {
      return storage.getGames();
    }
    return apiClient.get<Game[]>('/games');
  },

  async getById(id: string, useMock = false): Promise<Game> {
    if (useMock) {
      const game = storage.getGames().find((g) => g.id === id);
      if (!game) throw new Error('Game not found');
      return game;
    }
    return apiClient.get<Game>(`/games/${id}`);
  },

  async create(data: CreateGameDto, useMock = false): Promise<Game> {
    if (useMock) {
      const newGame: Game = {
        id: `game-${Date.now()}`,
        ...data,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      const list = [newGame, ...storage.getGames()];
      storage.setGames(list);
      return newGame;
    }
    return apiClient.post<Game>('/games', data);
  },

  async update(id: string, data: UpdateGameDto, useMock = false): Promise<Game> {
    if (useMock) {
      const list = storage.getGames();
      const idx = list.findIndex((g) => g.id === id);
      if (idx === -1) throw new Error('Game not found');
      const updated: Game = {
        ...list[idx],
        ...data,
        updated_at: new Date().toISOString(),
      };
      list[idx] = updated;
      storage.setGames(list);
      return updated;
    }
    return apiClient.put<Game>(`/games/${id}`, data);
  },

  async delete(id: string, useMock = false): Promise<void> {
    if (useMock) {
      const list = storage.getGames().filter((g) => g.id !== id);
      storage.setGames(list);
      return;
    }
    return apiClient.delete<void>(`/games/${id}`);
  },
};

/**
 * Games repository.
 * Abstracts Supabase vs in-memory storage.
 * When Supabase is configured, every operation goes to PostgreSQL.
 * When not configured, operations use the in-memory store (development fallback).
 */

import { getSupabaseClient } from '../lib/supabase.js';
import { isSupabaseConfigured } from '../config/index.js';
import { store, newId } from '../lib/store.js';
import { Game, CreateGameDto, UpdateGameDto } from '../types/index.js';

export const gamesRepo = {
  async getAll(): Promise<Game[]> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { data, error } = await sb.from('games').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      // Map snake_case DB columns to our interface
      return (data as any[]).map(mapDbGame);
    }
    return [...store.games];
  },

  async getById(id: string): Promise<Game | null> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { data, error } = await sb.from('games').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? mapDbGame(data) : null;
    }
    return store.games.find((g) => g.id === id) ?? null;
  },

  async create(dto: CreateGameDto): Promise<Game> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { data, error } = await sb
        .from('games')
        .insert({
          title: dto.title.trim(),
          genre: dto.genre.trim(),
          platform: dto.platform.trim(),
          description: dto.description.trim(),
          max_players_per_team: dto.max_players_per_team,
          release_year: dto.release_year,
          banner_color: dto.banner_color ?? '#8B7CF6',
          icon_theme: dto.icon_theme ?? 'gamepad',
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      return mapDbGame(data);
    }

    const game: Game = {
      id: newId('game'),
      title: dto.title.trim(),
      genre: dto.genre.trim(),
      platform: dto.platform.trim(),
      description: dto.description.trim(),
      max_players_per_team: dto.max_players_per_team,
      release_year: dto.release_year,
      banner_color: dto.banner_color ?? '#8B7CF6',
      icon_theme: dto.icon_theme ?? 'gamepad',
      is_active: true,
      created_at: new Date().toISOString(),
    };
    store.games.unshift(game);
    return game;
  },

  async update(id: string, dto: UpdateGameDto): Promise<Game | null> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const patch: Record<string, unknown> = {};
      if (dto.title !== undefined) patch['title'] = dto.title.trim();
      if (dto.genre !== undefined) patch['genre'] = dto.genre.trim();
      if (dto.platform !== undefined) patch['platform'] = dto.platform.trim();
      if (dto.description !== undefined) patch['description'] = dto.description.trim();
      if (dto.max_players_per_team !== undefined) patch['max_players_per_team'] = dto.max_players_per_team;
      if (dto.release_year !== undefined) patch['release_year'] = dto.release_year;
      if (dto.banner_color !== undefined) patch['banner_color'] = dto.banner_color;
      if (dto.icon_theme !== undefined) patch['icon_theme'] = dto.icon_theme;
      if (dto.is_active !== undefined) patch['is_active'] = dto.is_active;

      const { data, error } = await sb.from('games').update(patch).eq('id', id).select().maybeSingle();
      if (error) throw error;
      return data ? mapDbGame(data) : null;
    }

    const idx = store.games.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    const updated: Game = {
      ...store.games[idx],
      ...(dto.title !== undefined && { title: dto.title.trim() }),
      ...(dto.genre !== undefined && { genre: dto.genre.trim() }),
      ...(dto.platform !== undefined && { platform: dto.platform.trim() }),
      ...(dto.description !== undefined && { description: dto.description.trim() }),
      ...(dto.max_players_per_team !== undefined && { max_players_per_team: dto.max_players_per_team }),
      ...(dto.release_year !== undefined && { release_year: dto.release_year }),
      ...(dto.banner_color !== undefined && { banner_color: dto.banner_color }),
      ...(dto.icon_theme !== undefined && { icon_theme: dto.icon_theme }),
      ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      updated_at: new Date().toISOString(),
    };
    store.games[idx] = updated;
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { error } = await sb.from('games').delete().eq('id', id);
      if (error) throw error;
      return true;
    }

    const idx = store.games.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    store.games.splice(idx, 1);
    return true;
  },
};

/** Map raw Supabase row to Game interface */
function mapDbGame(row: any): Game {
  return {
    id: row.id,
    title: row.title,
    genre: row.genre,
    platform: row.platform,
    description: row.description ?? '',
    max_players_per_team: row.max_players_per_team ?? 5,
    release_year: row.release_year ?? new Date().getFullYear(),
    banner_color: row.banner_color,
    icon_theme: row.icon_theme,
    is_active: row.is_active ?? true,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

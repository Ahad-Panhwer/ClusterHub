/**
 * Games repository.
 * Supports MongoDB Atlas, Supabase, and in-memory storage.
 * Prioritizes MongoDB Atlas when MONGODB_URI is configured.
 */

import { connectMongo } from '../lib/mongodb.js';
import { GameModel, toEntity } from '../models/index.js';
import { getSupabaseClient } from '../lib/supabase.js';
import { isMongoConfigured, isSupabaseConfigured } from '../config/index.js';
import { store, newId } from '../lib/store.js';
import { Game, CreateGameDto, UpdateGameDto } from '../types/index.js';

export const gamesRepo = {
  async getAll(): Promise<Game[]> {
    if (isMongoConfigured()) {
      try {
        if (!(await connectMongo())) throw new Error('MongoDB unavailable (connection failed)');
        const docs = await GameModel.find().sort({ created_at: -1 }).lean();
        return docs.map((d) => toEntity<Game>(d));
    
      } catch (err) {
        console.error('[Repo] MongoDB tier failed; falling back to next data tier:', err instanceof Error ? err.message : err);
      }
    }

    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { data, error } = await sb.from('games').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any[]).map(mapDbGame);
    }

    return [...store.games];
  },

  async getById(id: string): Promise<Game | null> {
    if (isMongoConfigured()) {
      try {
        if (!(await connectMongo())) throw new Error('MongoDB unavailable (connection failed)');
        const doc = await GameModel.findById(id).lean();
        return doc ? toEntity<Game>(doc) : null;
    
      } catch (err) {
        console.error('[Repo] MongoDB tier failed; falling back to next data tier:', err instanceof Error ? err.message : err);
      }
    }

    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { data, error } = await sb.from('games').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? mapDbGame(data) : null;
    }

    return store.games.find((g) => g.id === id) ?? null;
  },

  async create(dto: CreateGameDto): Promise<Game> {
    if (isMongoConfigured()) {
      try {
        if (!(await connectMongo())) throw new Error('MongoDB unavailable (connection failed)');
        const id = newId('game');
        const doc = await GameModel.create({
          _id: id,
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
        });
        return toEntity<Game>(doc);
    
      } catch (err) {
        console.error('[Repo] MongoDB tier failed; falling back to next data tier:', err instanceof Error ? err.message : err);
      }
    }

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
    if (isMongoConfigured()) {
      try {
        if (!(await connectMongo())) throw new Error('MongoDB unavailable (connection failed)');
        const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (dto.title !== undefined) patch.title = dto.title.trim();
        if (dto.genre !== undefined) patch.genre = dto.genre.trim();
        if (dto.platform !== undefined) patch.platform = dto.platform.trim();
        if (dto.description !== undefined) patch.description = dto.description.trim();
        if (dto.max_players_per_team !== undefined) patch.max_players_per_team = dto.max_players_per_team;
        if (dto.release_year !== undefined) patch.release_year = dto.release_year;
        if (dto.banner_color !== undefined) patch.banner_color = dto.banner_color;
        if (dto.icon_theme !== undefined) patch.icon_theme = dto.icon_theme;
        if (dto.is_active !== undefined) patch.is_active = dto.is_active;

        const updated = await GameModel.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();
        return updated ? toEntity<Game>(updated) : null;
    
      } catch (err) {
        console.error('[Repo] MongoDB tier failed; falling back to next data tier:', err instanceof Error ? err.message : err);
      }
    }

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
    if (isMongoConfigured()) {
      try {
        if (!(await connectMongo())) throw new Error('MongoDB unavailable (connection failed)');
        const res = await GameModel.findByIdAndDelete(id);
        return !!res;
    
      } catch (err) {
        console.error('[Repo] MongoDB tier failed; falling back to next data tier:', err instanceof Error ? err.message : err);
      }
    }

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

/**
 * Tournaments repository — Supabase and in-memory implementations.
 */

import { getSupabaseClient } from '../lib/supabase.js';
import { isSupabaseConfigured } from '../config/index.js';
import { store, newId } from '../lib/store.js';
import {
  Tournament,
  TournamentFormat,
  TournamentStatus,
  CreateTournamentDto,
  UpdateTournamentDto,
} from '../types/index.js';

export const tournamentsRepo = {
  async getAll(): Promise<Tournament[]> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { data, error } = await sb
        .from('tournaments')
        .select('*, game:games(*), registrations(count)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any[]).map(mapDbTournament);
    }
    return store.tournaments.map((t) => enrichTournament(t));
  },

  async getById(id: string): Promise<Tournament | null> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { data, error } = await sb
        .from('tournaments')
        .select('*, game:games(*), registrations(count)')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? mapDbTournament(data) : null;
    }
    const t = store.tournaments.find((t) => t.id === id);
    return t ? enrichTournament(t) : null;
  },

  async create(dto: CreateTournamentDto): Promise<Tournament> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { data, error } = await sb
        .from('tournaments')
        .insert({
          title: dto.title.trim(),
          game_id: dto.game_id,
          format: mapFormatToDb(dto.format),
          status: mapStatusToDb(dto.status ?? 'registration_open'),
          start_date: new Date(dto.start_date).toISOString(),
          end_date: new Date(dto.end_date).toISOString(),
          max_teams: dto.max_teams,
          prize_pool: dto.prize_pool,
          description: dto.description.trim(),
          rules: dto.rules?.trim() ?? null,
        })
        .select('*, game:games(*)')
        .single();
      if (error) throw error;
      return mapDbTournament({ ...data, registrations: [{ count: 0 }] });
    }

    const t: Tournament = {
      id: newId('tourn'),
      title: dto.title.trim(),
      game_id: dto.game_id,
      format: dto.format,
      status: dto.status ?? 'registration_open',
      start_date: new Date(dto.start_date).toISOString(),
      end_date: new Date(dto.end_date).toISOString(),
      max_teams: dto.max_teams,
      prize_pool: dto.prize_pool,
      description: dto.description.trim(),
      rules: dto.rules?.trim(),
      registered_teams_count: 0,
      created_at: new Date().toISOString(),
    };
    store.tournaments.unshift(t);
    return enrichTournament(t);
  },

  async update(id: string, dto: UpdateTournamentDto): Promise<Tournament | null> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const patch: Record<string, unknown> = {};
      if (dto.title !== undefined) patch['title'] = dto.title.trim();
      if (dto.game_id !== undefined) patch['game_id'] = dto.game_id;
      if (dto.format !== undefined) patch['format'] = mapFormatToDb(dto.format);
      if (dto.status !== undefined) patch['status'] = mapStatusToDb(dto.status);
      if (dto.start_date !== undefined) patch['start_date'] = new Date(dto.start_date).toISOString();
      if (dto.end_date !== undefined) patch['end_date'] = new Date(dto.end_date).toISOString();
      if (dto.max_teams !== undefined) patch['max_teams'] = dto.max_teams;
      if (dto.prize_pool !== undefined) patch['prize_pool'] = dto.prize_pool;
      if (dto.description !== undefined) patch['description'] = dto.description.trim();
      if (dto.rules !== undefined) patch['rules'] = dto.rules.trim();

      const { data, error } = await sb
        .from('tournaments')
        .update(patch)
        .eq('id', id)
        .select('*, game:games(*), registrations(count)')
        .maybeSingle();
      if (error) throw error;
      return data ? mapDbTournament(data) : null;
    }

    const idx = store.tournaments.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const updated: Tournament = {
      ...store.tournaments[idx],
      ...(dto.title !== undefined && { title: dto.title.trim() }),
      ...(dto.game_id !== undefined && { game_id: dto.game_id }),
      ...(dto.format !== undefined && { format: dto.format }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.start_date !== undefined && { start_date: new Date(dto.start_date).toISOString() }),
      ...(dto.end_date !== undefined && { end_date: new Date(dto.end_date).toISOString() }),
      ...(dto.max_teams !== undefined && { max_teams: dto.max_teams }),
      ...(dto.prize_pool !== undefined && { prize_pool: dto.prize_pool }),
      ...(dto.description !== undefined && { description: dto.description.trim() }),
      ...(dto.rules !== undefined && { rules: dto.rules.trim() }),
      updated_at: new Date().toISOString(),
    };
    store.tournaments[idx] = updated;
    return enrichTournament(updated);
  },

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { error } = await sb.from('tournaments').delete().eq('id', id);
      if (error) throw error;
      return true;
    }

    const idx = store.tournaments.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    store.tournaments.splice(idx, 1);
    // Clean up orphaned registrations and matches
    store.registrations = store.registrations.filter((r) => r.tournament_id !== id);
    store.matches = store.matches.filter((m) => m.tournament_id !== id);
    return true;
  },
};

/** Enrich an in-memory tournament with related game and registration count */
function enrichTournament(t: Tournament): Tournament {
  const game = store.games.find((g) => g.id === t.game_id);
  const regCount = store.registrations.filter(
    (r) => r.tournament_id === t.id && r.status === 'confirmed'
  ).length;
  return { ...t, game, registered_teams_count: regCount };
}

/** Map Supabase row to Tournament interface */
function mapDbTournament(row: any): Tournament {
  return {
    id: row.id,
    title: row.title,
    game_id: row.game_id,
    game: row.game ?? undefined,
    format: mapDbFormat(row.format),
    status: mapDbStatus(row.status),
    start_date: row.start_date,
    end_date: row.end_date,
    max_teams: row.max_teams ?? row.capacity,
    prize_pool: row.prize_pool ?? 0,
    description: row.description ?? '',
    rules: row.rules ?? undefined,
    registered_teams_count: Array.isArray(row.registrations) ? row.registrations[0]?.count ?? 0 : row.registered_teams_count ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// The DB schema uses single_elimination / round_robin, frontend uses display names
function mapFormatToDb(format: TournamentFormat): string {
  switch (format) {
    case 'Single Elimination': return 'single_elimination';
    case 'Double Elimination': return 'round_robin'; // not in schema, map to nearest
    case 'Round Robin': return 'round_robin';
    case 'Swiss': return 'single_elimination'; // not in schema, map to nearest
    default: return 'single_elimination';
  }
}

function mapDbFormat(dbFormat: string): TournamentFormat {
  switch (dbFormat) {
    case 'round_robin': return 'Round Robin';
    case 'single_elimination':
    default: return 'Single Elimination';
  }
}

function mapStatusToDb(status: TournamentStatus): string {
  // Frontend uses 'registration_open', DB uses 'open'
  switch (status) {
    case 'registration_open': return 'open';
    case 'draft': return 'draft';
    case 'in_progress': return 'in_progress';
    case 'completed': return 'completed';
    case 'cancelled': return 'cancelled';
    default: return 'draft';
  }
}

function mapDbStatus(dbStatus: string): TournamentStatus {
  switch (dbStatus) {
    case 'open': return 'registration_open';
    case 'in_progress': return 'in_progress';
    case 'completed': return 'completed';
    case 'cancelled': return 'cancelled';
    case 'draft':
    default: return 'draft';
  }
}

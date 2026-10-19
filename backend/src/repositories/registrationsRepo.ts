/**
 * Registrations repository — Supabase and in-memory implementations.
 */

import { getSupabaseClient } from '../lib/supabase.js';
import { isSupabaseConfigured } from '../config/index.js';
import { store, newId } from '../lib/store.js';
import { Registration, RegistrationStatus, CreateRegistrationDto } from '../types/index.js';

export const registrationsRepo = {
  async getAll(tournamentId?: string): Promise<Registration[]> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      let q = sb.from('registrations').select('*, tournament:tournaments(*), team:teams(*)').order('registered_at', { ascending: false });
      if (tournamentId) q = q.eq('tournament_id', tournamentId);
      const { data, error } = await q;
      if (error) throw error;
      return (data as any[]).map(mapDbReg);
    }

    let list = [...store.registrations];
    if (tournamentId) list = list.filter((r) => r.tournament_id === tournamentId);
    return list.map(enrichReg);
  },

  async getById(id: string): Promise<Registration | null> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { data, error } = await sb.from('registrations').select('*, tournament:tournaments(*), team:teams(*)').eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? mapDbReg(data) : null;
    }
    const r = store.registrations.find((r) => r.id === id);
    return r ? enrichReg(r) : null;
  },

  async findExisting(tournamentId: string, teamId: string): Promise<Registration | null> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { data, error } = await sb
        .from('registrations')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('team_id', teamId)
        .maybeSingle();
      if (error) throw error;
      return data ? mapDbReg(data) : null;
    }
    return store.registrations.find((r) => r.tournament_id === tournamentId && r.team_id === teamId) ?? null;
  },

  async countConfirmed(tournamentId: string): Promise<number> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { count, error } = await sb
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .eq('tournament_id', tournamentId)
        .eq('status', 'confirmed');
      if (error) throw error;
      return count ?? 0;
    }
    return store.registrations.filter((r) => r.tournament_id === tournamentId && r.status === 'confirmed').length;
  },

  async create(dto: CreateRegistrationDto, assignedStatus: RegistrationStatus, seedNumber: number): Promise<Registration> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { data, error } = await sb
        .from('registrations')
        .insert({
          tournament_id: dto.tournament_id,
          team_id: dto.team_id,
          status: mapStatusToDb(assignedStatus),
        })
        .select('*, tournament:tournaments(*), team:teams(*)')
        .single();
      if (error) throw error;
      return mapDbReg(data);
    }

    const reg: Registration = {
      id: newId('reg'),
      tournament_id: dto.tournament_id,
      team_id: dto.team_id,
      status: assignedStatus,
      registered_at: new Date().toISOString(),
      seed_number: seedNumber,
    };
    store.registrations.push(reg);
    return enrichReg(reg);
  },

  async updateStatus(id: string, status: RegistrationStatus): Promise<Registration | null> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { data, error } = await sb
        .from('registrations')
        .update({ status: mapStatusToDb(status) })
        .eq('id', id)
        .select('*, tournament:tournaments(*), team:teams(*)')
        .maybeSingle();
      if (error) throw error;
      return data ? mapDbReg(data) : null;
    }

    const idx = store.registrations.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    store.registrations[idx].status = status;
    return enrichReg(store.registrations[idx]);
  },

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { error } = await sb.from('registrations').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    const idx = store.registrations.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    store.registrations.splice(idx, 1);
    return true;
  },
};

function enrichReg(r: Registration): Registration {
  const team = store.teams.find((t) => t.id === r.team_id);
  const tournament = store.tournaments.find((t) => t.id === r.tournament_id);
  return { ...r, team, tournament };
}

function mapDbReg(row: any): Registration {
  return {
    id: row.id,
    tournament_id: row.tournament_id,
    team_id: row.team_id,
    status: mapDbStatus(row.status),
    registered_at: row.registered_at,
    seed_number: row.seed_number,
    tournament: row.tournament ?? undefined,
    team: row.team ?? undefined,
  };
}

function mapStatusToDb(status: RegistrationStatus): string {
  // DB schema only has 'registered' and 'withdrawn'; map our richer set
  switch (status) {
    case 'confirmed': return 'registered';
    case 'pending': return 'registered';
    case 'waitlist': return 'registered';
    case 'cancelled': return 'withdrawn';
    default: return 'registered';
  }
}

function mapDbStatus(dbStatus: string): RegistrationStatus {
  switch (dbStatus) {
    case 'withdrawn': return 'cancelled';
    case 'registered':
    default: return 'confirmed';
  }
}

/**
 * Matches repository — Supabase and in-memory implementations.
 */

import { getSupabaseClient } from '../lib/supabase.js';
import { isSupabaseConfigured } from '../config/index.js';
import { store, newId } from '../lib/store.js';
import { Match, MatchStatus, CreateMatchDto, UpdateMatchDto } from '../types/index.js';

export const matchesRepo = {
  async getAll(tournamentId?: string): Promise<Match[]> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      let q = sb
        .from('matches')
        .select('*, tournament:tournaments(id,title), team1:teams!matches_team_a_id_fkey(*), team2:teams!matches_team_b_id_fkey(*)')
        .order('scheduled_at', { ascending: true });
      if (tournamentId) q = q.eq('tournament_id', tournamentId);
      const { data, error } = await q;
      if (error) throw error;
      return (data as any[]).map(mapDbMatch);
    }

    let list = [...store.matches];
    if (tournamentId) list = list.filter((m) => m.tournament_id === tournamentId);
    return list.map(enrichMatch);
  },

  async getById(id: string): Promise<Match | null> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { data, error } = await sb
        .from('matches')
        .select('*, tournament:tournaments(id,title), team1:teams!matches_team_a_id_fkey(*), team2:teams!matches_team_b_id_fkey(*)')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? mapDbMatch(data) : null;
    }
    const m = store.matches.find((m) => m.id === id);
    return m ? enrichMatch(m) : null;
  },

  async create(dto: CreateMatchDto): Promise<Match> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { data, error } = await sb
        .from('matches')
        .insert({
          tournament_id: dto.tournament_id,
          team_a_id: dto.team1_id,
          team_b_id: dto.team2_id,
          round_number: dto.round_number ?? 1,
          scheduled_at: new Date(dto.scheduled_at).toISOString(),
          status: 'scheduled',
          score_a: null,
          score_b: null,
        })
        .select('*, tournament:tournaments(id,title), team1:teams!matches_team_a_id_fkey(*), team2:teams!matches_team_b_id_fkey(*)')
        .single();
      if (error) throw error;
      return mapDbMatch(data);
    }

    const match: Match = {
      id: newId('match'),
      tournament_id: dto.tournament_id,
      team1_id: dto.team1_id,
      team2_id: dto.team2_id,
      round: dto.round,
      round_number: dto.round_number ?? 1,
      scheduled_at: new Date(dto.scheduled_at).toISOString(),
      status: 'scheduled',
      team1_score: 0,
      team2_score: 0,
      winner_id: null,
      notes: dto.notes ?? '',
      created_at: new Date().toISOString(),
    };
    store.matches.unshift(match);
    return enrichMatch(match);
  },

  async update(id: string, dto: UpdateMatchDto): Promise<Match | null> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const patch: Record<string, unknown> = {};
      if (dto.scheduled_at !== undefined) patch['scheduled_at'] = new Date(dto.scheduled_at).toISOString();
      if (dto.round_number !== undefined) patch['round_number'] = dto.round_number;
      if (dto.status !== undefined) patch['status'] = dto.status;
      if (dto.team1_score !== undefined) patch['score_a'] = dto.team1_score;
      if (dto.team2_score !== undefined) patch['score_b'] = dto.team2_score;

      const { data, error } = await sb
        .from('matches')
        .update(patch)
        .eq('id', id)
        .select('*, tournament:tournaments(id,title), team1:teams!matches_team_a_id_fkey(*), team2:teams!matches_team_b_id_fkey(*)')
        .maybeSingle();
      if (error) throw error;
      return data ? mapDbMatch(data) : null;
    }

    const idx = store.matches.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    const cur = store.matches[idx];

    // Auto-compute winner_id when completing a match
    let winnerId = dto.winner_id !== undefined ? dto.winner_id : cur.winner_id;
    const newStatus = dto.status ?? cur.status;
    const s1 = dto.team1_score !== undefined ? dto.team1_score : cur.team1_score;
    const s2 = dto.team2_score !== undefined ? dto.team2_score : cur.team2_score;
    if (newStatus === 'completed' && dto.winner_id === undefined) {
      if (s1 > s2) winnerId = cur.team1_id;
      else if (s2 > s1) winnerId = cur.team2_id;
      else winnerId = null;
    }

    const updated: Match = {
      ...cur,
      ...(dto.scheduled_at !== undefined && { scheduled_at: new Date(dto.scheduled_at).toISOString() }),
      ...(dto.round !== undefined && { round: dto.round }),
      ...(dto.round_number !== undefined && { round_number: dto.round_number }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.team1_score !== undefined && { team1_score: dto.team1_score }),
      ...(dto.team2_score !== undefined && { team2_score: dto.team2_score }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      winner_id: winnerId ?? null,
      updated_at: new Date().toISOString(),
    };
    store.matches[idx] = updated;
    return enrichMatch(updated);
  },

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { error } = await sb.from('matches').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    const idx = store.matches.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    store.matches.splice(idx, 1);
    return true;
  },

  async getCompletedByTournament(tournamentId?: string): Promise<Match[]> {
    const all = await this.getAll(tournamentId);
    return all.filter((m) => m.status === 'completed');
  },
};

function enrichMatch(m: Match): Match {
  const tournament = store.tournaments.find((t) => t.id === m.tournament_id);
  const team1 = store.teams.find((t) => t.id === m.team1_id);
  const team2 = store.teams.find((t) => t.id === m.team2_id);
  return { ...m, tournament, team1, team2 };
}

function mapDbMatch(row: any): Match {
  return {
    id: row.id,
    tournament_id: row.tournament_id,
    tournament: row.tournament ?? undefined,
    team1_id: row.team_a_id,
    team1: row.team1 ?? undefined,
    team2_id: row.team_b_id,
    team2: row.team2 ?? undefined,
    round: `Round ${row.round_number}`,
    round_number: row.round_number,
    scheduled_at: row.scheduled_at ?? new Date().toISOString(),
    status: row.status as MatchStatus,
    team1_score: row.score_a ?? 0,
    team2_score: row.score_b ?? 0,
    winner_id: row.winner_id ?? null,
    notes: row.notes ?? '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Teams repository.
 * Supports MongoDB Atlas, Supabase, and in-memory storage.
 * Prioritizes MongoDB Atlas when MONGODB_URI is configured.
 */

import { connectMongo } from '../lib/mongodb.js';
import { TeamModel, toEntity } from '../models/index.js';
import { getSupabaseClient } from '../lib/supabase.js';
import { isMongoConfigured, isSupabaseConfigured } from '../config/index.js';
import { store, newId } from '../lib/store.js';
import { Team, CreateTeamDto, UpdateTeamDto } from '../types/index.js';

export const teamsRepo = {
  async getAll(): Promise<Team[]> {
    if (isMongoConfigured()) {
      await connectMongo();
      const docs = await TeamModel.find().sort({ created_at: -1 }).lean();
      return docs.map((d) => toEntity<Team>(d));
    }

    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { data, error } = await sb.from('teams').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any[]).map(mapDbTeam);
    }

    return [...store.teams];
  },

  async getById(id: string): Promise<Team | null> {
    if (isMongoConfigured()) {
      await connectMongo();
      const doc = await TeamModel.findById(id).lean();
      return doc ? toEntity<Team>(doc) : null;
    }

    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { data, error } = await sb.from('teams').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? mapDbTeam(data) : null;
    }

    return store.teams.find((t) => t.id === id) ?? null;
  },

  async findByTag(tag: string): Promise<Team | null> {
    if (isMongoConfigured()) {
      await connectMongo();
      const doc = await TeamModel.findOne({ tag: tag.toUpperCase() }).lean();
      return doc ? toEntity<Team>(doc) : null;
    }

    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { data, error } = await sb.from('teams').select('*').ilike('tag', tag).maybeSingle();
      if (error) throw error;
      return data ? mapDbTeam(data) : null;
    }

    return store.teams.find((t) => t.tag.toLowerCase() === tag.toLowerCase()) ?? null;
  },

  async create(dto: CreateTeamDto): Promise<Team> {
    if (isMongoConfigured()) {
      await connectMongo();
      const id = newId('team');
      const doc = await TeamModel.create({
        _id: id,
        name: dto.name.trim(),
        tag: dto.tag.trim().toUpperCase(),
        captain_name: dto.captain_name.trim(),
        captain_email: dto.captain_email.trim().toLowerCase(),
        logo_color: dto.logo_color ?? '#8B7CF6',
        members_count: dto.members_count ?? 5,
        created_at: new Date().toISOString(),
      });
      return toEntity<Team>(doc);
    }

    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { data, error } = await sb
        .from('teams')
        .insert({
          name: dto.name.trim(),
          tag: dto.tag.trim().toUpperCase(),
          captain_name: dto.captain_name.trim(),
          captain_email: dto.captain_email.trim().toLowerCase(),
          logo_color: dto.logo_color ?? '#8B7CF6',
          members_count: dto.members_count ?? 5,
        })
        .select()
        .single();
      if (error) throw error;
      return mapDbTeam(data);
    }

    const team: Team = {
      id: newId('team'),
      name: dto.name.trim(),
      tag: dto.tag.trim().toUpperCase(),
      captain_name: dto.captain_name.trim(),
      captain_email: dto.captain_email.trim().toLowerCase(),
      logo_color: dto.logo_color ?? '#8B7CF6',
      members_count: dto.members_count ?? 5,
      created_at: new Date().toISOString(),
    };
    store.teams.unshift(team);
    return team;
  },

  async update(id: string, dto: UpdateTeamDto): Promise<Team | null> {
    if (isMongoConfigured()) {
      await connectMongo();
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (dto.name !== undefined) patch.name = dto.name.trim();
      if (dto.tag !== undefined) patch.tag = dto.tag.trim().toUpperCase();
      if (dto.captain_name !== undefined) patch.captain_name = dto.captain_name.trim();
      if (dto.captain_email !== undefined) patch.captain_email = dto.captain_email.trim().toLowerCase();
      if (dto.logo_color !== undefined) patch.logo_color = dto.logo_color;
      if (dto.members_count !== undefined) patch.members_count = dto.members_count;

      const updated = await TeamModel.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();
      return updated ? toEntity<Team>(updated) : null;
    }

    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const patch: Record<string, unknown> = {};
      if (dto.name !== undefined) patch['name'] = dto.name.trim();
      if (dto.tag !== undefined) patch['tag'] = dto.tag.trim().toUpperCase();
      if (dto.captain_name !== undefined) patch['captain_name'] = dto.captain_name.trim();
      if (dto.captain_email !== undefined) patch['captain_email'] = dto.captain_email.trim().toLowerCase();
      if (dto.logo_color !== undefined) patch['logo_color'] = dto.logo_color;
      if (dto.members_count !== undefined) patch['members_count'] = dto.members_count;

      const { data, error } = await sb.from('teams').update(patch).eq('id', id).select().maybeSingle();
      if (error) throw error;
      return data ? mapDbTeam(data) : null;
    }

    const idx = store.teams.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const updated: Team = {
      ...store.teams[idx],
      ...(dto.name !== undefined && { name: dto.name.trim() }),
      ...(dto.tag !== undefined && { tag: dto.tag.trim().toUpperCase() }),
      ...(dto.captain_name !== undefined && { captain_name: dto.captain_name.trim() }),
      ...(dto.captain_email !== undefined && { captain_email: dto.captain_email.trim().toLowerCase() }),
      ...(dto.logo_color !== undefined && { logo_color: dto.logo_color }),
      ...(dto.members_count !== undefined && { members_count: dto.members_count }),
      updated_at: new Date().toISOString(),
    };
    store.teams[idx] = updated;
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    if (isMongoConfigured()) {
      await connectMongo();
      const res = await TeamModel.findByIdAndDelete(id);
      return !!res;
    }

    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient()!;
      const { error } = await sb.from('teams').delete().eq('id', id);
      if (error) throw error;
      return true;
    }

    const idx = store.teams.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    store.teams.splice(idx, 1);
    return true;
  },
};

function mapDbTeam(row: any): Team {
  return {
    id: row.id,
    name: row.name,
    tag: row.tag,
    captain_name: row.captain_name ?? '',
    captain_email: row.captain_email ?? '',
    logo_color: row.logo_color ?? '#8B7CF6',
    members_count: row.members_count ?? 5,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

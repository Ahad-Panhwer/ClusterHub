# Database Setup — ClusterHub / GameTrack

The database is Supabase PostgreSQL. Migrations in `migrations/` are the version-controlled schema source.

## Migration Files

1. `migrations/0001_initial_schema.sql` — Core relational tables:
   - `profiles` (linked to `auth.users`)
   - `games`
   - `teams` and `team_members`
   - `tournaments`
   - `registrations`
   - `matches`
   - B-tree performance indexes and foreign key cascades.

2. `migrations/0002_row_level_security.sql` — Row Level Security (RLS) policies:
   - Enables RLS on all 7 tables.
   - Public read policies for active games, tournaments, teams, matches, and registrations.
   - Role-based mutation policies enforcing authorization for `admin`, `organizer`, and `captain`.

3. `seeds/0001_seed_demo_data.sql` — Optional seed fixtures for local / preview environments.

## How to Apply

### Option A — Supabase Web Dashboard (Easiest)
1. Go to your Supabase project dashboard at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the left sidebar.
3. Open and run `0001_initial_schema.sql`.
4. Open and run `0002_row_level_security.sql`.
5. (Optional) Run `seeds/0001_seed_demo_data.sql` for initial game entries.

### Option B — Supabase CLI
```bash
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

## Security Best Practices
- Never commit database passwords or service-role keys to Git.
- Frontend uses `VITE_API_BASE_URL` to route all mutations through the Express backend.
- The Express backend uses `@supabase/supabase-js` with the service role key only in trusted server execution or falls back gracefully to in-memory mode when Supabase credentials are not supplied.

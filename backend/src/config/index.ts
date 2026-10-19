import dotenv from 'dotenv';
import path from 'path';

// Load .env.local first (local overrides), then fall back to .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function required(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const config = {
  port: parseInt(optional('PORT', '4000'), 10),
  nodeEnv: optional('NODE_ENV', 'development'),
  isProduction: optional('NODE_ENV', 'development') === 'production',

  // Allow comma-separated origins e.g. "http://localhost:5173,https://clusterhub.netlify.app"
  frontendOrigins: optional('FRONTEND_ORIGIN', 'http://localhost:5173').split(',').map((o) => o.trim()),

  mongodb: {
    uri: optional('MONGODB_URI', ''),
  },

  supabase: {
    url: optional('SUPABASE_URL', ''),
    anonKey: optional('SUPABASE_ANON_KEY', ''),
    serviceRoleKey: optional('SUPABASE_SERVICE_ROLE_KEY', ''),
    jwtSecret: optional('SUPABASE_JWT_SECRET', ''),
  },
};

/**
 * Returns true if MongoDB Atlas is configured via MONGODB_URI.
 */
export function isMongoConfigured(): boolean {
  return !!(
    config.mongodb.uri &&
    (config.mongodb.uri.startsWith('mongodb://') || config.mongodb.uri.startsWith('mongodb+srv://'))
  );
}

/**
 * Returns true if the Supabase connection is configured (URL and at least one key present).
 * When false, the app will use in-memory storage as a fallback for development.
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    config.supabase.url &&
    !config.supabase.url.includes('YOUR_PROJECT_REF') &&
    config.supabase.anonKey &&
    !config.supabase.anonKey.includes('YOUR_PUBLIC')
  );
}

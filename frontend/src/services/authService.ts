import { AppUser } from '../types';

export interface AuthSession {
  user: AppUser;
  token: string;
  provider: 'supabase' | 'demo';
}

const AUTH_STORAGE_KEY = 'clusterhub_session';

export const authService = {
  getCurrentSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setSession(session: AuthSession | null): void {
    if (session) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem('clusterhub_auth_token', session.token);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('clusterhub_auth_token');
    }
  },

  async signInWithDemo(role: 'organizer' | 'admin' | 'referee' = 'organizer'): Promise<AuthSession> {
    // Simulate brief network delay
    await new Promise((res) => setTimeout(res, 400));
    const session: AuthSession = {
      user: {
        id: `user-${Date.now()}`,
        email: role === 'admin' ? 'admin@clusterhub.gg' : 'abdul.ahad@clusterhub.gg',
        name: role === 'admin' ? 'Abdul Ahad (Admin)' : 'Abdul Ahad (Lead Organizer)',
        role,
        avatar: role === 'admin' ? '👑' : '🎮',
      },
      token: `demo-token-${Date.now()}`,
      provider: 'demo',
    };
    this.setSession(session);
    return session;
  },

  async signInWithEmail(email: string, _pass: string): Promise<AuthSession> {
    // Check if Supabase env is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes('your-project');

    if (isSupabaseConfigured) {
      // In production with Supabase configured
      throw new Error('Supabase client connection in progress. Please check VITE_SUPABASE_URL.');
    }

    // Development path:
    await new Promise((res) => setTimeout(res, 500));
    const session: AuthSession = {
      user: {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0],
        role: 'organizer',
        avatar: '🎮',
      },
      token: `dev-session-${Date.now()}`,
      provider: 'demo',
    };
    this.setSession(session);
    return session;
  },

  async signUpWithEmail(name: string, email: string, _pass: string): Promise<AuthSession> {
    await new Promise((res) => setTimeout(res, 600));
    const session: AuthSession = {
      user: {
        id: `user-${Date.now()}`,
        email,
        name,
        role: 'organizer',
        avatar: '🎮',
      },
      token: `dev-session-${Date.now()}`,
      provider: 'demo',
    };
    this.setSession(session);
    return session;
  },

  signOut(): void {
    this.setSession(null);
  },
};

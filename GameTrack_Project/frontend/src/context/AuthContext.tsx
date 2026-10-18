import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser } from '../types';
import { authService, AuthSession } from '../services/authService';

interface AuthContextType {
  session: AuthSession | null;
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoUser: boolean;
  loginDemo: (role?: 'organizer' | 'admin' | 'referee') => Promise<void>;
  loginEmail: (email: string, pass: string) => Promise<void>;
  signUpEmail: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check existing session or initialize demo organizer for immediate exploration
    const existing = authService.getCurrentSession();
    if (existing) {
      if (existing.user && (existing.user.name.includes('Kai Sterling') || existing.user.name.includes('Alex Mercer'))) {
        existing.user.name = existing.user.role === 'admin' ? 'Abdul Ahad (Admin)' : 'Abdul Ahad (Lead Organizer)';
        existing.user.email = existing.user.role === 'admin' ? 'admin@clusterhub.gg' : 'abdul.ahad@clusterhub.gg';
        authService.setSession(existing);
      }
      setSession(existing);
      setIsLoading(false);
    } else {
      // Default to demo session so the user can interact immediately
      authService.signInWithDemo('organizer').then((s) => {
        setSession(s);
        setIsLoading(false);
      });
    }
  }, []);

  const loginDemo = async (role: 'organizer' | 'admin' | 'referee' = 'organizer') => {
    setIsLoading(true);
    try {
      const s = await authService.signInWithDemo(role);
      setSession(s);
    } finally {
      setIsLoading(false);
    }
  };

  const loginEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const s = await authService.signInWithEmail(email, pass);
      setSession(s);
    } finally {
      setIsLoading(false);
    }
  };

  const signUpEmail = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const s = await authService.signUpWithEmail(name, email, pass);
      setSession(s);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.signOut();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        isAuthenticated: !!session,
        isLoading,
        isDemoUser: session?.provider === 'demo',
        loginDemo,
        loginEmail,
        signUpEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

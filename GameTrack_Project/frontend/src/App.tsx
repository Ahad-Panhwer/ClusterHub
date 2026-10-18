import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AppLayout } from './components/layout/AppLayout';

import { DashboardPage } from './pages/DashboardPage';
import { GamesPage } from './pages/GamesPage';
import { TournamentsPage } from './pages/TournamentsPage';
import { MatchesPage } from './pages/MatchesPage';
import { TeamsPage } from './pages/TeamsPage';
import { RegistrationsPage } from './pages/RegistrationsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="games" element={<GamesPage />} />
                <Route path="tournaments" element={<TournamentsPage />} />
                <Route path="matches" element={<MatchesPage />} />
                <Route path="teams" element={<TeamsPage />} />
                <Route path="registrations" element={<RegistrationsPage />} />
                <Route path="leaderboard" element={<LeaderboardPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="auth" element={<AuthPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

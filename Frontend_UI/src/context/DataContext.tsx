import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Game,
  Tournament,
  Match,
  Team,
  Registration,
  LeaderboardEntry,
  AppNotification,
  DashboardMetrics,
} from '../types';
import { gamesService, CreateGameDto, UpdateGameDto } from '../services/gamesService';
import { tournamentsService, CreateTournamentDto, UpdateTournamentDto } from '../services/tournamentsService';
import { matchesService, CreateMatchDto, UpdateMatchDto } from '../services/matchesService';
import { teamsService, CreateTeamDto, UpdateTeamDto } from '../services/teamsService';
import { registrationsService, CreateRegistrationDto } from '../services/registrationsService';
import { leaderboardService } from '../services/leaderboardService';
import { storage } from '../services/storage';
import { API_BASE_URL } from '../services/apiClient';

interface DataContextType {
  games: Game[];
  tournaments: Tournament[];
  matches: Match[];
  teams: Team[];
  registrations: Registration[];
  leaderboard: LeaderboardEntry[];
  notifications: AppNotification[];
  metrics: DashboardMetrics;
  useMockMode: boolean;
  setUseMockMode: (val: boolean) => void;
  apiBaseUrl: string;
  apiError: string | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  
  // Games CRUD
  createGame: (dto: CreateGameDto) => Promise<Game>;
  updateGame: (id: string, dto: UpdateGameDto) => Promise<Game>;
  deleteGame: (id: string) => Promise<void>;

  // Tournaments CRUD
  createTournament: (dto: CreateTournamentDto) => Promise<Tournament>;
  updateTournament: (id: string, dto: UpdateTournamentDto) => Promise<Tournament>;
  deleteTournament: (id: string) => Promise<void>;

  // Matches CRUD
  createMatch: (dto: CreateMatchDto) => Promise<Match>;
  updateMatch: (id: string, dto: UpdateMatchDto) => Promise<Match>;
  recordMatchScore: (id: string, team1Score: number, team2Score: number, notes?: string) => Promise<Match>;
  deleteMatch: (id: string) => Promise<void>;

  // Teams CRUD
  createTeam: (dto: CreateTeamDto) => Promise<Team>;
  updateTeam: (id: string, dto: UpdateTeamDto) => Promise<Team>;
  deleteTeam: (id: string) => Promise<void>;

  // Registrations
  createRegistration: (dto: CreateRegistrationDto) => Promise<Registration>;
  updateRegistrationStatus: (id: string, status: Registration['status']) => Promise<Registration>;
  deleteRegistration: (id: string) => Promise<void>;

  // Notifications
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Utilities
  resetDemoData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [useMockMode, setUseMockModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('clusterhub_use_mock_v1');
    return saved !== null ? saved === 'true' : false;
  });

  const [games, setGames] = useState<Game[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const setUseMockMode = (val: boolean) => {
    localStorage.setItem('clusterhub_use_mock_v1', String(val));
    setUseMockModeState(val);
  };

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [gList, tList, mList, tmList, rList] = await Promise.all([
        gamesService.getAll(useMockMode),
        tournamentsService.getAll(useMockMode),
        matchesService.getAll(undefined, useMockMode),
        teamsService.getAll(useMockMode),
        registrationsService.getAll(undefined, useMockMode),
      ]);

      setGames(gList);
      setTournaments(tList);
      setMatches(mList);
      setTeams(tmList);
      setRegistrations(rList);
      setNotifications(storage.getNotifications());
      setApiError(null);
    } catch (err: any) {
      console.error('Error fetching data from backend API:', err);
      const msg = err.message || 'API connection unavailable';
      setApiError(msg);
      // Fallback to storage so view is still navigable
      setGames(storage.getGames());
      setTournaments(storage.getTournaments());
      setMatches(storage.getMatches());
      setTeams(storage.getTeams());
      setRegistrations(storage.getRegistrations());
      setNotifications(storage.getNotifications());
    } finally {
      setLoading(false);
    }
  }, [useMockMode]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Dynamically compute leaderboard directly from teams & matches
  const leaderboard = useMemo(() => {
    return leaderboardService.calculateStandings(teams, matches);
  }, [teams, matches]);

  // Dynamically derive metrics
  const metrics: DashboardMetrics = useMemo(() => {
    const activeTournaments = tournaments.filter(
      (t) => t.status === 'in_progress' || t.status === 'registration_open'
    ).length;
    const completedTournaments = tournaments.filter((t) => t.status === 'completed').length;
    const upcomingMatches = matches.filter(
      (m) => m.status === 'scheduled' || m.status === 'in_progress'
    ).length;

    return {
      totalGames: games.length,
      totalTournaments: tournaments.length,
      totalMatches: matches.length,
      totalTeams: teams.length,
      activeTournaments,
      upcomingMatches,
      completedTournaments,
    };
  }, [games, tournaments, matches, teams]);

  // CRUD Actions
  const createGame = async (dto: CreateGameDto) => {
    const created = await gamesService.create(dto, useMockMode);
    await refreshData();
    return created;
  };

  const updateGame = async (id: string, dto: UpdateGameDto) => {
    const updated = await gamesService.update(id, dto, useMockMode);
    await refreshData();
    return updated;
  };

  const deleteGame = async (id: string) => {
    await gamesService.delete(id, useMockMode);
    await refreshData();
  };

  const createTournament = async (dto: CreateTournamentDto) => {
    const created = await tournamentsService.create(dto, useMockMode);
    await refreshData();
    return created;
  };

  const updateTournament = async (id: string, dto: UpdateTournamentDto) => {
    const updated = await tournamentsService.update(id, dto, useMockMode);
    await refreshData();
    return updated;
  };

  const deleteTournament = async (id: string) => {
    await tournamentsService.delete(id, useMockMode);
    await refreshData();
  };

  const createMatch = async (dto: CreateMatchDto) => {
    const created = await matchesService.create(dto, useMockMode);
    await refreshData();
    return created;
  };

  const updateMatch = async (id: string, dto: UpdateMatchDto) => {
    const updated = await matchesService.update(id, dto, useMockMode);
    await refreshData();
    return updated;
  };

  const recordMatchScore = async (
    id: string,
    team1Score: number,
    team2Score: number,
    notes?: string
  ) => {
    const target = matches.find((m) => m.id === id);
    let winnerId: string | null = null;
    if (target) {
      if (team1Score > team2Score) winnerId = target.team1_id;
      else if (team2Score > team1Score) winnerId = target.team2_id;
    }

    const updated = await matchesService.update(
      id,
      {
        status: 'completed',
        team1_score: team1Score,
        team2_score: team2Score,
        winner_id: winnerId,
        notes,
      },
      useMockMode
    );
    await refreshData();
    return updated;
  };

  const deleteMatch = async (id: string) => {
    await matchesService.delete(id, useMockMode);
    await refreshData();
  };

  const createTeam = async (dto: CreateTeamDto) => {
    const created = await teamsService.create(dto, useMockMode);
    await refreshData();
    return created;
  };

  const updateTeam = async (id: string, dto: UpdateTeamDto) => {
    const updated = await teamsService.update(id, dto, useMockMode);
    await refreshData();
    return updated;
  };

  const deleteTeam = async (id: string) => {
    await teamsService.delete(id, useMockMode);
    await refreshData();
  };

  const createRegistration = async (dto: CreateRegistrationDto) => {
    const created = await registrationsService.create(dto, useMockMode);
    await refreshData();
    return created;
  };

  const updateRegistrationStatus = async (id: string, status: Registration['status']) => {
    const updated = await registrationsService.updateStatus(id, status, useMockMode);
    await refreshData();
    return updated;
  };

  const deleteRegistration = async (id: string) => {
    await registrationsService.delete(id, useMockMode);
    await refreshData();
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    storage.setNotifications(updated);
  };

  const clearNotifications = () => {
    setNotifications([]);
    storage.setNotifications([]);
  };

  const resetDemoData = () => {
    storage.resetToDefault();
    refreshData();
  };

  return (
    <DataContext.Provider
      value={{
        games,
        tournaments,
        matches,
        teams,
        registrations,
        leaderboard,
        notifications,
        metrics,
        useMockMode,
        setUseMockMode,
        apiBaseUrl: API_BASE_URL,
        apiError,
        loading,
        refreshData,
        createGame,
        updateGame,
        deleteGame,
        createTournament,
        updateTournament,
        deleteTournament,
        createMatch,
        updateMatch,
        recordMatchScore,
        deleteMatch,
        createTeam,
        updateTeam,
        deleteTeam,
        createRegistration,
        updateRegistrationStatus,
        deleteRegistration,
        markNotificationRead,
        clearNotifications,
        resetDemoData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

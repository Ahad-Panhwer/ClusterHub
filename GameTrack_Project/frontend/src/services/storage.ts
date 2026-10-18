import { Game, Tournament, Team, Match, Registration, AppNotification } from '../types';
import {
  INITIAL_GAMES,
  INITIAL_TOURNAMENTS,
  INITIAL_TEAMS,
  INITIAL_MATCHES,
  INITIAL_REGISTRATIONS,
  INITIAL_NOTIFICATIONS,
} from './mockData';

const STORAGE_KEYS = {
  GAMES: 'clusterhub_games_v1',
  TOURNAMENTS: 'clusterhub_tournaments_v1',
  TEAMS: 'clusterhub_teams_v1',
  MATCHES: 'clusterhub_matches_v1',
  REGISTRATIONS: 'clusterhub_registrations_v1',
  NOTIFICATIONS: 'clusterhub_notifications_v1',
  AUTH_USER: 'clusterhub_auth_user_v1',
  USE_MOCK: 'clusterhub_use_mock_v1',
};

export const storage = {
  getGames(): Game[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAMES);
      return data ? JSON.parse(data) : INITIAL_GAMES;
    } catch {
      return INITIAL_GAMES;
    }
  },

  setGames(games: Game[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
    } catch (e) {
      console.warn('LocalStorage error saving games', e);
    }
  },

  getTournaments(): Tournament[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
      return data ? JSON.parse(data) : INITIAL_TOURNAMENTS;
    } catch {
      return INITIAL_TOURNAMENTS;
    }
  },

  setTournaments(tournaments: Tournament[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
    } catch (e) {
      console.warn('LocalStorage error saving tournaments', e);
    }
  },

  getTeams(): Team[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
      return data ? JSON.parse(data) : INITIAL_TEAMS;
    } catch {
      return INITIAL_TEAMS;
    }
  },

  setTeams(teams: Team[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    } catch (e) {
      console.warn('LocalStorage error saving teams', e);
    }
  },

  getMatches(): Match[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
      return data ? JSON.parse(data) : INITIAL_MATCHES;
    } catch {
      return INITIAL_MATCHES;
    }
  },

  setMatches(matches: Match[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
    } catch (e) {
      console.warn('LocalStorage error saving matches', e);
    }
  },

  getRegistrations(): Registration[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
      return data ? JSON.parse(data) : INITIAL_REGISTRATIONS;
    } catch {
      return INITIAL_REGISTRATIONS;
    }
  },

  setRegistrations(registrations: Registration[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
    } catch (e) {
      console.warn('LocalStorage error saving registrations', e);
    }
  },

  getNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  setNotifications(notifications: AppNotification[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.warn('LocalStorage error saving notifications', e);
    }
  },

  resetToDefault(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(INITIAL_GAMES));
      localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(INITIAL_TOURNAMENTS));
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(INITIAL_MATCHES));
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(INITIAL_REGISTRATIONS));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    } catch (e) {
      console.warn('LocalStorage reset error', e);
    }
  },
};

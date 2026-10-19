import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Plus,
  LogOut,
  Settings,
  User,
  ExternalLink,
  Database,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { NotificationPanel } from '../ui/NotificationPanel';
import { SearchModal } from '../ui/SearchModal';
import { Button } from '../ui/Button';

interface TopNavProps {
  onMobileMenuOpen: () => void;
  onOpenCreateTournament?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onMobileMenuOpen,
  onOpenCreateTournament,
}) => {
  const { user, logout, isDemoUser } = useAuth();
  const { notifications, useMockMode } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute Page Title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Overview';
    if (path.startsWith('/games')) return 'Games Management';
    if (path.startsWith('/tournaments')) return 'Tournaments';
    if (path.startsWith('/matches')) return 'Match Schedule & Results';
    if (path.startsWith('/teams')) return 'Registered Teams';
    if (path.startsWith('/registrations')) return 'Tournament Registrations';
    if (path.startsWith('/leaderboard')) return 'Official Leaderboard';
    if (path.startsWith('/settings')) return 'System Settings';
    if (path.startsWith('/auth')) return 'Authentication';
    return 'ClusterHub';
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between h-18 px-4 sm:px-8 bg-white/95 backdrop-blur-md border-b border-[#E9EAF3] shadow-[0_1px_12px_rgba(37,40,66,0.02)]">
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuOpen}
            className="md:hidden p-2 rounded-xl text-[#777D96] hover:text-[#252842] hover:bg-[#F1EEFF] transition-colors"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-[#252842] tracking-tight font-heading">
              {getPageTitle()}
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#777D96]">
              <span className="font-medium text-[#8B7CF6]">ClusterHub</span>
              <span aria-hidden="true" className="text-[#D8DAE8]">/</span>
              <span className="capitalize">{location.pathname.replace('/', '') || 'overview'}</span>
            </div>
          </div>
        </div>

        {/* Right: Search, Mode indicator, Notifications, Quick Action, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-[#E9EAF3] bg-[#F8F9FE] text-xs text-[#777D96] hover:text-[#252842] hover:border-[#8B7CF6]/40 hover:bg-white transition-all shadow-2xs"
            title="Search (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-[#8B7CF6]" />
            <span className="hidden sm:inline font-medium">Search tournaments, games, teams...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-bold text-[#8B7CF6] bg-[#F1EEFF] rounded-md border border-[#E0D8FD]">
              ⌘K
            </kbd>
          </button>

          {/* Mode Pill: clearly informs user of mock vs live API */}
          <div
            onClick={() => navigate('/settings')}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border cursor-pointer transition-all shadow-2xs ${
              useMockMode
                ? 'bg-[#F1EEFF] border-[#E0D8FD] text-[#8B7CF6] hover:bg-[#E5E0FD]'
                : 'bg-[#ECFDF5] border-[#C6F5E1] text-[#0D6B49] hover:bg-[#D6F8EB]'
            }`}
            title="Click to view API settings"
          >
            <Database className="w-3 h-3" />
            <span>{useMockMode ? 'Dev Mock Mode' : 'Express API'}</span>
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className="relative p-2 rounded-xl text-[#777D96] hover:text-[#252842] hover:bg-[#F1EEFF] transition-colors border border-transparent hover:border-[#E9EAF3]"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#8B7CF6] ring-2 ring-white shadow-[0_0_8px_#8B7CF6]" />
              )}
            </button>

            <NotificationPanel
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />
          </div>

          {/* Contextual Action Button */}
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              if (onOpenCreateTournament) {
                onOpenCreateTournament();
              } else {
                navigate('/tournaments');
              }
            }}
            className="hidden sm:inline-flex shadow-sm shadow-[#8B7CF6]/25"
          >
            Create Tournament
          </Button>

          {/* User Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F1EEFF] transition-all border border-transparent hover:border-[#E9EAF3]"
              aria-label="User account menu"
            >
              <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-[#8B7CF6] to-[#67B7F7] flex items-center justify-center text-white text-xs font-bold shadow-xs ring-2 ring-white">
                {user?.avatar || (user?.name ? user.name[0].toUpperCase() : 'U')}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-[#252842] leading-tight">
                  {user?.name || 'Organizer'}
                </span>
                <span className="text-[10px] text-[#777D96] uppercase font-bold tracking-wider">
                  {user?.role || 'Organizer'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#777D96] hidden xl:block" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-[#E9EAF3] shadow-pastel-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-[#E9EAF3] mb-1">
                  <p className="text-xs font-bold text-[#252842]">{user?.name}</p>
                  <p className="text-[11px] text-[#777D96] truncate">{user?.email}</p>
                  {isDemoUser && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm bg-[#FFD978]/30 text-[#96680A]">
                      Demo Session
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    navigate('/settings');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#252842] hover:bg-[#F1EEFF] transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-[#777D96]" />
                  Settings &amp; API
                </button>

                <button
                  onClick={() => {
                    navigate('/auth');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#252842] hover:bg-[#F1EEFF] transition-colors text-left"
                >
                  <User className="w-4 h-4 text-[#777D96]" />
                  Switch User / Auth
                </button>

                <div className="my-1 border-t border-[#E9EAF3]" />

                <button
                  onClick={() => {
                    logout();
                    setIsProfileMenuOpen(false);
                    navigate('/auth');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#932710] hover:bg-[#FFAD91]/20 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-[#FFAD91]" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

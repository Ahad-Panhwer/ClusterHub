import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Gamepad2,
  Trophy,
  Swords,
  Users,
  ClipboardList,
  Award,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  onItemClick,
}) => {
  const { games, tournaments, matches, teams } = useData();

  const navItems = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Games', to: '/games', icon: Gamepad2, count: games.length },
    {
      name: 'Tournaments',
      to: '/tournaments',
      icon: Trophy,
      count: tournaments.filter((t) => t.status === 'in_progress' || t.status === 'registration_open').length,
    },
    {
      name: 'Matches',
      to: '/matches',
      icon: Swords,
      count: matches.filter((m) => m.status === 'in_progress').length,
      pulse: matches.some((m) => m.status === 'in_progress'),
    },
    { name: 'Teams', to: '/teams', icon: Users, count: teams.length },
    { name: 'Registrations', to: '/registrations', icon: ClipboardList },
    { name: 'Leaderboard', to: '/leaderboard', icon: Award },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-[#E9EAF3] h-screen transition-all duration-300 select-none z-30 shadow-[1px_0_12px_rgba(37,40,66,0.02)] ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-18 px-5 border-b border-[#E9EAF3]">
        <NavLink
          to="/"
          onClick={onItemClick}
          className="flex items-center gap-3 overflow-hidden group focus-visible:outline-none"
        >
          {/* Logo Mark: Gamepad with connected nodes/trophy in lavender */}
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-[#8B7CF6] via-[#9F91FC] to-[#67B7F7] flex items-center justify-center text-white shadow-md shadow-[#8B7CF6]/25 shrink-0 group-hover:scale-105 group-hover:rotate-2 transition-all">
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M7 6H17C19.7614 6 22 8.23858 22 11V16C22 18.2091 20.2091 20 18 20H16.5L14 17.5H10L7.5 20H6C3.79086 20 2 18.2091 2 16V11C2 8.23858 4.23858 6 7 6Z" fillOpacity="0.9" />
              <circle cx="8" cy="12" r="1.5" fill="#252842" />
              <circle cx="16" cy="11" r="1" fill="#FFAD91" />
              <circle cx="17.5" cy="12.5" r="1" fill="#6FD6B0" />
              <circle cx="14.5" cy="12.5" r="1" fill="#FFD978" />
            </svg>
          </div>

          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-lg text-[#252842] tracking-tight flex items-center gap-1">
                Cluster<span className="text-[#8B7CF6]">Hub</span>
              </span>
              <span className="text-[10px] text-[#777D96] font-semibold tracking-tight">
                Play Together. Compete Better.
              </span>
            </div>
          )}
        </NavLink>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-xl text-[#777D96] hover:text-[#252842] hover:bg-[#F1EEFF] transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#777D96]">
            Main Menu
          </p>
        )}

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onItemClick}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group relative ${
                isActive
                  ? 'bg-linear-to-r from-[#F1EEFF] to-[#FAF8FF] text-[#8B7CF6] shadow-2xs font-bold border-l-3 border-[#8B7CF6]'
                  : 'text-[#777D96] hover:text-[#252842] hover:bg-[#F8F9FE]'
              } ${collapsed ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? item.name : undefined}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon
                    className={`w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                      isActive ? 'text-[#8B7CF6]' : 'text-[#777D96] group-hover:text-[#252842]'
                    }`}
                  />
                  {item.pulse && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#67B7F7] ring-2 ring-white animate-ping" />
                  )}
                </div>

                {!collapsed && (
                  <span className="flex-1 truncate">{item.name}</span>
                )}

                {!collapsed && item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                      isActive
                        ? 'bg-[#8B7CF6] border-[#8B7CF6] text-white shadow-2xs'
                        : 'bg-[#F1EEFF] border-[#E5E0FD] text-[#8B7CF6]'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Sidebar Footer Pro Tip Card */}
      {!collapsed && (
        <div className="p-3.5 mx-3 mb-4 rounded-2xl bg-linear-to-br from-[#F1EEFF]/80 via-[#FAF8FF] to-[#EBF5FE]/60 border border-[#E9EAF3] shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#8B7CF6]">
              <Sparkles className="w-3.5 h-3.5" />
              Tournament System
            </div>
            <span className="w-2 h-2 rounded-full bg-[#6FD6B0] animate-pulse" />
          </div>
          <p className="text-[11px] text-[#777D96] leading-relaxed">
            Manage brackets, seed rosters, and record official results in real-time.
          </p>
        </div>
      )}
    </aside>
  );
};

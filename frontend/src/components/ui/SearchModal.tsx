import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trophy, Gamepad2, Users, Swords, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { games, tournaments, teams, matches } = useData();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredTournaments = q
    ? tournaments.filter((t) => t.title.toLowerCase().includes(q))
    : tournaments.slice(0, 3);

  const filteredGames = q
    ? games.filter((g) => g.title.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q))
    : games.slice(0, 3);

  const filteredTeams = q
    ? teams.filter((tm) => tm.name.toLowerCase().includes(q) || tm.tag.toLowerCase().includes(q))
    : teams.slice(0, 3);

  const filteredMatches = q
    ? matches.filter(
        (m) =>
          m.round.toLowerCase().includes(q) ||
          m.team1?.name.toLowerCase().includes(q) ||
          m.team2?.name.toLowerCase().includes(q)
      )
    : matches.slice(0, 3);

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#252842]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="min-h-full flex items-start justify-center p-4 pt-16 sm:pt-24">
        <div
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-xl bg-white rounded-2xl border border-[#E9EAF3] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E9EAF3] bg-white">
            <Search className="w-5 h-5 text-[#777D96]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tournaments, games, teams, matches..."
              className="w-full bg-transparent text-sm text-[#252842] placeholder:text-[#777D96] focus:outline-none"
            />
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-[#777D96] bg-[#F1EEFF] rounded-md">
              ESC
            </kbd>
          </div>

          {/* Results list */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            {/* Tournaments */}
            {filteredTournaments.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#777D96] mb-2 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-[#8B7CF6]" /> Tournaments
                </p>
                <div className="space-y-1">
                  {filteredTournaments.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleSelect('/tournaments')}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F1EEFF]/50 cursor-pointer transition-colors group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#252842] group-hover:text-[#8B7CF6]">
                          {t.title}
                        </p>
                        <p className="text-xs text-[#777D96]">
                          {t.game?.title || 'Game'} · {t.format} · ${t.prize_pool.toLocaleString()}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#777D96] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Games */}
            {filteredGames.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#777D96] mb-2 flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-[#67B7F7]" /> Games
                </p>
                <div className="space-y-1">
                  {filteredGames.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => handleSelect('/games')}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F1EEFF]/50 cursor-pointer transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#252842] group-hover:text-[#8B7CF6]">
                          {g.title}
                        </p>
                        <p className="text-xs text-[#777D96]">
                          {g.genre} · {g.platform}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#777D96] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teams */}
            {filteredTeams.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#777D96] mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#6FD6B0]" /> Teams
                </p>
                <div className="space-y-1">
                  {filteredTeams.map((tm) => (
                    <div
                      key={tm.id}
                      onClick={() => handleSelect('/teams')}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F1EEFF]/50 cursor-pointer transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#252842] group-hover:text-[#8B7CF6]">
                          [{tm.tag}] {tm.name}
                        </p>
                        <p className="text-xs text-[#777D96]">
                          Captain: {tm.captain_name} · {tm.members_count} players
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#777D96] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matches */}
            {filteredMatches.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#777D96] mb-2 flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-[#FFAD91]" /> Matches
                </p>
                <div className="space-y-1">
                  {filteredMatches.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleSelect('/matches')}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F1EEFF]/50 cursor-pointer transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#252842] group-hover:text-[#8B7CF6]">
                          {m.team1?.name || 'TBD'} vs {m.team2?.name || 'TBD'}
                        </p>
                        <p className="text-xs text-[#777D96]">
                          {m.round} · Status: {m.status.replace('_', ' ')}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#777D96] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredTournaments.length === 0 &&
              filteredGames.length === 0 &&
              filteredTeams.length === 0 &&
              filteredMatches.length === 0 && (
                <div className="text-center py-8 text-xs text-[#777D96]">
                  No results found for "{query}".
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

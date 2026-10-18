import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Tournament, Match, Game } from '../../types';
import { Trophy, Swords, PieChart, BarChart3 } from 'lucide-react';

interface TournamentActivityChartProps {
  tournaments: Tournament[];
  matches: Match[];
  games: Game[];
}

export const TournamentActivityChart: React.FC<TournamentActivityChartProps> = ({
  tournaments,
  matches,
  games,
}) => {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'matches'>('tournaments');

  // Compute status distributions
  const tournStatusCounts = {
    in_progress: tournaments.filter((t) => t.status === 'in_progress').length,
    registration_open: tournaments.filter((t) => t.status === 'registration_open').length,
    completed: tournaments.filter((t) => t.status === 'completed').length,
    draft: tournaments.filter((t) => t.status === 'draft').length,
  };

  const matchStatusCounts = {
    completed: matches.filter((m) => m.status === 'completed').length,
    in_progress: matches.filter((m) => m.status === 'in_progress').length,
    scheduled: matches.filter((m) => m.status === 'scheduled').length,
  };

  // Compute games activity
  const gameStats = games.map((game) => {
    const tCount = tournaments.filter((t) => t.game_id === game.id).length;
    return {
      title: game.title,
      color: game.banner_color || '#8B7CF6',
      tournaments: tCount,
    };
  });

  const maxTournaments = Math.max(...gameStats.map((g) => g.tournaments), 1);

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-[#252842] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#8B7CF6]" />
            Competition Analytics
          </h3>
          <p className="text-xs text-[#777D96] mt-0.5">
            Tournament progression and game distribution across the platform
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-[#F8F9FE] border border-[#E9EAF3] rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tournaments'
                ? 'bg-white text-[#252842] shadow-xs'
                : 'text-[#777D96] hover:text-[#252842]'
            }`}
          >
            Game Activity
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'matches'
                ? 'bg-white text-[#252842] shadow-xs'
                : 'text-[#777D96] hover:text-[#252842]'
            }`}
          >
            Status Breakdown
          </button>
        </div>
      </div>

      {activeTab === 'tournaments' ? (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-[#777D96]">
            Tournaments Organized per Title:
          </p>

          <div className="space-y-3">
            {gameStats.map((item) => {
              const percentage = Math.round((item.tournaments / maxTournaments) * 100);
              return (
                <div key={item.title} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#252842]">{item.title}</span>
                    <span className="text-[#777D96]">
                      {item.tournaments} {item.tournaments === 1 ? 'tournament' : 'tournaments'}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-[#F1EEFF] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.max(percentage, 8)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Tournament Status Bars */}
          <div className="p-4 rounded-xl bg-[#F8F9FE] border border-[#E9EAF3] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#252842] flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[#8B7CF6]" /> Tournaments by Phase
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#777D96] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#67B7F7]" /> In Progress
                </span>
                <span className="font-bold text-[#252842]">{tournStatusCounts.in_progress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#777D96] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6FD6B0]" /> Open for Registration
                </span>
                <span className="font-bold text-[#252842]">{tournStatusCounts.registration_open}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#777D96] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFD978]" /> Drafts
                </span>
                <span className="font-bold text-[#252842]">{tournStatusCounts.draft}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#777D96] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8B7CF6]" /> Completed
                </span>
                <span className="font-bold text-[#252842]">{tournStatusCounts.completed}</span>
              </div>
            </div>
          </div>

          {/* Match Status Distribution */}
          <div className="p-4 rounded-xl bg-[#F8F9FE] border border-[#E9EAF3] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#252842] flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-[#67B7F7]" /> Match Breakdown
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#777D96] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6FD6B0]" /> Completed Matches
                </span>
                <span className="font-bold text-[#252842]">{matchStatusCounts.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#777D96] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#67B7F7] animate-pulse" /> Live Now
                </span>
                <span className="font-bold text-[#252842]">{matchStatusCounts.in_progress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#777D96] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFD978]" /> Scheduled
                </span>
                <span className="font-bold text-[#252842]">{matchStatusCounts.scheduled}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

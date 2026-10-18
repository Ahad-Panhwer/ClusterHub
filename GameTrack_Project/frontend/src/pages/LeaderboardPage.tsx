import React, { useState } from 'react';
import {
  Award,
  Trophy,
  Medal,
  Flame,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  Percent,
  Sparkles,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { leaderboardService } from '../services/leaderboardService';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { TournamentTrophyIllustration } from '../components/ui/GamingIllustrations';

export const LeaderboardPage: React.FC = () => {
  const { teams, matches, tournaments, loading } = useData();
  const [selectedTournament, setSelectedTournament] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate standings from verified matches
  const standings = leaderboardService.calculateStandings(teams, matches, selectedTournament);

  const filteredStandings = standings.filter((entry) => {
    const q = searchQuery.toLowerCase();
    return (
      entry.team.name.toLowerCase().includes(q) ||
      entry.team.tag.toLowerCase().includes(q)
    );
  });

  const top3 = standings.filter((s) => s.matches_played > 0).slice(0, 3);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-xl bg-[#FEF9EB] text-[#96680A] flex items-center justify-center font-extrabold text-sm shadow-xs border border-[#FDE8B5]">
          <Trophy className="w-4 h-4 text-[#FFD978]" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-xl bg-[#F1EEFF] text-[#6C5CDA] flex items-center justify-center font-extrabold text-sm shadow-xs border border-[#E0D8FD]">
          <Medal className="w-4 h-4 text-[#8B7CF6]" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-xl bg-[#FFF2EE] text-[#932710] flex items-center justify-center font-extrabold text-sm shadow-xs border border-[#FFD4C4]">
          <Award className="w-4 h-4 text-[#FFAD91]" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-[#F8F9FE] text-[#777D96] flex items-center justify-center font-bold text-xs border border-[#E9EAF3]">
        #{rank}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#252842] tracking-tight font-heading flex items-center gap-2">
            <Award className="w-6 h-6 text-[#8B7CF6]" />
            Official Standings &amp; Leaderboard
          </h2>
          <p className="text-xs sm:text-sm text-[#777D96] mt-0.5">
            Real-time rankings calculated directly from completed match results and victory points.
          </p>
        </div>
      </div>

      {/* Podium Highlight for Top 3 Teams */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {top3.map((entry) => {
            const isFirst = entry.rank === 1;
            const isSecond = entry.rank === 2;
            const isThird = entry.rank === 3;

            return (
              <Card
                key={entry.team_id}
                className={`relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-pastel-md ${
                  isFirst
                    ? 'bg-linear-to-b from-[#FFFDF5] to-white border-[#FDE8B5] ring-2 ring-[#FFD978]/60 shadow-pastel-sm'
                    : isSecond
                    ? 'bg-linear-to-b from-[#FAF8FF] to-white border-[#E0D8FD]'
                    : 'bg-linear-to-b from-[#FFF7F4] to-white border-[#FFD4C4]'
                }`}
              >
                {isFirst && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#FFD978] text-[#96680A] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs border border-[#F5B942]">
                    <Sparkles className="w-3 h-3 text-[#96680A]" />
                    Championship Leader
                  </div>
                )}

                <div className="flex items-center gap-3.5 mb-4">
                  {getRankBadge(entry.rank)}
                  <div>
                    <h3 className="text-base font-extrabold text-[#252842] font-heading">
                      {entry.team.name}
                    </h3>
                    <p className="text-xs text-[#777D96] font-medium">Tag: [{entry.team.tag}]</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-white/80 backdrop-blur-xs border border-[#E9EAF3] text-center text-xs shadow-2xs">
                  <div>
                    <span className="text-[10px] text-[#777D96] uppercase font-bold">Points</span>
                    <p className="font-extrabold text-base text-[#8B7CF6] mt-0.5">
                      {entry.points}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#777D96] uppercase font-bold">Record</span>
                    <p className="font-bold text-xs text-[#252842] mt-1">
                      <span className="text-[#0D6B49]">{entry.wins}W</span> -{' '}
                      <span className="text-[#932710]">{entry.losses}L</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#777D96] uppercase font-bold">Win Rate</span>
                    <p className="font-extrabold text-sm text-[#0D6B49] mt-0.5">
                      {entry.win_rate}%
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8">
            <Input
              placeholder="Search leaderboard by team name or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="sm:col-span-4">
            <Select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              options={[
                { value: 'all', label: 'All Concluded Tournaments' },
                ...tournaments.map((t) => ({ value: t.id, label: t.title })),
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Leaderboard Table */}
      {filteredStandings.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-8 h-8 text-[#8B7CF6]" />}
          title="No standings available"
          description="Standings will populate as tournament matches are recorded and completed."
        />
      ) : (
        <Card className="p-0 overflow-hidden border-[#E9EAF3] shadow-pastel-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#252842]">
              <thead className="bg-[#F8F9FE] text-[11px] font-bold uppercase tracking-wider text-[#777D96] border-b border-[#E9EAF3]">
                <tr>
                  <th className="px-5 py-3.5 text-center w-16">Rank</th>
                  <th className="px-5 py-3.5">Team</th>
                  <th className="px-5 py-3.5 text-center">Played</th>
                  <th className="px-5 py-3.5 text-center">Wins</th>
                  <th className="px-5 py-3.5 text-center">Losses</th>
                  <th className="px-5 py-3.5 text-center w-36">Win Rate</th>
                  <th className="px-5 py-3.5 text-right font-extrabold">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EAF3]">
                {filteredStandings.map((entry) => (
                  <tr
                    key={entry.team_id}
                    className="hover:bg-[#F1EEFF]/35 transition-colors group"
                  >
                    <td className="px-5 py-4 text-center font-bold">
                      <div className="flex justify-center">{getRankBadge(entry.rank)}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs text-white shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: entry.team.logo_color || '#8B7CF6' }}
                        >
                          {entry.team.tag}
                        </div>
                        <div>
                          <p className="font-extrabold text-[#252842] group-hover:text-[#8B7CF6] transition-colors">{entry.team.name}</p>
                          <span className="text-xs text-[#777D96] font-medium">
                            Captain: {entry.team.captain_name}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center font-bold text-[#777D96]">
                      {entry.matches_played}
                    </td>

                    <td className="px-5 py-4 text-center font-extrabold text-[#0D6B49]">
                      {entry.wins}
                    </td>

                    <td className="px-5 py-4 text-center font-extrabold text-[#A63519]">
                      {entry.losses}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`font-extrabold text-xs ${
                            entry.win_rate >= 50 ? 'text-[#0D6B49]' : 'text-[#777D96]'
                          }`}
                        >
                          {entry.win_rate}%
                        </span>
                        <div className="w-20 h-1.5 bg-[#E9EAF3] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              entry.win_rate >= 60
                                ? 'bg-[#6FD6B0]'
                                : entry.win_rate >= 40
                                ? 'bg-[#67B7F7]'
                                : 'bg-[#FFAD91]'
                            }`}
                            style={{ width: `${entry.win_rate}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className="inline-block px-3 py-1 rounded-xl bg-[#F1EEFF] border border-[#E0D8FD] font-extrabold text-sm text-[#8B7CF6] shadow-2xs">
                        {entry.points} pts
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

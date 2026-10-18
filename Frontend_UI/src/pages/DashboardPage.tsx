import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  Trophy,
  Swords,
  Users,
  Plus,
  Calendar,
  ArrowRight,
  Sparkles,
  Flame,
  Award,
  CheckCircle2,
  Clock,
  Shield,
  Zap,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { StatsCard } from '../components/charts/StatsCard';
import { TournamentActivityChart } from '../components/charts/TournamentActivityChart';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { GameControllerIllustration } from '../components/ui/GamingIllustrations';

export const DashboardPage: React.FC<{
  onOpenCreateGame?: () => void;
  onOpenCreateTournament?: () => void;
  onOpenScheduleMatch?: () => void;
}> = ({ onOpenCreateGame, onOpenCreateTournament, onOpenScheduleMatch }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { games, tournaments, matches, teams, metrics } = useData();

  // Upcoming Tournaments (registration_open or in_progress)
  const activeTournaments = tournaments
    .filter((t) => t.status === 'in_progress' || t.status === 'registration_open')
    .slice(0, 3);

  // Upcoming Matches (scheduled or in_progress)
  const activeMatches = matches
    .filter((m) => m.status === 'scheduled' || m.status === 'in_progress')
    .slice(0, 3);

  // Recent Completed Matches
  const recentCompleted = matches
    .filter((m) => m.status === 'completed')
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner with Bespoke Gaming Illustration */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#8B7CF6] via-[#9F91FC] to-[#67B7F7] p-6 sm:p-8 text-white shadow-pastel-lg">
        {/* Soft floating glow orbs */}
        <div className="absolute top-0 right-1/3 -mt-12 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-10 w-48 h-48 rounded-full bg-[#FFD978]/25 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-white/95 border border-white/20 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD978]" />
              <span>Play Together. Compete Better.</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#6FD6B0] ml-1 animate-pulse" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading leading-tight">
              Welcome to your gaming hub{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </h2>

            <p className="text-white/90 text-sm leading-relaxed max-w-lg">
              Centralized platform for managing game titles, esports brackets, verified match
              results, and live leaderboards with competitive precision.
            </p>

            {/* Quick Action Buttons in Banner */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/tournaments')}
                className="bg-white/95 text-[#252842] hover:bg-white border-transparent shadow-sm hover:scale-102 transition-all font-bold"
                leftIcon={<Trophy className="w-4 h-4 text-[#8B7CF6]" />}
              >
                Browse Tournaments
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/matches')}
                className="bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-xs font-semibold"
                leftIcon={<Swords className="w-4 h-4 text-white" />}
              >
                Match Fixtures
              </Button>
            </div>
          </div>

          {/* Controller Art Graphic */}
          <div className="hidden lg:flex items-center justify-center shrink-0 pr-4">
            <div className="relative p-2 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 shadow-inner">
              <GameControllerIllustration className="w-48 h-36 drop-shadow-md" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Games"
          value={metrics.totalGames}
          subtitle="Configured competitive titles"
          icon={<Gamepad2 className="w-6 h-6" />}
          iconBgColor="bg-[#F1EEFF]"
          iconTextColor="text-[#8B7CF6]"
          onClick={() => navigate('/games')}
        />
        <StatsCard
          title="Tournaments"
          value={metrics.totalTournaments}
          subtitle={`${metrics.activeTournaments} active championships`}
          icon={<Trophy className="w-6 h-6" />}
          iconBgColor="bg-[#ECFDF5]"
          iconTextColor="text-[#0D6B49]"
          badgeText={`${metrics.activeTournaments} active`}
          badgePositive={true}
          onClick={() => navigate('/tournaments')}
        />
        <StatsCard
          title="Match Fixtures"
          value={metrics.totalMatches}
          subtitle={`${metrics.upcomingMatches} scheduled or live now`}
          icon={<Swords className="w-6 h-6" />}
          iconBgColor="bg-[#EBF5FE]"
          iconTextColor="text-[#0C6AB0]"
          onClick={() => navigate('/matches')}
        />
        <StatsCard
          title="Teams Registered"
          value={metrics.totalTeams}
          subtitle="Official esports rosters"
          icon={<Users className="w-6 h-6" />}
          iconBgColor="bg-[#FFF2EE]"
          iconTextColor="text-[#A63519]"
          onClick={() => navigate('/teams')}
        />
      </div>

      {/* 3. Quick Action Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E9EAF3] shadow-pastel-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#8B7CF6]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#252842]">
            Quick Organizer Actions:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Gamepad2 className="w-3.5 h-3.5" />}
            onClick={() => {
              if (onOpenCreateGame) onOpenCreateGame();
              else navigate('/games');
            }}
          >
            Add Game
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Trophy className="w-3.5 h-3.5" />}
            onClick={() => {
              if (onOpenCreateTournament) onOpenCreateTournament();
              else navigate('/tournaments');
            }}
          >
            Create Tournament
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Swords className="w-3.5 h-3.5" />}
            onClick={() => {
              if (onOpenScheduleMatch) onOpenScheduleMatch();
              else navigate('/matches');
            }}
          >
            Schedule Match
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Award className="w-3.5 h-3.5" />}
            onClick={() => navigate('/leaderboard')}
          >
            View Leaderboard
          </Button>
        </div>
      </div>

      {/* 4. Main Two Column Section: Upcoming Tournaments & Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tournaments */}
        <Card className="p-5 flex flex-col justify-between border-[#E9EAF3]">
          <div>
            <CardHeader
              title="Active &amp; Upcoming Tournaments"
              subtitle="Major tournament brackets currently underway"
              icon={<Trophy className="w-4 h-4 text-[#8B7CF6]" />}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => navigate('/tournaments')}
                >
                  View All
                </Button>
              }
            />

            {activeTournaments.length === 0 ? (
              <EmptyState
                icon={<Trophy className="w-6 h-6 text-[#8B7CF6]" />}
                title="No active tournaments"
                description="Create your first tournament to start accepting registrations."
                actionText="Create Tournament"
                onAction={() => navigate('/tournaments')}
              />
            ) : (
              <div className="space-y-3">
                {activeTournaments.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => navigate('/tournaments')}
                    className="p-4 rounded-2xl border border-[#E9EAF3] hover:border-[#8B7CF6]/40 hover:bg-[#F8F9FE] hover:shadow-pastel-sm transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#252842] group-hover:text-[#8B7CF6] transition-colors truncate">
                            {t.title}
                          </h4>
                          <Badge variant={t.status as any}>{t.status.replace('_', ' ')}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-[#777D96]">
                          <span className="font-semibold text-[#252842]">{t.game?.title || 'Game'}</span>
                          <span className="text-[#D8DAE8]">·</span>
                          <span>{t.format}</span>
                          <span className="text-[#D8DAE8]">·</span>
                          <span className="font-bold text-[#96680A] bg-[#FEF9EB] px-2 py-0.5 rounded-md border border-[#FDE8B5]">
                            ${t.prize_pool.toLocaleString()} Pool
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-[#8B7CF6] bg-[#F1EEFF] px-2.5 py-1 rounded-lg border border-[#E0D8FD]">
                          {t.registered_teams_count || 0}/{t.max_teams} Teams
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Matches */}
        <Card className="p-5 flex flex-col justify-between border-[#E9EAF3]">
          <div>
            <CardHeader
              title="Match Fixtures"
              subtitle="Live battles and upcoming scheduled matches"
              icon={<Swords className="w-4 h-4 text-[#67B7F7]" />}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => navigate('/matches')}
                >
                  View All
                </Button>
              }
            />

            {activeMatches.length === 0 ? (
              <EmptyState
                icon={<Swords className="w-6 h-6 text-[#67B7F7]" />}
                title="No scheduled matches"
                description="Pair registered teams into tournament match brackets."
                actionText="Schedule Match"
                onAction={() => navigate('/matches')}
              />
            ) : (
              <div className="space-y-3">
                {activeMatches.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => navigate('/matches')}
                    className="p-4 rounded-2xl border border-[#E9EAF3] hover:border-[#67B7F7]/50 hover:bg-[#F8F9FE] hover:shadow-pastel-sm transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[11px] font-bold text-[#777D96] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8B7CF6]" />
                        {m.tournament?.title || 'Championship'} · {m.round}
                      </span>
                      <Badge variant={m.status as any}>
                        {m.status === 'in_progress' ? 'LIVE NOW' : m.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E9EAF3] shadow-2xs">
                      {/* Team 1 */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-2xs"
                          style={{ backgroundColor: m.team1?.logo_color || '#8B7CF6' }}
                        >
                          {m.team1?.tag || 'T1'}
                        </div>
                        <span className="text-xs font-bold text-[#252842] truncate group-hover:text-[#8B7CF6] transition-colors">
                          {m.team1?.name || 'TBD'}
                        </span>
                      </div>

                      {/* Score or VS */}
                      <div className="px-3 py-1 rounded-xl bg-[#F1EEFF] text-xs font-extrabold text-[#8B7CF6] border border-[#E0D8FD] shrink-0">
                        {m.status === 'in_progress' || m.status === 'completed'
                          ? `${m.team1_score} - ${m.team2_score}`
                          : 'VS'}
                      </div>

                      {/* Team 2 */}
                      <div className="flex items-center justify-end gap-2.5 min-w-0 flex-1 text-right">
                        <span className="text-xs font-bold text-[#252842] truncate group-hover:text-[#67B7F7] transition-colors">
                          {m.team2?.name || 'TBD'}
                        </span>
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-2xs"
                          style={{ backgroundColor: m.team2?.logo_color || '#67B7F7' }}
                        >
                          {m.team2?.tag || 'T2'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 5. Analytics & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TournamentActivityChart tournaments={tournaments} matches={matches} games={games} />
        </div>

        {/* Recent Results Activity Feed */}
        <Card className="p-5 border-[#E9EAF3]">
          <CardHeader
            title="Recent Match Results"
            subtitle="Verified scores from concluded clashes"
            icon={<Award className="w-4 h-4 text-[#6FD6B0]" />}
          />

          {recentCompleted.length === 0 ? (
            <p className="text-xs text-[#777D96] py-8 text-center italic">
              No completed matches yet. Complete a match to see final results here.
            </p>
          ) : (
            <div className="space-y-3">
              {recentCompleted.map((m) => {
                const winner = m.winner_id === m.team1_id ? m.team1 : m.team2;
                return (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-[#F8F9FE] border border-[#E9EAF3] text-xs space-y-2 hover:border-[#D6D8EA] transition-colors"
                  >
                    <div className="flex items-center justify-between text-[#777D96]">
                      <span className="font-semibold text-[#252842] truncate max-w-[150px]">
                        {m.tournament?.title}
                      </span>
                      <span className="text-[10px] font-medium bg-white px-2 py-0.5 rounded-md border border-[#E9EAF3]">
                        {m.round}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-bold text-[#252842]">
                      <span
                        className={
                          m.winner_id === m.team1_id ? 'text-[#0D6B49] font-extrabold' : 'text-[#777D96]'
                        }
                      >
                        {m.team1?.name} ({m.team1_score})
                      </span>
                      <span className="text-[10px] text-[#777D96] px-2 font-medium">vs</span>
                      <span
                        className={
                          m.winner_id === m.team2_id ? 'text-[#0D6B49] font-extrabold' : 'text-[#777D96]'
                        }
                      >
                        {m.team2?.name} ({m.team2_score})
                      </span>
                    </div>

                    {winner && (
                      <p className="text-[11px] text-[#0D6B49] flex items-center gap-1.5 font-bold pt-1.5 border-t border-[#E9EAF3]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#6FD6B0]" />
                        Winner: {winner.name}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

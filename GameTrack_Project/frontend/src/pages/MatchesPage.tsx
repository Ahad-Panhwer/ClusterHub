import React, { useState } from 'react';
import {
  Swords,
  Plus,
  Search,
  Calendar,
  Trophy,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Award,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Match, MatchStatus } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';

const STATUS_OPTIONS: { value: MatchStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const ROUND_OPTIONS = [
  { value: 'Round 1', label: 'Round 1' },
  { value: 'Quarter-Finals', label: 'Quarter-Finals' },
  { value: 'Semi-Finals', label: 'Semi-Finals' },
  { value: 'Grand Finals', label: 'Grand Finals' },
  { value: 'Group Stage Round 1', label: 'Group Stage Round 1' },
  { value: 'Group Stage Round 2', label: 'Group Stage Round 2' },
  { value: 'Group Stage Round 3', label: 'Group Stage Round 3' },
  { value: 'Tiebreaker', label: 'Tiebreaker' },
];

export const MatchesPage: React.FC = () => {
  const {
    matches,
    tournaments,
    teams,
    registrations,
    loading,
    createMatch,
    updateMatch,
    recordMatchScore,
    deleteMatch,
  } = useData();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTournament, setSelectedTournament] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [scoringMatch, setScoringMatch] = useState<Match | null>(null);
  const [deletingMatch, setDeletingMatch] = useState<Match | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Schedule / Edit Form State
  const [formTournamentId, setFormTournamentId] = useState('');
  const [formTeam1Id, setFormTeam1Id] = useState('');
  const [formTeam2Id, setFormTeam2Id] = useState('');
  const [formRound, setFormRound] = useState('Quarter-Finals');
  const [formScheduledAt, setFormScheduledAt] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<MatchStatus>('scheduled');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Score Recording Modal State
  const [scoreTeam1, setScoreTeam1] = useState(0);
  const [scoreTeam2, setScoreTeam2] = useState(0);
  const [scoreNotes, setScoreNotes] = useState('');
  const [scoreErrors, setScoreErrors] = useState<string>('');

  const resetScheduleForm = () => {
    const defaultTournamentId = tournaments.length > 0 ? tournaments[0].id : '';
    const regIds = registrations
      .filter((r) => r.tournament_id === defaultTournamentId && r.status !== 'cancelled')
      .map((r) => r.team_id);
    const regTeams = teams.filter((t) => regIds.includes(t.id));

    setFormTournamentId(defaultTournamentId);
    setFormTeam1Id(regTeams.length > 0 ? regTeams[0].id : (teams.length > 0 ? teams[0].id : ''));
    setFormTeam2Id(regTeams.length > 1 ? regTeams[1].id : (teams.length > 1 ? teams[1].id : ''));
    setFormRound('Quarter-Finals');
    setFormScheduledAt(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
    setFormNotes('');
    setFormStatus('scheduled');
    setFormErrors({});
  };

  const handleOpenSchedule = () => {
    resetScheduleForm();
    setIsScheduleOpen(true);
  };

  const handleOpenEdit = (m: Match) => {
    setEditingMatch(m);
    setFormTournamentId(m.tournament_id);
    setFormTeam1Id(m.team1_id);
    setFormTeam2Id(m.team2_id);
    setFormRound(m.round);
    setFormScheduledAt(m.scheduled_at ? m.scheduled_at.slice(0, 16) : '');
    setFormNotes(m.notes || '');
    setFormStatus(m.status);
    setFormErrors({});
  };

  const handleOpenScore = (m: Match) => {
    setScoringMatch(m);
    setScoreTeam1(m.team1_score);
    setScoreTeam2(m.team2_score);
    setScoreNotes(m.notes || '');
    setScoreErrors('');
  };

  const validateScheduleForm = () => {
    const errors: Record<string, string> = {};
    if (!formTournamentId) errors.tournament = 'Please select a tournament.';
    if (!formTeam1Id) errors.team1 = 'Please select Team 1.';
    if (!formTeam2Id) errors.team2 = 'Please select Team 2.';
    if (formTeam1Id && formTeam2Id && formTeam1Id === formTeam2Id) {
      errors.team2 = 'Team 1 and Team 2 cannot be the same.';
    }
    if (!formScheduledAt) errors.scheduledAt = 'Scheduled date and time is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateScheduleForm()) return;

    setIsSubmitting(true);
    try {
      if (editingMatch) {
        await updateMatch(editingMatch.id, {
          scheduled_at: new Date(formScheduledAt).toISOString(),
          round: formRound,
          status: formStatus,
          notes: formNotes.trim(),
        });
        showToast('Match updated', {
          message: 'Match schedule details successfully updated.',
          type: 'success',
        });
        setEditingMatch(null);
      } else {
        await createMatch({
          tournament_id: formTournamentId,
          team1_id: formTeam1Id,
          team2_id: formTeam2Id,
          round: formRound,
          scheduled_at: new Date(formScheduledAt).toISOString(),
          notes: formNotes.trim(),
        });
        showToast('Match scheduled', {
          message: 'Match fixture added to the tournament schedule.',
          type: 'success',
        });
        setIsScheduleOpen(false);
      }
      resetScheduleForm();
    } catch (err: any) {
      showToast('Error saving match', {
        message: err.message || 'Operation failed.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoringMatch) return;

    if (scoreTeam1 < 0 || scoreTeam2 < 0) {
      setScoreErrors('Scores cannot be negative.');
      return;
    }

    if (scoreTeam1 === scoreTeam2) {
      setScoreErrors('Elimination matches cannot end in a draw. Please record a winner.');
      return;
    }

    setIsSubmitting(true);
    try {
      await recordMatchScore(scoringMatch.id, scoreTeam1, scoreTeam2, scoreNotes.trim());
      showToast('Score recorded & verified', {
        message: 'Match marked completed. Official leaderboard standings updated!',
        type: 'success',
      });
      setScoringMatch(null);
    } catch (err: any) {
      setScoreErrors(err.message || 'Failed to record match score.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingMatch) return;
    setIsSubmitting(true);
    try {
      await deleteMatch(deletingMatch.id);
      showToast('Match deleted', {
        message: 'Match fixture removed from schedule.',
        type: 'info',
      });
      setDeletingMatch(null);
    } catch (err: any) {
      showToast('Error deleting match', {
        message: err.message || 'Failed to delete match.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter matches
  const filteredMatches = matches.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      (m.team1?.name || '').toLowerCase().includes(q) ||
      (m.team2?.name || '').toLowerCase().includes(q) ||
      (m.tournament?.title || '').toLowerCase().includes(q) ||
      m.round.toLowerCase().includes(q);
    const matchesTourn = selectedTournament === 'all' || m.tournament_id === selectedTournament;
    const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus;
    return matchesQuery && matchesTourn && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#252842] tracking-tight font-heading flex items-center gap-2">
            <Swords className="w-6 h-6 text-[#8B7CF6]" />
            Match Schedule &amp; Results
          </h2>
          <p className="text-xs sm:text-sm text-[#777D96] mt-0.5">
            Schedule head-to-head fixtures, update live map scores, and record winners.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenSchedule}
        >
          Schedule Match
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 lg:col-span-6">
            <Input
              placeholder="Search by team name, tournament, or round..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="sm:col-span-3 lg:col-span-3">
            <Select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              options={[
                { value: 'all', label: 'All Tournaments' },
                ...tournaments.map((t) => ({ value: t.id, label: t.title })),
              ]}
            />
          </div>

          <div className="sm:col-span-3 lg:col-span-3">
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[{ value: 'all', label: 'All Statuses' }, ...STATUS_OPTIONS]}
            />
          </div>
        </div>
      </Card>

      {/* Matches List */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : filteredMatches.length === 0 ? (
        <EmptyState
          icon={<Swords className="w-8 h-8" />}
          title={searchQuery || selectedStatus !== 'all' ? 'No matches match your filter' : 'No matches scheduled'}
          description={
            searchQuery || selectedStatus !== 'all'
              ? 'Try modifying your search keywords or resetting filters.'
              : 'Schedule a match between two competitive teams to get tournament action underway.'
          }
          actionText={searchQuery || selectedStatus !== 'all' ? 'Reset Filters' : 'Schedule First Match'}
          onAction={() => {
            if (searchQuery || selectedStatus !== 'all' || selectedTournament !== 'all') {
              setSearchQuery('');
              setSelectedStatus('all');
              setSelectedTournament('all');
            } else {
              handleOpenSchedule();
            }
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((m) => {
            const isCompleted = m.status === 'completed';
            const isLive = m.status === 'in_progress';

            return (
              <Card
                key={m.id}
                hoverable
                className="p-5 border-[#E9EAF3] hover:shadow-pastel-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5 group"
              >
                {/* Left: Tournament context & schedule */}
                <div className="space-y-1.5 md:w-1/4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-[#8B7CF6]" />
                    <span className="text-xs font-bold text-[#8B7CF6] truncate">
                      {m.tournament?.title || 'Tournament'}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-[#252842] font-heading">{m.round}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-[#777D96]">
                    <Clock className="w-3.5 h-3.5 text-[#8B7CF6]" />
                    <span className="font-medium">
                      {new Date(m.scheduled_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Center: Teams Battle Area */}
                <div className="flex-1 flex items-center justify-center gap-4 bg-[#F8F9FE] p-4 rounded-2xl border border-[#E9EAF3] shadow-2xs">
                  {/* Team 1 */}
                  <div className="flex items-center gap-3 flex-1 justify-end text-right min-w-0">
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-extrabold truncate ${
                          m.winner_id === m.team1_id
                            ? 'text-[#0D6B49]'
                            : 'text-[#252842]'
                        }`}
                      >
                        {m.team1?.name || 'TBD'}
                      </p>
                      <span className="text-[10px] text-[#777D96] font-medium">
                        Captain: {m.team1?.captain_name || 'TBD'}
                      </span>
                    </div>

                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-extrabold text-white shrink-0 shadow-sm border border-white/60 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: m.team1?.logo_color || '#8B7CF6' }}
                    >
                      {m.team1?.tag || 'T1'}
                    </div>
                  </div>

                  {/* Scoreboard / Status Indicator */}
                  <div className="flex flex-col items-center gap-1.5 px-3 shrink-0">
                    <div
                      className={`px-3.5 py-1.5 rounded-xl text-sm font-extrabold border ${
                        isLive
                          ? 'bg-[#EBF5FE] text-[#0C6AB0] border-[#CCE6FD] animate-pulse shadow-[0_0_12px_rgba(103,183,247,0.3)]'
                          : isCompleted
                          ? 'bg-[#ECFDF5] text-[#0D6B49] border-[#C6F5E1]'
                          : 'bg-white border-[#E9EAF3] text-[#777D96]'
                      }`}
                    >
                      {isCompleted || isLive
                        ? `${m.team1_score} - ${m.team2_score}`
                        : 'VS'}
                    </div>
                    <Badge variant={m.status as any}>
                      {isLive ? 'LIVE' : m.status}
                    </Badge>
                  </div>

                  {/* Team 2 */}
                  <div className="flex items-center gap-3 flex-1 justify-start text-left min-w-0">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-extrabold text-white shrink-0 shadow-sm border border-white/60 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: m.team2?.logo_color || '#67B7F7' }}
                    >
                      {m.team2?.tag || 'T2'}
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`text-sm font-extrabold truncate ${
                          m.winner_id === m.team2_id
                            ? 'text-[#0D6B49]'
                            : 'text-[#252842]'
                        }`}
                      >
                        {m.team2?.name || 'TBD'}
                      </p>
                      <span className="text-[10px] text-[#777D96] font-medium">
                        Captain: {m.team2?.captain_name || 'TBD'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 md:w-36">
                  {/* Record / Update Score Button */}
                  <Button
                    variant={isCompleted ? 'outline' : 'primary'}
                    size="sm"
                    className="w-full shadow-2xs font-semibold"
                    leftIcon={<Award className="w-3.5 h-3.5" />}
                    onClick={() => handleOpenScore(m)}
                  >
                    {isCompleted ? 'Edit Score' : 'Record Score'}
                  </Button>

                  <div className="flex items-center gap-1 w-full justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(m)}
                      aria-label="Edit match info"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#FFAD91] hover:text-[#932710] hover:bg-[#FFAD91]/15"
                      onClick={() => setDeletingMatch(m)}
                      aria-label="Delete match"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Schedule / Edit Match Modal */}
      <Modal
        isOpen={isScheduleOpen || !!editingMatch}
        onClose={() => {
          setIsScheduleOpen(false);
          setEditingMatch(null);
          resetScheduleForm();
        }}
        title={editingMatch ? `Edit Fixture: ${editingMatch.round}` : 'Schedule Match Fixture'}
        subtitle="Pair participating teams into a tournament bracket match."
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4">
          <Select
            label="Tournament"
            required
            value={formTournamentId}
            onChange={(e) => {
              const newTournId = e.target.value;
              setFormTournamentId(newTournId);
              const regIds = registrations
                .filter((r) => r.tournament_id === newTournId && r.status !== 'cancelled')
                .map((r) => r.team_id);
              const regTeams = teams.filter((t) => regIds.includes(t.id));
              if (regTeams.length > 0) setFormTeam1Id(regTeams[0].id);
              if (regTeams.length > 1) setFormTeam2Id(regTeams[1].id);
            }}
            options={tournaments.map((t) => ({ value: t.id, label: t.title }))}
            error={formErrors.tournament}
            disabled={!!editingMatch}
          />

          {(() => {
            const regIds = new Set(
              registrations
                .filter((r) => r.tournament_id === formTournamentId && r.status !== 'cancelled')
                .map((r) => r.team_id)
            );
            const regTeams = teams.filter((t) => regIds.has(t.id));
            const teamSelectOptions = regTeams.length > 0
              ? regTeams.map((t) => ({ value: t.id, label: `[${t.tag}] ${t.name} (Registered)` }))
              : teams.map((t) => ({ value: t.id, label: `[${t.tag}] ${t.name}` }));

            return (
              <>
                {regTeams.length < 2 && !editingMatch && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Notice: Official tournament rules require at least two teams registered in the Registrations tab before scheduling a match fixture.
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Team 1"
                    required
                    value={formTeam1Id}
                    onChange={(e) => setFormTeam1Id(e.target.value)}
                    options={teamSelectOptions}
                    error={formErrors.team1}
                    disabled={!!editingMatch}
                  />

                  <Select
                    label="Team 2"
                    required
                    value={formTeam2Id}
                    onChange={(e) => setFormTeam2Id(e.target.value)}
                    options={teamSelectOptions}
                    error={formErrors.team2}
                    disabled={!!editingMatch}
                  />
                </div>
              </>
            );
          })()}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Tournament Round"
              required
              value={formRound}
              onChange={(e) => setFormRound(e.target.value)}
              options={ROUND_OPTIONS}
            />

            <Input
              label="Scheduled Date & Time"
              type="datetime-local"
              required
              value={formScheduledAt}
              onChange={(e) => setFormScheduledAt(e.target.value)}
              error={formErrors.scheduledAt}
            />
          </div>

          {editingMatch && (
            <Select
              label="Match Status"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as MatchStatus)}
              options={STATUS_OPTIONS}
            />
          )}

          <Textarea
            label="Match Notes or Caster Instructions (Optional)"
            rows={2}
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            placeholder="e.g. Map veto begins 15 mins prior, broadcasted on main Twitch stream."
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E9EAF3]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsScheduleOpen(false);
                setEditingMatch(null);
                resetScheduleForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              {editingMatch ? 'Save Changes' : 'Schedule Match'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Score Recording Modal */}
      {scoringMatch && (
        <Modal
          isOpen={!!scoringMatch}
          onClose={() => setScoringMatch(null)}
          title="Record Match Results"
          subtitle={`${scoringMatch.tournament?.title || 'Tournament'} · ${scoringMatch.round}`}
        >
          <form onSubmit={handleSaveScore} className="space-y-5">
            <div className="p-4 rounded-xl bg-[#F8F9FE] border border-[#E9EAF3]">
              <div className="grid grid-cols-5 items-center gap-3">
                {/* Team 1 Score Input */}
                <div className="col-span-2 text-center space-y-2">
                  <div
                    className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: scoringMatch.team1?.logo_color || '#8B7CF6' }}
                  >
                    {scoringMatch.team1?.tag}
                  </div>
                  <p className="text-xs font-bold text-[#252842] truncate">
                    {scoringMatch.team1?.name}
                  </p>
                  <Input
                    type="number"
                    min={0}
                    max={99}
                    className="text-center font-extrabold text-lg"
                    value={scoreTeam1}
                    onChange={(e) => setScoreTeam1(Number(e.target.value))}
                  />
                </div>

                <div className="col-span-1 text-center font-bold text-sm text-[#777D96]">
                  VS
                </div>

                {/* Team 2 Score Input */}
                <div className="col-span-2 text-center space-y-2">
                  <div
                    className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: scoringMatch.team2?.logo_color || '#67B7F7' }}
                  >
                    {scoringMatch.team2?.tag}
                  </div>
                  <p className="text-xs font-bold text-[#252842] truncate">
                    {scoringMatch.team2?.name}
                  </p>
                  <Input
                    type="number"
                    min={0}
                    max={99}
                    className="text-center font-extrabold text-lg"
                    value={scoreTeam2}
                    onChange={(e) => setScoreTeam2(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Projected Winner Indicator */}
            {scoreTeam1 !== scoreTeam2 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#6FD6B0]/15 border border-[#6FD6B0]/30 text-xs font-bold text-[#0D6B49]">
                <CheckCircle2 className="w-4 h-4 text-[#6FD6B0]" />
                <span>
                  Winner: {scoreTeam1 > scoreTeam2 ? scoringMatch.team1?.name : scoringMatch.team2?.name}
                </span>
              </div>
            )}

            {scoreErrors && (
              <p className="text-xs font-semibold text-[#FFAD91] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> {scoreErrors}
              </p>
            )}

            <Textarea
              label="Match Notes / Final Highlights"
              rows={2}
              value={scoreNotes}
              onChange={(e) => setScoreNotes(e.target.value)}
              placeholder="e.g. Overtime nailbiter on Haven, ace in round 24."
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E9EAF3]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setScoringMatch(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                Save Official Result
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingMatch}
        onClose={() => setDeletingMatch(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Scheduled Match"
        message={`Are you sure you want to cancel and delete the match fixture between ${deletingMatch?.team1?.name} and ${deletingMatch?.team2?.name}?`}
        confirmText="Confirm Delete"
        isLoading={isSubmitting}
      />
    </div>
  );
};

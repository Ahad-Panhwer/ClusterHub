import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  Search,
  Calendar,
  Layers,
  Users,
  DollarSign,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Swords,
  Award,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Tournament, TournamentFormat, TournamentStatus } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';

const FORMAT_OPTIONS = [
  { value: 'Single Elimination', label: 'Single Elimination' },
  { value: 'Double Elimination', label: 'Double Elimination' },
  { value: 'Round Robin', label: 'Round Robin' },
  { value: 'Swiss', label: 'Swiss System' },
];

const STATUS_OPTIONS: { value: TournamentStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'registration_open', label: 'Registration Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const TournamentsPage: React.FC = () => {
  const {
    tournaments,
    games,
    matches,
    registrations,
    loading,
    createTournament,
    updateTournament,
    deleteTournament,
  } = useData();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedGameId, setSelectedGameId] = useState<string>('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [viewingTournament, setViewingTournament] = useState<Tournament | null>(null);
  const [deletingTournament, setDeletingTournament] = useState<Tournament | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formGameId, setFormGameId] = useState('');
  const [formFormat, setFormFormat] = useState<TournamentFormat>('Single Elimination');
  const [formStatus, setFormStatus] = useState<TournamentStatus>('registration_open');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formMaxTeams, setFormMaxTeams] = useState(8);
  const [formPrizePool, setFormPrizePool] = useState(5000);
  const [formDescription, setFormDescription] = useState('');
  const [formRules, setFormRules] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormTitle('');
    setFormGameId(games.length > 0 ? games[0].id : '');
    setFormFormat('Single Elimination');
    setFormStatus('registration_open');
    setFormStartDate(new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16));
    setFormEndDate(new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16));
    setFormMaxTeams(8);
    setFormPrizePool(5000);
    setFormDescription('');
    setFormRules('');
    setFormErrors({});
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (t: Tournament) => {
    setEditingTournament(t);
    setFormTitle(t.title);
    setFormGameId(t.game_id);
    setFormFormat(t.format);
    setFormStatus(t.status);
    setFormStartDate(t.start_date ? t.start_date.slice(0, 16) : '');
    setFormEndDate(t.end_date ? t.end_date.slice(0, 16) : '');
    setFormMaxTeams(t.max_teams);
    setFormPrizePool(t.prize_pool);
    setFormDescription(t.description);
    setFormRules(t.rules || '');
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formTitle.trim()) errors.title = 'Tournament title is required.';
    if (!formGameId) errors.gameId = 'Please select an associated game.';
    if (!formStartDate) errors.startDate = 'Start date and time is required.';
    if (!formEndDate) errors.endDate = 'End date and time is required.';
    if (formStartDate && formEndDate && new Date(formStartDate) >= new Date(formEndDate)) {
      errors.endDate = 'End date must be after the start date.';
    }
    if (formMaxTeams < 2 || formMaxTeams > 128) {
      errors.maxTeams = 'Max teams must be between 2 and 128.';
    }
    if (formPrizePool < 0) {
      errors.prizePool = 'Prize pool cannot be negative.';
    }
    if (!formDescription.trim()) errors.description = 'Description is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: formTitle.trim(),
        game_id: formGameId,
        format: formFormat,
        status: formStatus,
        start_date: new Date(formStartDate).toISOString(),
        end_date: new Date(formEndDate).toISOString(),
        max_teams: Number(formMaxTeams),
        prize_pool: Number(formPrizePool),
        description: formDescription.trim(),
        rules: formRules.trim() || undefined,
      };

      if (editingTournament) {
        await updateTournament(editingTournament.id, payload);
        showToast('Tournament updated', {
          message: `"${payload.title}" has been updated.`,
          type: 'success',
        });
        setEditingTournament(null);
      } else {
        await createTournament(payload);
        showToast('Tournament created', {
          message: `"${payload.title}" is ready for team registrations.`,
          type: 'success',
        });
        setIsCreateOpen(false);
      }
      resetForm();
    } catch (err: any) {
      showToast('Error saving tournament', {
        message: err.message || 'Could not complete operation.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTournament) return;
    setIsSubmitting(true);
    try {
      await deleteTournament(deletingTournament.id);
      showToast('Tournament deleted', {
        message: `"${deletingTournament.title}" and its linked fixtures have been removed.`,
        type: 'info',
      });
      setDeletingTournament(null);
    } catch (err: any) {
      showToast('Error deleting tournament', {
        message: err.message || 'Failed to delete tournament.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter tournaments
  const filteredTournaments = tournaments.filter((t) => {
    const matchesQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.game?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    const matchesGame = selectedGameId === 'all' || t.game_id === selectedGameId;
    return matchesQuery && matchesStatus && matchesGame;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#252842] tracking-tight font-heading flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#8B7CF6]" />
            Tournaments
          </h2>
          <p className="text-xs sm:text-sm text-[#777D96] mt-0.5">
            Create brackets, track prize pools, and oversee competition phases.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Create Tournament
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 lg:col-span-6">
            <Input
              placeholder="Search tournaments by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="sm:col-span-3 lg:col-span-3">
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                ...STATUS_OPTIONS,
              ]}
            />
          </div>

          <div className="sm:col-span-3 lg:col-span-3">
            <Select
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              options={[
                { value: 'all', label: 'All Games' },
                ...games.map((g) => ({ value: g.id, label: g.title })),
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Tournaments Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredTournaments.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-8 h-8" />}
          title={searchQuery || selectedStatus !== 'all' ? 'No tournaments match your filter' : 'No tournaments created'}
          description={
            searchQuery || selectedStatus !== 'all'
              ? 'Adjust your search query or status filter to see other tournaments.'
              : 'Launch your first competitive event with custom brackets and prize pools.'
          }
          actionText={searchQuery || selectedStatus !== 'all' ? 'Reset Filters' : 'Create Tournament'}
          onAction={() => {
            if (searchQuery || selectedStatus !== 'all' || selectedGameId !== 'all') {
              setSearchQuery('');
              setSelectedStatus('all');
              setSelectedGameId('all');
            } else {
              handleOpenCreate();
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTournaments.map((t) => {
            const confirmedTeams = t.registered_teams_count || 0;
            const progress = Math.min(Math.round((confirmedTeams / t.max_teams) * 100), 100);

            return (
              <Card
                key={t.id}
                hoverable
                className="flex flex-col justify-between group border-[#E9EAF3] hover:shadow-pastel-md transition-all duration-200"
              >
                <div className="space-y-4">
                  {/* Top Row: Game Badge, Format & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-[#F1EEFF] to-[#E5E0FD] text-[#8B7CF6] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs border border-[#E0D8FD]">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-[#8B7CF6]">
                          {t.game?.title || 'Competitive Title'}
                        </span>
                        <p className="text-[11px] text-[#777D96] font-medium">{t.format}</p>
                      </div>
                    </div>

                    <Badge variant={t.status as any}>{t.status.replace('_', ' ')}</Badge>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-extrabold text-[#252842] group-hover:text-[#8B7CF6] transition-colors font-heading">
                      {t.title}
                    </h3>
                    <p className="text-xs text-[#777D96] line-clamp-2 mt-1 leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  {/* Key Stats Row */}
                  <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-[#F8F9FE] border border-[#E9EAF3] text-center text-xs">
                    <div>
                      <span className="text-[10px] text-[#777D96] uppercase font-bold">Prize Pool</span>
                      <p className="font-extrabold text-[#96680A] text-sm mt-0.5">
                        ${t.prize_pool.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#777D96] uppercase font-bold">Rosters</span>
                      <p className="font-extrabold text-[#252842] text-sm mt-0.5">
                        {confirmedTeams} / {t.max_teams}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#777D96] uppercase font-bold">Date</span>
                      <p className="font-bold text-[#252842] text-xs mt-0.5 truncate">
                        {new Date(t.start_date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Team Registration Capacity Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#777D96] font-semibold">Tournament Fill</span>
                      <span className="font-bold text-[#252842]">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#E9EAF3] rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-linear-to-r from-[#8B7CF6] via-[#9F91FC] to-[#67B7F7] rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-[#E9EAF3]">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => setViewingTournament(t)}
                  >
                    View Details
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenEdit(t)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#FFAD91] hover:text-[#932710] hover:bg-[#FFAD91]/15"
                      onClick={() => setDeletingTournament(t)}
                      aria-label={`Delete ${t.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Tournament Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingTournament}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingTournament(null);
          resetForm();
        }}
        title={editingTournament ? `Edit: ${editingTournament.title}` : 'Create New Tournament'}
        subtitle="Configure bracket rules, team limits, and prize rewards."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveTournament} className="space-y-4">
          <Input
            label="Tournament Title"
            required
            placeholder="e.g. Supernova Spring Championship"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            error={formErrors.title}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Associated Game"
              required
              value={formGameId}
              onChange={(e) => setFormGameId(e.target.value)}
              options={games.map((g) => ({ value: g.id, label: g.title }))}
              error={formErrors.gameId}
            />

            <Select
              label="Format"
              required
              value={formFormat}
              onChange={(e) => setFormFormat(e.target.value as TournamentFormat)}
              options={FORMAT_OPTIONS}
            />

            <Select
              label="Phase Status"
              required
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as TournamentStatus)}
              options={STATUS_OPTIONS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date & Time"
              type="datetime-local"
              required
              value={formStartDate}
              onChange={(e) => setFormStartDate(e.target.value)}
              error={formErrors.startDate}
            />

            <Input
              label="End Date & Time"
              type="datetime-local"
              required
              value={formEndDate}
              onChange={(e) => setFormEndDate(e.target.value)}
              error={formErrors.endDate}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Max Teams"
              type="number"
              min={2}
              max={128}
              required
              value={formMaxTeams}
              onChange={(e) => setFormMaxTeams(Number(e.target.value))}
              helperText="Capacity limit for tournament registrations"
              error={formErrors.maxTeams}
            />

            <Input
              label="Prize Pool ($ USD)"
              type="number"
              min={0}
              required
              value={formPrizePool}
              onChange={(e) => setFormPrizePool(Number(e.target.value))}
              error={formErrors.prizePool}
            />
          </div>

          <Textarea
            label="Tournament Description"
            required
            rows={2}
            placeholder="Overview of the event, eligibility, and broadcast stream..."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            error={formErrors.description}
          />

          <Textarea
            label="Official Ruleset & Guidelines (Optional)"
            rows={2}
            placeholder="Map veto process, overtime rule, anti-cheat requirements..."
            value={formRules}
            onChange={(e) => setFormRules(e.target.value)}
          />

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E9EAF3]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingTournament(null);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              {editingTournament ? 'Save Changes' : 'Create Tournament'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Tournament Details Modal */}
      {viewingTournament && (
        <Modal
          isOpen={!!viewingTournament}
          onClose={() => setViewingTournament(null)}
          title={viewingTournament.title}
          subtitle={`${viewingTournament.game?.title || 'Game'} · ${viewingTournament.format}`}
          maxWidth="lg"
        >
          {(() => {
            const tournamentMatches = matches.filter(
              (m) => m.tournament_id === viewingTournament.id
            );
            const tournamentRegs = registrations.filter(
              (r) => r.tournament_id === viewingTournament.id && r.status === 'confirmed'
            );

            return (
              <div className="space-y-5">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F9FE] border border-[#E9EAF3]">
                  <div>
                    <span className="text-[10px] text-[#777D96] uppercase font-semibold">Current Phase</span>
                    <div className="mt-1">
                      <Badge variant={viewingTournament.status as any}>
                        {viewingTournament.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#777D96] uppercase font-semibold">Prize Pool</span>
                    <p className="text-base font-extrabold text-[#252842] mt-0.5">
                      ${viewingTournament.prize_pool.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#777D96] uppercase font-semibold">Registered</span>
                    <p className="text-base font-extrabold text-[#252842] mt-0.5">
                      {tournamentRegs.length} / {viewingTournament.max_teams} Teams
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#777D96]">
                    Description
                  </h4>
                  <p className="text-sm text-[#252842] leading-relaxed">
                    {viewingTournament.description}
                  </p>
                </div>

                {viewingTournament.rules && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-[#F1EEFF]/40 border border-[#E9EAF3]">
                    <h4 className="text-xs font-bold text-[#8B7CF6]">
                      Tournament Rules &amp; Map Pool
                    </h4>
                    <p className="text-xs text-[#252842] leading-relaxed">
                      {viewingTournament.rules}
                    </p>
                  </div>
                )}

                {/* Registered Teams in this tournament */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#777D96] flex items-center justify-between">
                    <span>Registered Teams ({tournamentRegs.length})</span>
                  </h4>

                  {tournamentRegs.length === 0 ? (
                    <p className="text-xs text-[#777D96] italic">No teams registered yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {tournamentRegs.map((reg) => (
                        <div
                          key={reg.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#E9EAF3] text-xs font-semibold text-[#252842]"
                        >
                          <div
                            className="w-5 h-5 rounded-sm flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                            style={{ backgroundColor: reg.team?.logo_color || '#8B7CF6' }}
                          >
                            {reg.team?.tag || 'TM'}
                          </div>
                          <span className="truncate">{reg.team?.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Matches in this tournament */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#777D96]">
                    Match Fixtures ({tournamentMatches.length})
                  </h4>

                  {tournamentMatches.length === 0 ? (
                    <p className="text-xs text-[#777D96] italic">
                      No matches scheduled for this tournament yet.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {tournamentMatches.map((m) => (
                        <div
                          key={m.id}
                          className="p-2.5 rounded-lg bg-[#F8F9FE] border border-[#E9EAF3] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#252842]">
                              {m.team1?.name || 'TBD'} vs {m.team2?.name || 'TBD'}
                            </span>
                            <span className="text-[#777D96] ml-2 font-medium">({m.round})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#8B7CF6]">
                              {m.team1_score} - {m.team2_score}
                            </span>
                            <Badge variant={m.status as any}>{m.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E9EAF3]">
                  <Button variant="outline" size="sm" onClick={() => setViewingTournament(null)}>
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    onClick={() => {
                      const t = viewingTournament;
                      setViewingTournament(null);
                      handleOpenEdit(t);
                    }}
                  >
                    Edit Tournament
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingTournament}
        onClose={() => setDeletingTournament(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Tournament"
        message={`Are you sure you want to delete "${deletingTournament?.title}"? All scheduled matches, scores, and registrations for this tournament will be removed.`}
        confirmText="Confirm Delete"
        isLoading={isSubmitting}
      />
    </div>
  );
};

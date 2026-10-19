import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Shield,
  Edit2,
  Trash2,
  Trophy,
  Award,
  Check,
  Eye,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Team } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';

const TEAM_LOGO_COLORS = [
  '#8B7CF6', // Lavender
  '#67B7F7', // Sky Blue
  '#6FD6B0', // Mint Green
  '#FFAD91', // Peach
  '#FFD978', // Soft Yellow
  '#A78BFA', // Purple
];

export const TeamsPage: React.FC = () => {
  const { teams, matches, registrations, loading, createTeam, updateTeam, deleteTeam } = useData();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formTag, setFormTag] = useState('');
  const [formCaptainName, setFormCaptainName] = useState('');
  const [formCaptainEmail, setFormCaptainEmail] = useState('');
  const [formLogoColor, setFormLogoColor] = useState('#8B7CF6');
  const [formMembersCount, setFormMembersCount] = useState(5);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormName('');
    setFormTag('');
    setFormCaptainName('');
    setFormCaptainEmail('');
    setFormLogoColor('#8B7CF6');
    setFormMembersCount(5);
    setFormErrors({});
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (tm: Team) => {
    setEditingTeam(tm);
    setFormName(tm.name);
    setFormTag(tm.tag);
    setFormCaptainName(tm.captain_name);
    setFormCaptainEmail(tm.captain_email);
    setFormLogoColor(tm.logo_color || '#8B7CF6');
    setFormMembersCount(tm.members_count || 5);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = 'Team name is required.';
    if (!formTag.trim()) errors.tag = 'Team tag (e.g. NVK) is required.';
    if (formTag.trim().length < 2 || formTag.trim().length > 5) {
      errors.tag = 'Tag should be between 2 and 5 uppercase characters.';
    }
    if (!formCaptainName.trim()) errors.captainName = 'Captain name is required.';
    if (!formCaptainEmail.trim() || !formCaptainEmail.includes('@')) {
      errors.captainEmail = 'A valid captain contact email is required.';
    }
    if (formMembersCount < 1 || formMembersCount > 20) {
      errors.membersCount = 'Members count must be between 1 and 20.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        tag: formTag.trim().toUpperCase(),
        captain_name: formCaptainName.trim(),
        captain_email: formCaptainEmail.trim(),
        logo_color: formLogoColor,
        members_count: Number(formMembersCount),
      };

      if (editingTeam) {
        await updateTeam(editingTeam.id, payload);
        showToast('Team profile updated', {
          message: `Team "${payload.name}" updated successfully.`,
          type: 'success',
        });
        setEditingTeam(null);
      } else {
        await createTeam(payload);
        showToast('Team registered', {
          message: `"${payload.name}" [${payload.tag}] added to competitive roster.`,
          type: 'success',
        });
        setIsCreateOpen(false);
      }
      resetForm();
    } catch (err: any) {
      showToast('Error saving team', {
        message: err.message || 'Operation failed.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTeam) return;
    setIsSubmitting(true);
    try {
      await deleteTeam(deletingTeam.id);
      showToast('Team deleted', {
        message: `"${deletingTeam.name}" has been removed.`,
        type: 'info',
      });
      setDeletingTeam(null);
    } catch (err: any) {
      showToast('Error deleting team', {
        message: err.message || 'Failed to delete team.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTeams = teams.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.tag.toLowerCase().includes(q) ||
      t.captain_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#252842] tracking-tight font-heading flex items-center gap-2">
            <Users className="w-6 h-6 text-[#8B7CF6]" />
            Registered Teams
          </h2>
          <p className="text-xs sm:text-sm text-[#777D96] mt-0.5">
            Manage team rosters, team tags, and captain communications.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Add Team
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <Input
          placeholder="Search teams by name, tag (e.g. NVK), or captain..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </Card>

      {/* Teams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredTeams.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title={searchQuery ? 'No teams match your search' : 'No teams registered yet'}
          description={
            searchQuery
              ? 'Try searching with a different team name or tag.'
              : 'Add competitive esports squads to enter them into tournaments.'
          }
          actionText={searchQuery ? 'Clear Search' : 'Add First Team'}
          onAction={() => {
            if (searchQuery) setSearchQuery('');
            else handleOpenCreate();
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeams.map((team) => {
            // Compute team records from match fixtures
            const teamMatches = matches.filter(
              (m) =>
                m.status === 'completed' &&
                (m.team1_id === team.id || m.team2_id === team.id)
            );
            const wins = teamMatches.filter((m) => m.winner_id === team.id).length;
            const losses = teamMatches.length - wins;

            const registeredCount = registrations.filter(
              (r) => r.team_id === team.id && r.status === 'confirmed'
            ).length;

            return (
              <Card
                key={team.id}
                hoverable
                className="flex flex-col justify-between group border-[#E9EAF3] hover:shadow-pastel-md transition-all duration-200"
              >
                <div className="space-y-4">
                  {/* Top Bar with Team Tag and Color */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm text-white shadow-sm border border-white/60 transition-transform group-hover:scale-108"
                        style={{ backgroundColor: team.logo_color || '#8B7CF6' }}
                      >
                        {team.tag}
                      </div>

                      <div>
                        <h3 className="text-base font-extrabold text-[#252842] group-hover:text-[#8B7CF6] transition-colors font-heading">
                          {team.name}
                        </h3>
                        <p className="text-xs text-[#777D96] font-medium">
                          Tag: <span className="font-bold text-[#8B7CF6]">[{team.tag}]</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Team Captain & Members Info */}
                  <div className="p-3.5 rounded-xl bg-[#F8F9FE] border border-[#E9EAF3] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#777D96] flex items-center gap-1.5 font-medium">
                        <Shield className="w-3.5 h-3.5 text-[#8B7CF6]" /> Captain:
                      </span>
                      <span className="font-bold text-[#252842]">{team.captain_name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#777D96] flex items-center gap-1.5 font-medium">
                        <Mail className="w-3.5 h-3.5 text-[#67B7F7]" /> Contact:
                      </span>
                      <span className="text-[#777D96] truncate max-w-[150px] font-mono text-[11px]">{team.captain_email}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#777D96] flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-[#6FD6B0]" /> Active Roster:
                      </span>
                      <span className="font-bold text-[#252842]">{team.members_count} players</span>
                    </div>
                  </div>

                  {/* Stats Pill Row */}
                  <div className="flex items-center justify-between text-xs pt-1 px-1">
                    <div className="flex items-center gap-1.5 text-[#777D96] font-medium">
                      <Trophy className="w-3.5 h-3.5 text-[#FFD978]" />
                      <span>{registeredCount} Tournaments</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="bg-[#ECFDF5] border border-[#C6F5E1] text-[#0D6B49] px-2 py-0.5 rounded-md">
                        {wins}W
                      </span>
                      <span className="text-[#D8DAE8]">/</span>
                      <span className="bg-[#FFF2EE] border border-[#FFD4C4] text-[#A63519] px-2 py-0.5 rounded-md">
                        {losses}L
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-[#E9EAF3]">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => setViewingTeam(team)}
                  >
                    View Record
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenEdit(team)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#FFAD91] hover:text-[#932710] hover:bg-[#FFAD91]/15"
                      onClick={() => setDeletingTeam(team)}
                      aria-label={`Delete ${team.name}`}
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

      {/* Create / Edit Team Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingTeam}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingTeam(null);
          resetForm();
        }}
        title={editingTeam ? `Edit: ${editingTeam.name}` : 'Register New Competitive Team'}
        subtitle="Specify team identity, roster size, and designated captain."
      >
        <form onSubmit={handleSaveTeam} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Team Name"
                required
                placeholder="e.g. Nova Knights"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                error={formErrors.name}
              />
            </div>

            <div>
              <Input
                label="Team Tag"
                required
                maxLength={5}
                placeholder="NVK"
                value={formTag}
                onChange={(e) => setFormTag(e.target.value)}
                error={formErrors.tag}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Captain In-Game / Real Name"
              required
              placeholder="e.g. Marcus 'Viper' Vance"
              value={formCaptainName}
              onChange={(e) => setFormCaptainName(e.target.value)}
              error={formErrors.captainName}
            />

            <Input
              label="Captain Contact Email"
              type="email"
              required
              placeholder="captain@team.gg"
              value={formCaptainEmail}
              onChange={(e) => setFormCaptainEmail(e.target.value)}
              error={formErrors.captainEmail}
            />
          </div>

          <Input
            label="Roster Size (Players)"
            type="number"
            min={1}
            max={20}
            required
            value={formMembersCount}
            onChange={(e) => setFormMembersCount(Number(e.target.value))}
            error={formErrors.membersCount}
          />

          {/* Color Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#252842]">
              Team Logo Color Badge
            </label>
            <div className="flex items-center gap-3">
              {TEAM_LOGO_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setFormLogoColor(c)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    formLogoColor === c ? 'ring-2 ring-offset-2 ring-[#8B7CF6] scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {formLogoColor === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E9EAF3]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingTeam(null);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              {editingTeam ? 'Save Changes' : 'Register Team'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Team Details Modal */}
      {viewingTeam && (
        <Modal
          isOpen={!!viewingTeam}
          onClose={() => setViewingTeam(null)}
          title={`[${viewingTeam.tag}] ${viewingTeam.name}`}
          subtitle="Team Match Records & Active Registrations"
        >
          {(() => {
            const teamMatches = matches.filter(
              (m) =>
                m.status === 'completed' &&
                (m.team1_id === viewingTeam.id || m.team2_id === viewingTeam.id)
            );
            const wins = teamMatches.filter((m) => m.winner_id === viewingTeam.id).length;
            const losses = teamMatches.length - wins;
            const teamRegs = registrations.filter(
              (r) => r.team_id === viewingTeam.id && r.status === 'confirmed'
            );

            return (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#F8F9FE] border border-[#E9EAF3]">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-lg text-white shadow-xs"
                    style={{ backgroundColor: viewingTeam.logo_color || '#8B7CF6' }}
                  >
                    {viewingTeam.tag}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#252842]">{viewingTeam.name}</h3>
                    <p className="text-xs text-[#777D96]">
                      Led by Captain {viewingTeam.captain_name} · {viewingTeam.captain_email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3 rounded-xl bg-white border border-[#E9EAF3]">
                    <span className="text-[#777D96]">Matches Played</span>
                    <p className="text-lg font-extrabold text-[#252842] mt-0.5">{teamMatches.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#6FD6B0]/15 border border-[#6FD6B0]/30">
                    <span className="text-[#0D6B49] font-semibold">Wins</span>
                    <p className="text-lg font-extrabold text-[#0D6B49] mt-0.5">{wins}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FFAD91]/15 border border-[#FFAD91]/30">
                    <span className="text-[#932710] font-semibold">Losses</span>
                    <p className="text-lg font-extrabold text-[#932710] mt-0.5">{losses}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#777D96]">
                    Tournaments Entered ({teamRegs.length})
                  </h4>
                  {teamRegs.length === 0 ? (
                    <p className="text-xs text-[#777D96] italic">No active tournament registrations.</p>
                  ) : (
                    <div className="space-y-2">
                      {teamRegs.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F9FE] border border-[#E9EAF3] text-xs font-semibold text-[#252842]"
                        >
                          <span>{r.tournament?.title || 'Tournament'}</span>
                          <span className="text-[#8B7CF6] font-bold">Seed #{r.seed_number || 1}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E9EAF3]">
                  <Button variant="outline" size="sm" onClick={() => setViewingTeam(null)}>
                    Close
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingTeam}
        onClose={() => setDeletingTeam(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Team Roster"
        message={`Are you sure you want to remove team "${deletingTeam?.name}"? Any active registrations will be revoked.`}
        confirmText="Confirm Delete"
        isLoading={isSubmitting}
      />
    </div>
  );
};

import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  Trophy,
  Users,
  CheckCircle2,
  Clock,
  Trash2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Registration, RegistrationStatus } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';

const STATUS_OPTIONS: { value: RegistrationStatus; label: string }[] = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'waitlist', label: 'Waitlist' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const RegistrationsPage: React.FC = () => {
  const {
    registrations,
    tournaments,
    teams,
    loading,
    createRegistration,
    updateRegistrationStatus,
    deleteRegistration,
  } = useData();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTournament, setSelectedTournament] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [deletingReg, setDeletingReg] = useState<Registration | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form
  const [formTournamentId, setFormTournamentId] = useState('');
  const [formTeamId, setFormTeamId] = useState('');
  const [formStatus, setFormStatus] = useState<RegistrationStatus>('confirmed');
  const [formError, setFormError] = useState('');

  const resetForm = () => {
    setFormTournamentId(tournaments.length > 0 ? tournaments[0].id : '');
    setFormTeamId(teams.length > 0 ? teams[0].id : '');
    setFormStatus('confirmed');
    setFormError('');
  };

  const handleOpenRegister = () => {
    resetForm();
    setIsRegisterOpen(true);
  };

  const handleSaveRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTournamentId || !formTeamId) {
      setFormError('Please select both a tournament and a team.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      await createRegistration({
        tournament_id: formTournamentId,
        team_id: formTeamId,
        status: formStatus,
      });

      const selectedTeam = teams.find((t) => t.id === formTeamId);
      const selectedTourn = tournaments.find((t) => t.id === formTournamentId);

      showToast('Registration successful', {
        message: `${selectedTeam?.name} successfully registered for "${selectedTourn?.title}".`,
        type: 'success',
      });
      setIsRegisterOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Failed to complete registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: RegistrationStatus) => {
    try {
      await updateRegistrationStatus(id, newStatus);
      showToast('Status updated', {
        message: `Registration marked as ${newStatus}.`,
        type: 'success',
      });
    } catch (err: any) {
      showToast('Error', { message: err.message, type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingReg) return;
    setIsSubmitting(true);
    try {
      await deleteRegistration(deletingReg.id);
      showToast('Registration cancelled', {
        message: 'Team entry removed from tournament roster.',
        type: 'info',
      });
      setDeletingReg(null);
    } catch (err: any) {
      showToast('Error', { message: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      (r.team?.name || '').toLowerCase().includes(q) ||
      (r.team?.tag || '').toLowerCase().includes(q) ||
      (r.tournament?.title || '').toLowerCase().includes(q);
    const matchesTourn = selectedTournament === 'all' || r.tournament_id === selectedTournament;
    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    return matchesQuery && matchesTourn && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#252842] tracking-tight font-heading flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#8B7CF6]" />
            Tournament Registrations
          </h2>
          <p className="text-xs sm:text-sm text-[#777D96] mt-0.5">
            Approve team entries, oversee roster seeds, and manage tournament entry caps.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenRegister}
        >
          Register Team
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 lg:col-span-6">
            <Input
              placeholder="Search by team name, tag, or tournament title..."
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

      {/* Registrations List */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : filteredRegistrations.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-8 h-8" />}
          title={searchQuery || selectedTournament !== 'all' ? 'No registrations match filters' : 'No registrations yet'}
          description={
            searchQuery || selectedTournament !== 'all'
              ? 'Adjust your search parameters to view other team entries.'
              : 'Register competing teams for your upcoming tournaments to build the bracket.'
          }
          actionText={searchQuery || selectedTournament !== 'all' ? 'Clear Filters' : 'Register First Team'}
          onAction={() => {
            if (searchQuery || selectedTournament !== 'all' || selectedStatus !== 'all') {
              setSearchQuery('');
              setSelectedTournament('all');
              setSelectedStatus('all');
            } else {
              handleOpenRegister();
            }
          }}
        />
      ) : (
        <Card className="p-0 overflow-hidden border-[#E9EAF3] shadow-pastel-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#252842]">
              <thead className="bg-[#F8F9FE] text-[11px] font-bold uppercase tracking-wider text-[#777D96] border-b border-[#E9EAF3]">
                <tr>
                  <th className="px-5 py-3.5">Team</th>
                  <th className="px-5 py-3.5">Tournament</th>
                  <th className="px-5 py-3.5 text-center">Seed</th>
                  <th className="px-5 py-3.5">Registered Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EAF3]">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-[#F1EEFF]/35 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs text-white shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: reg.team?.logo_color || '#8B7CF6' }}
                        >
                          {reg.team?.tag || 'TM'}
                        </div>
                        <div>
                          <p className="font-extrabold text-[#252842] group-hover:text-[#8B7CF6] transition-colors">{reg.team?.name || 'Unknown'}</p>
                          <span className="text-xs text-[#777D96] font-medium">
                            Captain: {reg.team?.captain_name || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-bold text-[#252842]">{reg.tournament?.title || 'Tournament'}</p>
                      <span className="text-xs text-[#777D96]">{reg.tournament?.format}</span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-[#F1EEFF] text-[#8B7CF6] font-extrabold text-xs border border-[#E0D8FD]">
                        #{reg.seed_number || 1}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs font-medium text-[#777D96]">
                      {new Date(reg.registered_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={reg.status}
                        onChange={(e) => handleStatusChange(reg.id, e.target.value as RegistrationStatus)}
                        className={`text-xs font-extrabold rounded-lg px-3 py-1.5 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8B7CF6]/20 transition-all ${
                          reg.status === 'confirmed'
                            ? 'bg-[#ECFDF5] border-[#C6F5E1] text-[#0D6B49]'
                            : reg.status === 'pending'
                            ? 'bg-[#FEF9EB] border-[#FDE8B5] text-[#96680A]'
                            : reg.status === 'waitlist'
                            ? 'bg-[#FFF2EE] border-[#FFD4C4] text-[#A63519]'
                            : 'bg-white border-[#E9EAF3] text-[#777D96]'
                        }`}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="waitlist">Waitlist</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#FFAD91] hover:text-[#932710] hover:bg-[#FFF2EE]"
                        onClick={() => setDeletingReg(reg)}
                        aria-label="Remove registration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Register Team Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => {
          setIsRegisterOpen(false);
          resetForm();
        }}
        title="Register Team for Tournament"
        subtitle="Ensure tournament is open and team is eligible to participate."
      >
        <form onSubmit={handleSaveRegistration} className="space-y-4">
          <Select
            label="Tournament"
            required
            value={formTournamentId}
            onChange={(e) => setFormTournamentId(e.target.value)}
            options={tournaments.map((t) => ({
              value: t.id,
              label: `${t.title} (${t.status.replace('_', ' ')})`,
            }))}
          />

          <Select
            label="Team"
            required
            value={formTeamId}
            onChange={(e) => setFormTeamId(e.target.value)}
            options={teams.map((t) => ({
              value: t.id,
              label: `[${t.tag}] ${t.name}`,
            }))}
          />

          <Select
            label="Initial Status"
            value={formStatus}
            onChange={(e) => setFormStatus(e.target.value as RegistrationStatus)}
            options={STATUS_OPTIONS}
          />

          {formError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FFAD91]/20 border border-[#FFAD91]/40 text-xs font-semibold text-[#932710]">
              <AlertTriangle className="w-4 h-4 text-[#FFAD91] shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E9EAF3]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsRegisterOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Confirm Registration
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingReg}
        onClose={() => setDeletingReg(null)}
        onConfirm={handleDeleteConfirm}
        title="Revoke Team Registration"
        message={`Are you sure you want to remove ${deletingReg?.team?.name} from ${deletingReg?.tournament?.title}?`}
        confirmText="Confirm Remove"
        isLoading={isSubmitting}
      />
    </div>
  );
};

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Database,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export const SettingsPage: React.FC = () => {
  const {
    useMockMode,
    setUseMockMode,
    apiBaseUrl,
    resetDemoData,
    games,
    tournaments,
    matches,
    teams,
    registrations,
  } = useData();
  const { user, isDemoUser } = useAuth();
  const { showToast } = useToast();

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleResetData = () => {
    resetDemoData();
    setIsResetConfirmOpen(false);
    showToast('Data reset to defaults', {
      message: 'Demo dataset restored with initial competitive matches and tournaments.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#252842] tracking-tight font-heading flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-[#8B7CF6]" />
          System Settings &amp; Integration
        </h2>
        <p className="text-xs sm:text-sm text-[#777D96] mt-0.5">
          Backend API configuration, data provider status, and development utilities.
        </p>
      </div>

      {/* Backend Integration Mode Card */}
      <Card className="p-6">
        <CardHeader
          title="Backend API Configuration"
          subtitle="Configure connectivity with the Node.js + Express REST API"
        />

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#F8F9FE] border border-[#E9EAF3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#8B7CF6]" />
                <span className="text-xs font-bold text-[#252842]">API Endpoint:</span>
                <code className="text-xs bg-white px-2 py-0.5 rounded-md border border-[#E9EAF3] text-[#8B7CF6] font-mono">
                  {apiBaseUrl}
                </code>
              </div>
              <p className="text-xs text-[#777D96]">
                Loaded from environment variable <code className="font-mono">VITE_API_BASE_URL</code>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-[#777D96]">Data Provider:</span>
              <button
                onClick={() => {
                  const next = !useMockMode;
                  setUseMockMode(next);
                  showToast(
                    next ? 'Switched to Local Demo Provider' : 'Switched to Express REST API',
                    { type: 'info' }
                  );
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  useMockMode ? 'bg-[#8B7CF6]' : 'bg-[#6FD6B0]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useMockMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-xs font-bold text-[#252842]">
                {useMockMode ? 'Demo Storage' : 'Live API'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F1EEFF]/50 border border-[#E9EAF3] text-xs text-[#777D96] space-y-1">
            <p className="font-bold text-[#252842] flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#8B7CF6]" />
              Architectural Transparency:
            </p>
            <p className="leading-relaxed">
              When Demo Mode is active, all CRUD operations (Games, Tournaments, Matches, Teams,
              and Registrations) persist inside your browser localStorage. No fake production
              status is claimed.
            </p>
          </div>
        </div>
      </Card>

      {/* Authentication & Security Card */}
      <Card className="p-6">
        <CardHeader
          title="Authentication Status"
          subtitle="Supabase Auth and session management"
        />

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-[#F8F9FE] border border-[#E9EAF3] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#777D96]">Current Session User:</span>
              <p className="font-bold text-[#252842] mt-0.5">
                {user?.name} ({user?.email})
              </p>
            </div>

            <div>
              <span className="text-[#777D96]">Assigned Role:</span>
              <p className="font-bold text-[#8B7CF6] uppercase mt-0.5">{user?.role}</p>
            </div>

            <div>
              <span className="text-[#777D96]">Auth Provider:</span>
              <p className="font-bold text-[#252842] mt-0.5">
                {isDemoUser ? 'Dev Session' : 'Supabase Auth'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#6FD6B0]/10 border border-[#6FD6B0]/30 text-xs text-[#0D6B49] flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#6FD6B0] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              No database passwords, Supabase service-role keys, or private backend secrets are
              exposed in the client code. Requests pass securely through Bearer headers.
            </p>
          </div>
        </div>
      </Card>

      {/* Sample Data & Storage Management */}
      <Card className="p-6">
        <CardHeader
          title="Data Management &amp; Diagnostics"
          subtitle="Inspect current record counts and restore default datasets"
        />

        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-[#F8F9FE] border border-[#E9EAF3]">
              <span className="text-[#777D96]">Games</span>
              <p className="text-base font-extrabold text-[#252842] mt-1">{games.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F9FE] border border-[#E9EAF3]">
              <span className="text-[#777D96]">Tournaments</span>
              <p className="text-base font-extrabold text-[#252842] mt-1">{tournaments.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F9FE] border border-[#E9EAF3]">
              <span className="text-[#777D96]">Matches</span>
              <p className="text-base font-extrabold text-[#252842] mt-1">{matches.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F9FE] border border-[#E9EAF3]">
              <span className="text-[#777D96]">Teams</span>
              <p className="text-base font-extrabold text-[#252842] mt-1">{teams.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F9FE] border border-[#E9EAF3]">
              <span className="text-[#777D96]">Registrations</span>
              <p className="text-base font-extrabold text-[#252842] mt-1">{registrations.length}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#E9EAF3]">
            <p className="text-xs text-[#777D96]">
              Reset demo data to default test tournaments, games, and teams.
            </p>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-[#8B7CF6]" />}
              onClick={() => setIsResetConfirmOpen(true)}
            >
              Reset Demo Records
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetData}
        title="Reset Demo Records"
        message="This will overwrite local modifications and restore the initial sample games, tournaments, teams, and match brackets."
        confirmText="Confirm Reset"
        variant="warning"
      />
    </div>
  );
};

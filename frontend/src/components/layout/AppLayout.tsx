import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { X, AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { apiError, apiBaseUrl, refreshData, setUseMockMode } = useData();

  return (
    <div className="flex h-screen w-full bg-[#F8F9FE] overflow-hidden text-[#252842]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-[#252842]/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-[#777D96] hover:text-[#252842] hover:bg-[#F1EEFF]"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar
              collapsed={false}
              onToggleCollapse={() => {}}
              onItemClick={() => setMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Workspace Column */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        <TopNav onMobileMenuOpen={() => setMobileDrawerOpen(true)} />

        {/* API Availability / Status Warning Banner */}
        {apiError && (
          <div className="bg-[#FFF2EE] border-b border-[#FFD4C4] px-4 py-2.5 text-xs text-[#A63519] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FFAD91] shrink-0" />
              <span>
                <strong>API Endpoint Notice:</strong> {apiError} (Endpoint:{' '}
                <code className="font-mono bg-white/70 px-1 py-0.5 rounded text-[11px]">{apiBaseUrl}</code>).
                Operating with cached data fallback.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => refreshData()}
                className="inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg bg-white border border-[#FFD4C4] text-[#A63519] hover:bg-[#FFE5DC] transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Retry Connection
              </button>
              <button
                onClick={() => setUseMockMode(true)}
                className="inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg bg-[#8B7CF6] text-white hover:bg-[#7A6AE6] transition-colors"
              >
                <Database className="w-3 h-3" /> Switch to Dev Mock
              </button>
              <Link
                to="/settings"
                className="font-bold underline text-[#A63519] hover:text-[#80240e] ml-1"
              >
                Settings
              </Link>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

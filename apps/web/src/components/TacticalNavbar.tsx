import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Volume2, VolumeX, ShieldAlert, FolderArchive, Eye } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore.js';

export const TacticalNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, isMuted, toggleMute, resetToHome } = useGameStore();

  const totalScreen = session?.screenMetrics.totalScreenTimeMs || 0;
  const totalAway = session?.screenMetrics.totalAwayTimeMs || 0;
  const total = totalScreen + totalAway || 1;
  const awayPercent = Math.round((totalAway / total) * 100);

  const handleHomeClick = () => {
    resetToHome();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-case-bg/90 backdrop-blur-md border-b border-case-border/60 px-4 py-3 flex items-center justify-between">
      {/* Brand & Case ID */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleHomeClick}
          className="text-left group flex items-center space-x-2 focus:outline-none"
          title="Return to Landing"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-case-amber animate-pulse"></span>
          <div>
            <h1 className="font-serif text-sm font-bold tracking-wider text-case-paper group-hover:text-case-amber transition-colors">
              WILDCASE
            </h1>
            <p className="font-mono text-[10px] text-case-muted tracking-widest uppercase">
              {session ? session.caseData.caseNumber : 'FIELD INSTRUMENT'}
            </p>
          </div>
        </button>
      </div>

      {/* Real-time Away Ratio Indicator */}
      {session && location.pathname !== '/' && (
        <div className="hidden sm:flex items-center space-x-2 bg-case-surface border border-case-border rounded-full px-3 py-1 text-[11px] font-mono">
          <Eye className="w-3.5 h-3.5 text-case-cyan" />
          <span className="text-case-muted">AWAY:</span>
          <span className="text-case-amber font-bold">{awayPercent}%</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleMute}
          className="p-2 rounded-lg bg-case-surface hover:bg-case-card text-case-muted hover:text-case-paper border border-case-border transition-colors"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-case-red" /> : <Volume2 className="w-4 h-4 text-case-cyan" />}
        </button>

        <button
          onClick={() => navigate('/cases')}
          className={`p-2 rounded-lg border transition-colors ${
            location.pathname === '/cases'
              ? 'bg-case-amber text-case-bg border-case-amber font-bold'
              : 'bg-case-surface hover:bg-case-card text-case-muted hover:text-case-paper border-case-border'
          }`}
          title="Case Archive"
          aria-label="Case Archive"
        >
          <FolderArchive className="w-4 h-4" />
        </button>

        <button
          onClick={() => navigate('/settings')}
          className={`p-2 rounded-lg border transition-colors ${
            location.pathname === '/settings'
              ? 'bg-case-cyan text-case-bg border-case-cyan font-bold'
              : 'bg-case-surface hover:bg-case-card text-case-muted hover:text-case-paper border-case-border'
          }`}
          title="Privacy Ledger & Settings"
          aria-label="Privacy Ledger"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

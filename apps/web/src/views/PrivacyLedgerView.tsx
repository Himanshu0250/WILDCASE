import React, { useState } from 'react';
import { ShieldCheck, Lock, EyeOff, Trash2, ArrowLeft, CheckCircle2, FileText } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore.js';
import { offlineDB } from '../db/offline-db.js';

export const PrivacyLedgerView: React.FC = () => {
  const { setView, loadCases } = useGameStore();
  const [dataCleared, setDataCleared] = useState(false);

  const handleClearAll = async () => {
    if (confirm('Permanently delete all locally stored cases, investigation logs, and field reports?')) {
      await offlineDB.clearAllData();
      await loadCases();
      setDataCleared(true);
      setTimeout(() => setDataCleared(false), 3000);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-case-border pb-3">
        <button
          onClick={() => setView('LANDING')}
          className="p-2 rounded-lg bg-case-surface hover:bg-case-card border border-case-border text-case-muted hover:text-case-paper"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="font-mono text-[10px] text-case-cyan uppercase tracking-widest block">
            TRANSPARENCY & DATA SOVEREIGNTY
          </span>
          <h2 className="font-serif text-2xl font-bold text-case-paper">
            Privacy Ledger
          </h2>
        </div>
      </div>

      {/* Principle Statement */}
      <div className="paper-texture p-5 rounded-2xl border border-case-amber/30 space-y-2 shadow-xl text-case-ink">
        <span className="stamp-effect text-[10px] px-2 py-0.5 border-2">
          ZERO SURVEILLANCE
        </span>
        <h3 className="font-serif text-lg font-bold">
          Your World Stays Yours.
        </h3>
        <p className="text-xs font-sans text-case-inkMuted leading-relaxed">
          WILDCASE is engineered to get you exploring outdoors without harvesting personal data. Raw photos never leave your device.
        </p>
      </div>

      {/* Ledger Breakdown Cards */}
      <div className="space-y-4">
        {/* On-Device */}
        <div className="bg-case-card border border-case-border rounded-xl p-4 space-y-2.5">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-case-moss">
            <Lock className="w-4 h-4" />
            <span>STAYS ENTIRELY ON-DEVICE (LOCAL ONLY)</span>
          </div>
          <ul className="space-y-1.5 text-xs text-case-muted font-sans pl-6 list-disc">
            <li><strong>Raw Camera Video & Pixels:</strong> Processed in memory via HTML5 Canvas. Never saved or transmitted.</li>
            <li><strong>Physical Location Coordinates:</strong> If used, stays strictly within local device memory.</li>
            <li><strong>Investigation Progress:</strong> Stored locally in browser IndexedDB (Dexie).</li>
          </ul>
        </div>

        {/* What Leaves */}
        <div className="bg-case-card border border-case-border rounded-xl p-4 space-y-2.5">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-case-cyan">
            <EyeOff className="w-4 h-4" />
            <span>TRANSMITTED TO AI GAME MASTER</span>
          </div>
          <ul className="space-y-1.5 text-xs text-case-muted font-sans pl-6 list-disc">
            <li><strong>Categorical Tag Descriptors:</strong> e.g., <code className="text-case-amber text-[11px]">["metal", "weathered", "red"]</code>.</li>
            <li><strong>Confidence Score & Beat ID:</strong> To evaluate match against case predicates.</li>
            <li><strong>Anonymous Metric Tally:</strong> Active screen duration vs away-time duration.</li>
          </ul>
        </div>
      </div>

      {/* Purge Local Storage */}
      <div className="p-4 rounded-xl bg-case-surface border border-case-red/30 space-y-3">
        <span className="font-mono text-xs font-bold text-case-red block uppercase">
          DATA PURGE CONTROLS
        </span>
        <p className="text-xs text-case-muted font-sans">
          Erase all cached case files, completed reports, and local preferences from this browser.
        </p>
        <button
          onClick={handleClearAll}
          className="w-full py-3 px-4 rounded-xl bg-case-red/20 hover:bg-case-red/30 text-case-red border border-case-red/40 font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>{dataCleared ? 'ALL DATA PURGED!' : 'PURGE ALL LOCAL DATA'}</span>
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore.js';
import { SuspectCard } from '../components/SuspectCard.js';

export const AccuseView: React.FC = () => {
  const navigate = useNavigate();
  const { activeCase, session, submitAccusation, isAIWorking } = useGameStore();
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  if (!activeCase || !session) return null;

  const selectedSuspect = activeCase.suspects.find((s) => s.id === selectedSuspectId);

  const handleConfirmAccusation = async () => {
    if (!selectedSuspectId) return;
    setConfirmModalOpen(false);
    await submitAccusation(selectedSuspectId);
    navigate(`/case/${activeCase.id}/verdict`);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="stamp-effect text-xs px-3 py-1">
          FINAL DEDUCTION
        </span>
        <h2 className="font-serif text-3xl font-extrabold text-case-paper">
          Make Your Accusation
        </h2>
        <p className="text-xs text-case-muted font-sans max-w-xs mx-auto">
          All four pieces of physical evidence have been recovered. Connect the clues to the suspects.
        </p>
      </div>

      {/* Recovered Evidence Summary Pins */}
      <div className="bg-case-card border border-case-border rounded-xl p-4 space-y-2">
        <span className="font-mono text-[10px] text-case-muted uppercase tracking-wider block border-b border-case-border/40 pb-1.5">
          UNLOCKED EVIDENCE TRAIL (4/4)
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs font-sans">
          {activeCase.beats.map((beat) => (
            <div
              key={beat.id}
              className="p-2 rounded bg-case-surface border border-case-border text-[11px] text-case-paper/90 flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-case-moss flex-shrink-0" />
              <span className="truncate">{beat.clueCardTitle}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suspects Selection Grid */}
      <div className="space-y-3">
        <span className="font-mono text-[10px] text-case-muted uppercase tracking-wider block">
          SELECT SUSPECT TO FORMALLY ACCUSE:
        </span>
        {activeCase.suspects.map((suspect) => (
          <SuspectCard
            key={suspect.id}
            suspect={suspect}
            isEliminated={session.eliminatedSuspects.includes(suspect.id)}
            isSelected={selectedSuspectId === suspect.id}
            onSelect={() => setSelectedSuspectId(suspect.id)}
            selectable={true}
          />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="pt-2">
        <button
          onClick={() => selectedSuspectId && setConfirmModalOpen(true)}
          disabled={!selectedSuspectId || isAIWorking}
          className={`w-full py-4 px-6 rounded-xl font-serif text-lg font-bold tracking-wide shadow-xl flex items-center justify-center space-x-2 transition-all ${
            selectedSuspectId
              ? 'bg-case-red hover:bg-case-redStamp text-case-paper shadow-case-red/20 active:scale-[0.98]'
              : 'bg-case-surface border border-case-border text-case-muted cursor-not-allowed opacity-60'
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
          <span>{isAIWorking ? 'EVALUATING...' : 'ACCUSE SUSPECT'}</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && selectedSuspect && (
        <div className="fixed inset-0 z-50 bg-case-bg/95 backdrop-blur-md p-6 flex flex-col justify-center max-w-md mx-auto animate-fadeIn">
          <div className="paper-texture p-6 rounded-2xl border border-case-red/40 space-y-4 shadow-2xl text-center">
            <span className="stamp-effect text-xs text-case-red border-case-red">
              CONFIRM ACCUSATION
            </span>

            <h3 className="font-serif text-2xl font-bold text-case-ink">
              Accuse {selectedSuspect.name}?
            </h3>

            <p className="font-sans text-xs text-case-inkMuted leading-relaxed">
              Are you prepared to close this case file and charge <strong>{selectedSuspect.name}</strong> ({selectedSuspect.occupation}) based on the physical clues discovered outdoors?
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="py-3 rounded-xl bg-case-ink/10 hover:bg-case-ink/20 text-case-ink font-mono text-xs transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmAccusation}
                className="py-3 rounded-xl bg-case-red hover:bg-case-redStamp text-case-paper font-serif font-bold text-sm shadow-lg transition-all"
              >
                CONFIRM ACCUSATION
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

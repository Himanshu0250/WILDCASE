import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Footprints, Smartphone } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore.js';

export const PrepareView: React.FC = () => {
  const navigate = useNavigate();
  const { activeCase, confirmPreparedAndEnterField } = useGameStore();

  if (!activeCase) return null;

  const handleEnterField = () => {
    confirmPreparedAndEnterField();
    navigate(`/case/${activeCase.id}/field`);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-8 text-center bg-grain min-h-[calc(100vh-65px)] flex flex-col justify-between">
      {/* Header */}
      <div className="space-y-2">
        <span className="font-mono text-[11px] font-bold text-case-amber uppercase tracking-widest block">
          PRE-DEPARTURE RITUAL
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-case-paper">
          Field Preparation
        </h2>
        <p className="text-xs text-case-muted font-sans max-w-xs mx-auto">
          You are about to transition from screen to physical investigation.
        </p>
      </div>

      {/* Field Check Checklist */}
      <div className="bg-case-card border border-case-border rounded-2xl p-5 text-left space-y-3.5 shadow-xl">
        <span className="font-mono text-[10px] text-case-muted uppercase tracking-wider block border-b border-case-border/40 pb-2">
          SYSTEM & ENVIRONMENTAL READINESS
        </span>

        <div className="flex items-center space-x-3 text-xs font-mono text-case-paper">
          <CheckCircle2 className="w-4 h-4 text-case-moss flex-shrink-0" />
          <span>Surrounding area is safe, open, and public</span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-case-paper">
          <CheckCircle2 className="w-4 h-4 text-case-moss flex-shrink-0" />
          <span>Camera & on-device descriptor sensor active</span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-case-paper">
          <CheckCircle2 className="w-4 h-4 text-case-moss flex-shrink-0" />
          <span>Tactile audio & Game Master telemetry enabled</span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-case-paper">
          <CheckCircle2 className="w-4 h-4 text-case-moss flex-shrink-0" />
          <span>Offline fallback dossier cached to device memory</span>
        </div>
      </div>

      {/* Pocket Instruction Ritual Card */}
      <div className="paper-texture p-6 rounded-2xl border border-case-amber/30 space-y-3 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-case-red/10 border-2 border-case-red flex items-center justify-center mx-auto text-case-red">
          <Smartphone className="w-6 h-6 animate-bounce" />
        </div>

        <h3 className="font-serif text-xl font-bold text-case-ink">
          Put Your Phone in Your Pocket.
        </h3>

        <p className="font-sans text-xs text-case-inkMuted leading-relaxed">
          Seriously. Look around at real buildings, fences, trees, and path markers. When you spot the requested physical evidence, take out the device only to scan and verify.
        </p>
      </div>

      {/* Primary Enter Action */}
      <div className="pt-2">
        <button
          onClick={handleEnterField}
          className="w-full py-4 px-6 rounded-xl bg-case-amber hover:bg-case-amberGlow text-case-bg font-serif text-lg font-bold tracking-wide shadow-xl shadow-case-amber/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
        >
          <Footprints className="w-5 h-5" />
          <span>ENTER FIELD MODE</span>
        </button>
      </div>
    </div>
  );
};

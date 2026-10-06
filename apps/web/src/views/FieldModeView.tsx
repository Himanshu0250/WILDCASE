import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore.js';

export const FieldModeView: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeCase,
    session,
    openCamera,
    requestHint,
    activeHint
  } = useGameStore();

  const [showHintMenu, setShowHintMenu] = useState(false);

  if (!activeCase || !session) return null;

  const currentBeat = activeCase.beats[session.currentBeatIndex];

  const handleOpenSensor = () => {
    openCamera();
    navigate(`/case/${activeCase.id}/evidence`);
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col justify-between px-4 py-6 max-w-lg mx-auto bg-case-bg text-case-paper overflow-hidden select-none">
      {/* Top HUD: Case Number, Beat Progress */}
      <div className="flex items-center justify-between font-mono text-xs text-case-muted border-b border-case-border/30 pb-3">
        <div>
          <span className="text-case-amber font-bold">{activeCase.caseNumber}</span>
          <span className="mx-2 text-case-border">•</span>
          <span className="text-case-paper uppercase tracking-wider">{activeCase.title}</span>
        </div>
        <div className="flex items-center space-x-1.5 bg-case-surface px-2.5 py-1 rounded-full border border-case-border">
          <span className="w-2 h-2 rounded-full bg-case-moss animate-pulse"></span>
          <span className="text-case-paper text-[11px] font-bold">BEAT 0{currentBeat.beatNumber} / 04</span>
        </div>
      </div>

      {/* Center Signature Instrument: Huge Breathing Radar Pulse */}
      <div className="my-auto text-center space-y-8">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center">
          {/* Subtle Outer Sonar Ring */}
          <div className="absolute inset-0 rounded-full border border-case-amber/10 animate-sonar-ping"></div>
          {/* Middle Ambient Pulse */}
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-case-card/40 border border-case-amber/30 flex items-center justify-center animate-pulse-slow">
            {/* Center Core Eye / Dot */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-case-surface border-2 border-case-amber flex flex-col items-center justify-center shadow-2xl shadow-case-amber/30">
              <span className="w-3.5 h-3.5 rounded-full bg-case-amber shadow-lg shadow-case-amber/50 animate-ping mb-1"></span>
              <span className="font-mono text-[9px] font-bold tracking-widest text-case-amber uppercase">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Primary Prompt / Instruction (Minimal Text) */}
        <div className="space-y-2 max-w-sm mx-auto px-4">
          <span className="font-mono text-xs font-bold text-case-cyan tracking-widest uppercase">
            {currentBeat.fieldInstruction}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-case-paper leading-snug">
            {currentBeat.prompt}
          </h2>
        </div>

        {/* Minimal Audio Waves / Status Indicator */}
        <div className="flex items-center justify-center space-x-1 py-1">
          <span className="w-1 h-3 bg-case-amber/40 rounded-full animate-pulse"></span>
          <span className="w-1 h-5 bg-case-amber/70 rounded-full animate-pulse"></span>
          <span className="w-1 h-2 bg-case-amber/30 rounded-full animate-pulse"></span>
          <span className="w-1 h-6 bg-case-amber rounded-full animate-pulse"></span>
          <span className="w-1 h-4 bg-case-amber/60 rounded-full animate-pulse"></span>
          <span className="w-1 h-2 bg-case-amber/30 rounded-full animate-pulse"></span>
        </div>
      </div>

      {/* Bottom Controls: Prominent 'I Found Something' Button + Hint Drawer */}
      <div className="space-y-3 pt-4 border-t border-case-border/30">
        {/* Main Discovery Trigger */}
        <button
          onClick={handleOpenSensor}
          className="w-full py-5 px-6 rounded-2xl bg-case-amber hover:bg-case-amberGlow text-case-bg font-serif text-xl font-extrabold tracking-wide shadow-2xl shadow-case-amber/30 flex items-center justify-center space-x-3 transition-all active:scale-[0.97]"
        >
          <Camera className="w-6 h-6" />
          <span>I FOUND SOMETHING</span>
        </button>

        {/* Hint Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowHintMenu(!showHintMenu)}
            className="w-full py-3 px-4 rounded-xl bg-case-surface hover:bg-case-card border border-case-border text-xs font-mono text-case-muted hover:text-case-paper flex items-center justify-between transition-colors"
          >
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-case-amber" />
              <span>REQUEST GAME MASTER HINT</span>
            </div>
            {showHintMenu ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {/* Hint Menu Drawer */}
          {showHintMenu && (
            <div className="mt-2 p-3.5 rounded-xl bg-case-card border border-case-border space-y-2.5 animate-fadeIn">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  onClick={() => requestHint(1)}
                  className="py-2 px-1.5 rounded-lg bg-case-surface border border-case-border text-[10px] font-mono text-case-paper hover:border-case-amber transition-colors text-center"
                >
                  LVL 1: NUDGE
                </button>
                <button
                  onClick={() => requestHint(2)}
                  className="py-2 px-1.5 rounded-lg bg-case-surface border border-case-border text-[10px] font-mono text-case-paper hover:border-case-amber transition-colors text-center"
                >
                  LVL 2: DIRECTION
                </button>
                <button
                  onClick={() => requestHint(3)}
                  className="py-2 px-1.5 rounded-lg bg-case-surface border border-case-border text-[10px] font-mono text-case-paper hover:border-case-amber transition-colors text-center"
                >
                  LVL 3: RELATION
                </button>
                <button
                  onClick={() => requestHint(4)}
                  className="py-2 px-1.5 rounded-lg bg-case-surface border border-case-border text-[10px] font-mono text-case-paper hover:border-case-amber transition-colors text-center"
                >
                  LVL 4: DEDUCE
                </button>
              </div>

              {activeHint && (
                <div className="p-3 rounded-lg bg-case-forestCard border border-case-moss/40 text-xs font-sans text-case-paper animate-fadeIn">
                  <span className="font-mono text-[10px] text-case-moss font-bold block uppercase">
                    HINT LEVEL {activeHint.level} REVEALED:
                  </span>
                  <p className="mt-1 leading-relaxed italic">"{activeHint.text}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

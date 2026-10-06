import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, BookOpen, ArrowRight, Footprints } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore.js';
import case014 from '../../../../fixtures/case_014_the_silent_witness.json' with { type: 'json' };

export const LandingView: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectCase,
    generateNewCase,
    isAIWorking,
    activeRecoverableSession,
    resumeRecoverableSession,
    abandonActiveSession
  } = useGameStore();

  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState<'park_green' | 'urban_alley' | 'suburban_trail'>('park_green');

  const handleResume = () => {
    resumeRecoverableSession();
    const current = useGameStore.getState().activeCase;
    const session = useGameStore.getState().session;
    if (current && session) {
      if (session.status === 'CASE_BRIEFING') navigate(`/case/${current.id}/brief`);
      else if (session.status === 'PREPARING_FIELD') navigate(`/case/${current.id}/prepare`);
      else if (session.status === 'ACCUSATION_PENDING') navigate(`/case/${current.id}/accuse`);
      else navigate(`/case/${current.id}/field`);
    }
  };

  const handleOpenCase = async () => {
    if (selectedEnv === 'park_green') {
      selectCase(case014 as any);
      navigate(`/case/${case014.id}/brief`);
    } else {
      await generateNewCase(selectedEnv, '3');
      const current = useGameStore.getState().activeCase;
      if (current) {
        navigate(`/case/${current.id}/brief`);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-between px-4 py-6 max-w-lg mx-auto bg-grain">
      {/* Top Coordinate Header */}
      <div className="flex items-center justify-between font-mono text-[11px] text-case-muted border-b border-case-border/40 pb-3">
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-case-amber animate-pulse"></span>
          <span>LAT 37.7749° N, LONG 122.4194° W</span>
        </span>
        <span className="text-case-cyan">OPEN FIELD PROTOCOL</span>
      </div>

      {/* Hero Body */}
      <div className="my-auto py-8 text-center space-y-6">
        {/* Radar Sonar Icon */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-case-amber/10 animate-sonar-ping"></div>
          <div className="w-16 h-16 rounded-full bg-case-card border-2 border-case-amber flex items-center justify-center shadow-lg shadow-case-amber/20">
            <Compass className="w-8 h-8 text-case-amber animate-pulse-slow" />
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-case-amber tracking-widest uppercase">
            OPEN-WEIGHT AI OUTDOOR ADVENTURE
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-case-paper tracking-tight">
            WILDCASE
          </h1>
          <p className="font-serif italic text-lg sm:text-xl text-case-paper/80 max-w-xs mx-auto">
            "The world is the case file."
          </p>
        </div>

        {/* Active Investigation Recovery Card */}
        {activeRecoverableSession && (
          <div className="paper-texture p-4 rounded-2xl border-2 border-case-amber shadow-2xl text-left space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="stamp-effect text-[10px] px-2 py-0.5">
                INVESTIGATION IN PROGRESS
              </span>
              <span className="font-mono text-[10px] text-case-red font-bold">
                {activeRecoverableSession.caseData.caseNumber}
              </span>
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-case-ink">
                {activeRecoverableSession.caseData.title}
              </h3>
              <p className="font-mono text-[11px] text-case-inkMuted">
                STATUS: {activeRecoverableSession.status.replace(/_/g, ' ')} • BEAT 0{activeRecoverableSession.currentBeatIndex + 1} / 04
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setShowAbandonModal(true)}
                className="py-2.5 rounded-xl bg-case-ink/10 hover:bg-case-ink/20 text-case-ink font-mono text-xs transition-colors"
              >
                ABANDON CASE
              </button>
              <button
                onClick={handleResume}
                className="py-2.5 rounded-xl bg-case-amber hover:bg-case-amberGlow text-case-bg font-serif font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1"
              >
                <span>RESUME</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Ambient Briefing */}
        <p className="text-xs sm:text-sm text-case-muted leading-relaxed max-w-sm mx-auto font-sans">
          This case cannot be solved from a chair. Step outside, observe your environment, uncover physical clues, and let the AI Game Master synthesize your discoveries.
        </p>

        {/* Environment Sector Picker */}
        <div className="pt-2">
          <span className="font-mono text-[10px] text-case-muted uppercase tracking-wider block mb-2">
            SELECT INVESTIGATION SECTOR
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedEnv('park_green')}
              className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                selectedEnv === 'park_green'
                  ? 'bg-case-forestCard border-case-moss text-case-paper ring-1 ring-case-moss'
                  : 'bg-case-surface border-case-border text-case-muted hover:text-case-paper'
              }`}
            >
              <TreesIcon className="w-4 h-4 mx-auto mb-1 text-case-moss" />
              PARK / TRAIL
            </button>
            <button
              onClick={() => setSelectedEnv('urban_alley')}
              className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                selectedEnv === 'urban_alley'
                  ? 'bg-case-card border-case-amber text-case-paper ring-1 ring-case-amber'
                  : 'bg-case-surface border-case-border text-case-muted hover:text-case-paper'
              }`}
            >
              <BuildingIcon className="w-4 h-4 mx-auto mb-1 text-case-amber" />
              URBAN STREET
            </button>
            <button
              onClick={() => setSelectedEnv('suburban_trail')}
              className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                selectedEnv === 'suburban_trail'
                  ? 'bg-case-surface border-case-cyan text-case-paper ring-1 ring-case-cyan'
                  : 'bg-case-surface border-case-border text-case-muted hover:text-case-paper'
              }`}
            >
              <TrailIcon className="w-4 h-4 mx-auto mb-1 text-case-cyan" />
              SUBURB PATH
            </button>
          </div>
        </div>
      </div>

      {/* Primary CTAs */}
      <div className="space-y-3 pt-4 border-t border-case-border/40">
        <button
          onClick={handleOpenCase}
          disabled={isAIWorking}
          className="w-full py-4 px-6 rounded-xl bg-case-amber hover:bg-case-amberGlow text-case-bg font-serif text-lg font-bold tracking-wide shadow-xl shadow-case-amber/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
        >
          <span>{isAIWorking ? 'CONNECTING CASE ARCHITECT...' : 'OPEN A CASE'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowHowItWorks(true)}
            className="py-3 px-4 rounded-xl bg-case-surface hover:bg-case-card border border-case-border text-xs font-mono text-case-paper/90 flex items-center justify-center space-x-2 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-case-amber" />
            <span>HOW IT WORKS</span>
          </button>

          <button
            onClick={() => navigate('/cases')}
            className="py-3 px-4 rounded-xl bg-case-surface hover:bg-case-card border border-case-border text-xs font-mono text-case-paper/90 flex items-center justify-center space-x-2 transition-colors"
          >
            <Footprints className="w-4 h-4 text-case-cyan" />
            <span>CASE FILES</span>
          </button>
        </div>
      </div>

      {/* How it works modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-50 bg-case-bg/95 backdrop-blur-md p-6 flex flex-col justify-center max-w-md mx-auto animate-fadeIn">
          <div className="paper-texture p-6 rounded-2xl border border-case-amber/30 space-y-4 shadow-2xl">
            <span className="stamp-effect text-xs mb-2">FIELD PROTOCOL</span>
            <h3 className="font-serif text-2xl font-bold text-case-ink">
              The Outdoor Mystery Loop
            </h3>
            <div className="space-y-3 text-xs text-case-inkMuted font-sans">
              <div className="flex items-start space-x-2">
                <span className="font-mono font-bold text-case-red bg-case-red/10 px-1.5 py-0.5 rounded">01</span>
                <p><strong>Receive Briefing:</strong> Read the mystery premise and 4 target environmental beats.</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-mono font-bold text-case-red bg-case-red/10 px-1.5 py-0.5 rounded">02</span>
                <p><strong>Pocket Phone & Walk:</strong> Explore your real surroundings (parks, streets, paths). The screen is designed to be closed.</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-mono font-bold text-case-red bg-case-red/10 px-1.5 py-0.5 rounded">03</span>
                <p><strong>Verify Clues:</strong> Discover physical evidence (metal fasteners, weathered bark, masonry) and scan briefly.</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-mono font-bold text-case-red bg-case-red/10 px-1.5 py-0.5 rounded">04</span>
                <p><strong>Deduce & Accuse:</strong> Connect the physical trail to suspect traits and close the case.</p>
              </div>
            </div>

            <button
              onClick={() => setShowHowItWorks(false)}
              className="w-full py-3 mt-4 rounded-xl bg-case-ink text-case-paper font-serif font-bold text-sm transition-colors hover:bg-black"
            >
              UNDERSTOOD — ENTER FIELD
            </button>
          </div>
        </div>
      )}

      {/* Abandon Confirmation Modal */}
      {showAbandonModal && (
        <div className="fixed inset-0 z-50 bg-case-bg/95 backdrop-blur-md p-6 flex flex-col justify-center max-w-md mx-auto animate-fadeIn">
          <div className="paper-texture p-6 rounded-2xl border border-case-red/40 space-y-4 shadow-2xl text-center">
            <span className="stamp-effect text-xs text-case-red border-case-red">
              CONFIRM ABANDONMENT
            </span>
            <h3 className="font-serif text-2xl font-bold text-case-ink">
              Abandon Investigation?
            </h3>
            <p className="font-sans text-xs text-case-inkMuted leading-relaxed">
              Are you sure you want to abandon the active case? All collected physical clues and progress for this session will be cleared.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowAbandonModal(false)}
                className="py-3 rounded-xl bg-case-ink/10 hover:bg-case-ink/20 text-case-ink font-mono text-xs transition-colors"
              >
                RESUME CASE
              </button>
              <button
                onClick={async () => {
                  setShowAbandonModal(false);
                  await abandonActiveSession();
                }}
                className="py-3 rounded-xl bg-case-red hover:bg-case-redStamp text-case-paper font-serif font-bold text-sm shadow-lg transition-all"
              >
                ABANDON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function TreesIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z" />
      <path d="M7 16v6" />
      <path d="M13 19v3" />
      <path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5" />
    </svg>
  );
}

function BuildingIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M8 10h.01" />
      <path d="M16 10h.01" />
      <path d="M8 14h.01" />
      <path d="M16 14h.01" />
    </svg>
  );
}

function TrailIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 18 6-6 4 4 8-8" />
      <path d="M14 8h6v6" />
    </svg>
  );
}

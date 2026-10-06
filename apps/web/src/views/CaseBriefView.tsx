import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, Users, FileText, MapPin } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore.js';
import { SuspectCard } from '../components/SuspectCard.js';

export const CaseBriefView: React.FC = () => {
  const navigate = useNavigate();
  const { activeCase, startPreparation, session } = useGameStore();
  const [activeTab, setActiveTab] = useState<'brief' | 'suspects' | 'beats'>('brief');

  if (!activeCase) return null;

  const handleBegin = () => {
    startPreparation();
    navigate(`/case/${activeCase.id}/prepare`);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Physical Folder Header Card */}
      <div className="paper-texture p-6 rounded-2xl border border-case-amber/30 relative shadow-2xl overflow-hidden">
        {/* Classified Stamp */}
        <div className="absolute top-4 right-4 z-10">
          <span className="stamp-effect text-[11px] px-2.5 py-1">
            CLASSIFIED FILE
          </span>
        </div>

        {/* Case Metadata */}
        <div className="space-y-1">
          <span className="font-mono text-xs font-bold text-case-red uppercase tracking-widest">
            {activeCase.caseNumber}
          </span>
          <h2 className="font-serif text-3xl font-extrabold text-case-ink leading-tight">
            {activeCase.title}
          </h2>
          <p className="font-serif italic text-sm text-case-inkMuted">
            "{activeCase.tagline}"
          </p>
        </div>

        {/* Technical Attributes Grid */}
        <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-case-ink/10 text-xs font-mono">
          <div className="p-2 rounded bg-case-ink/5 border border-case-ink/10">
            <span className="text-[10px] text-case-inkMuted uppercase block">LOCATION</span>
            <span className="font-bold text-case-ink truncate block">YOUR SECTOR</span>
          </div>
          <div className="p-2 rounded bg-case-ink/5 border border-case-ink/10">
            <span className="text-[10px] text-case-inkMuted uppercase block">EST. WALK</span>
            <span className="font-bold text-case-ink flex items-center space-x-1">
              <Clock className="w-3 h-3 text-case-red" />
              <span>{activeCase.estimatedMinutes} MIN</span>
            </span>
          </div>
          <div className="p-2 rounded bg-case-ink/5 border border-case-ink/10">
            <span className="text-[10px] text-case-inkMuted uppercase block">DIFFICULTY</span>
            <span className="font-bold text-case-amber flex items-center">
              {'★'.repeat(Number(activeCase.difficulty))}
              <span className="text-case-ink/20">{'★'.repeat(5 - Number(activeCase.difficulty))}</span>
            </span>
          </div>
        </div>

        {/* Atmosphere Tag */}
        <div className="mt-4 p-2.5 rounded bg-case-ink/5 border-l-2 border-case-amber text-xs text-case-ink font-sans">
          <span className="font-mono text-[10px] text-case-inkMuted font-bold block uppercase">ATMOSPHERE:</span>
          {activeCase.atmosphere}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-case-border font-mono text-xs">
        <button
          onClick={() => setActiveTab('brief')}
          className={`flex-1 py-2.5 text-center border-b-2 font-bold transition-colors ${
            activeTab === 'brief'
              ? 'border-case-amber text-case-amber'
              : 'border-transparent text-case-muted hover:text-case-paper'
          }`}
        >
          <FileText className="w-3.5 h-3.5 inline mr-1" />
          INCIDENT BRIEF
        </button>
        <button
          onClick={() => setActiveTab('suspects')}
          className={`flex-1 py-2.5 text-center border-b-2 font-bold transition-colors ${
            activeTab === 'suspects'
              ? 'border-case-amber text-case-amber'
              : 'border-transparent text-case-muted hover:text-case-paper'
          }`}
        >
          <Users className="w-3.5 h-3.5 inline mr-1" />
          SUSPECTS ({activeCase.suspects.length})
        </button>
        <button
          onClick={() => setActiveTab('beats')}
          className={`flex-1 py-2.5 text-center border-b-2 font-bold transition-colors ${
            activeTab === 'beats'
              ? 'border-case-amber text-case-amber'
              : 'border-transparent text-case-muted hover:text-case-paper'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 inline mr-1" />
          BEATS (4)
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'brief' && (
          <div className="bg-case-card border border-case-border rounded-xl p-5 space-y-4 font-sans text-sm text-case-paper/90 leading-relaxed">
            <h3 className="font-serif text-lg font-bold text-case-paper border-b border-case-border pb-2">
              The Occurrence
            </h3>
            <p>{activeCase.premise}</p>
            <div className="p-3 rounded-lg bg-case-surface border border-case-border text-xs text-case-muted space-y-1">
              <span className="font-mono text-case-amber font-bold block text-[10px] uppercase">
                INVESTIGATION RULE
              </span>
              <p>
                The Game Master has seeded physical clues in your environment. You will be prompted across 4 distinct beats. Look with your eyes, not your screen.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'suspects' && (
          <div className="space-y-3">
            {activeCase.suspects.map((suspect) => (
              <SuspectCard
                key={suspect.id}
                suspect={suspect}
                isEliminated={session?.eliminatedSuspects.includes(suspect.id) || false}
              />
            ))}
          </div>
        )}

        {activeTab === 'beats' && (
          <div className="space-y-2.5">
            {activeCase.beats.map((beat) => (
              <div
                key={beat.id}
                className="p-3.5 rounded-xl bg-case-card border border-case-border flex items-start space-x-3 text-xs"
              >
                <span className="font-mono font-bold text-case-amber bg-case-surface border border-case-border px-2 py-1 rounded">
                  0{beat.beatNumber}
                </span>
                <div className="space-y-0.5">
                  <h4 className="font-serif font-bold text-case-paper text-sm">
                    {beat.title}
                  </h4>
                  <p className="text-case-muted font-sans text-[11px]">{beat.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="pt-4 border-t border-case-border/40">
        <button
          onClick={handleBegin}
          className="w-full py-4 px-6 rounded-xl bg-case-amber hover:bg-case-amberGlow text-case-bg font-serif text-lg font-bold tracking-wide shadow-xl shadow-case-amber/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
        >
          <span>BEGIN INVESTIGATION</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

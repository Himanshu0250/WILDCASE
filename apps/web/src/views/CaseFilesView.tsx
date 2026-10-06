import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, Clock, Star, Plus, ArrowRight, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore.js';
import { Case } from '@wildcase/core';

export const CaseFilesView: React.FC = () => {
  const navigate = useNavigate();
  const { allCases, allReports, selectCase, generateNewCase, isAIWorking, setView } = useGameStore();

  const [selectedEnv, setSelectedEnv] = useState<Case['environmentType']>('park_green');
  const [selectedDiff, setSelectedDiff] = useState<Case['difficulty']>('3');
  const [showGenModal, setShowGenModal] = useState(false);

  const handleGenerate = async () => {
    setShowGenModal(false);
    await generateNewCase(selectedEnv, selectedDiff);
    const current = useGameStore.getState().activeCase;
    if (current) {
      navigate(`/case/${current.id}/brief`);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-case-border/60 pb-3">
        <div>
          <span className="font-mono text-[10px] text-case-amber uppercase tracking-widest block">
            ARCHIVES & DOSSIERS
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-case-paper">
            Case Files
          </h2>
        </div>
        <button
          onClick={() => setShowGenModal(true)}
          disabled={isAIWorking}
          className="py-2 px-3 rounded-xl bg-case-amber hover:bg-case-amberGlow text-case-bg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>NEW MYSTERY</span>
        </button>
      </div>

      {/* Case Folders List */}
      <div className="space-y-4">
        {allCases.map((c) => {
          const report = allReports.find((r) => r.caseId === c.id);
          const isSolved = report?.solved || false;

          return (
            <div
              key={c.id}
              onClick={() => {
                selectCase(c);
                navigate(`/case/${c.id}/brief`);
              }}
              className="paper-texture p-5 rounded-2xl border border-case-amber/30 cursor-pointer hover:shadow-xl transition-all duration-300 relative group text-case-ink"
            >
              {/* Solved Stamp */}
              {isSolved && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="stamp-solved text-[10px] px-2 py-0.5 border-2">
                    SOLVED
                  </span>
                </div>
              )}

              {/* Case Header */}
              <div className="space-y-1">
                <span className="font-mono text-[11px] font-bold text-case-red uppercase tracking-wider">
                  {c.caseNumber}
                </span>
                <h3 className="font-serif text-xl font-bold leading-tight group-hover:text-case-red transition-colors">
                  {c.title}
                </h3>
                <p className="font-serif italic text-xs text-case-inkMuted line-clamp-1">
                  "{c.tagline}"
                </p>
              </div>

              {/* Attributes */}
              <div className="flex items-center space-x-4 pt-3 mt-3 border-t border-case-ink/10 text-xs font-mono text-case-ink">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-case-red" />
                  <span>{c.estimatedMinutes} MIN</span>
                </span>
                <span className="text-case-amber">
                  {'★'.repeat(Number(c.difficulty))}
                  <span className="text-case-ink/20">{'★'.repeat(5 - Number(c.difficulty))}</span>
                </span>
                <span className="text-[10px] uppercase text-case-inkMuted truncate">
                  {c.environmentType.replace('_', ' ')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Generate Mystery Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 bg-case-bg/95 backdrop-blur-md p-6 flex flex-col justify-center max-w-md mx-auto animate-fadeIn">
          <div className="bg-case-card border border-case-amber/40 p-6 rounded-2xl space-y-5 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-case-border pb-3">
              <span className="font-mono text-xs text-case-amber font-bold uppercase tracking-wider">
                AI CASE ARCHITECT
              </span>
              <button
                onClick={() => setShowGenModal(false)}
                className="text-case-muted hover:text-case-paper text-xs font-mono"
              >
                CANCEL
              </button>
            </div>

            <h3 className="font-serif text-xl font-bold text-case-paper">
              Synthesize New Case
            </h3>

            {/* Sector Type */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-case-muted uppercase block">
                ENVIRONMENT SECTOR:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {[
                  { id: 'park_green', label: 'PARK / RESERVE' },
                  { id: 'urban_alley', label: 'URBAN STREET' },
                  { id: 'suburban_trail', label: 'SUBURBAN TRAIL' },
                  { id: 'campus_quad', label: 'CAMPUS QUAD' }
                ].map((env) => (
                  <button
                    key={env.id}
                    onClick={() => setSelectedEnv(env.id as any)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      selectedEnv === env.id
                        ? 'bg-case-amber text-case-bg font-bold border-case-amber'
                        : 'bg-case-surface border-case-border text-case-muted hover:text-case-paper'
                    }`}
                  >
                    {env.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-case-muted uppercase block">
                DIFFICULTY LEVEL:
              </span>
              <div className="grid grid-cols-5 gap-1 text-xs font-mono">
                {(['1', '2', '3', '4', '5'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDiff(d)}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      selectedDiff === d
                        ? 'bg-case-amber text-case-bg font-bold border-case-amber'
                        : 'bg-case-surface border-case-border text-case-muted hover:text-case-paper'
                    }`}
                  >
                    {d}★
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action */}
            <button
              onClick={handleGenerate}
              className="w-full py-3.5 rounded-xl bg-case-amber hover:bg-case-amberGlow text-case-bg font-serif font-bold text-base shadow-lg transition-all"
            >
              SYNTHESIZE MYSTERY
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

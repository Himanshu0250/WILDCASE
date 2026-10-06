import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck, Volume2 } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore.js';
import { voiceNarrator } from '../audio/voice-narrator.js';

export const VerdictView: React.FC = () => {
  const navigate = useNavigate();
  const { activeCase, session, latestVerdict, viewReport } = useGameStore();

  if (!activeCase || !session || !latestVerdict) return null;

  const isCorrect = latestVerdict.isCorrect;

  const handleViewReport = () => {
    viewReport();
    navigate(`/case/${activeCase.id}/report`);
  };

  const handleReplayVoice = () => {
    if (latestVerdict?.audioNarration) {
      voiceNarrator.playVoiceover(latestVerdict.audioNarration);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6 text-center animate-fadeIn">
      {/* Dynamic Stamp & Status */}
      <div className="space-y-3">
        {isCorrect ? (
          <div className="animate-stamp-in inline-block">
            <span className="stamp-solved text-sm sm:text-base px-4 py-1.5 border-4">
              CASE CLOSED — SOLVED
            </span>
          </div>
        ) : (
          <div className="animate-stamp-in inline-block">
            <span className="stamp-effect text-sm sm:text-base px-4 py-1.5 border-4">
              FALSE ACCUSATION
            </span>
          </div>
        )}

        <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-case-paper">
          {latestVerdict.verdictTitle}
        </h2>
      </div>

      {/* Dossier Resolution Card */}
      <div className="paper-texture p-6 rounded-2xl border border-case-amber/30 text-left space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-case-ink/10 pb-3">
          <div>
            <span className="font-mono text-[10px] text-case-inkMuted uppercase block">
              IDENTIFIED CULPRIT:
            </span>
            <h3 className="font-serif text-2xl font-bold text-case-ink">
              {latestVerdict.culpritName}
            </h3>
            <p className="text-xs font-mono text-case-red font-bold">
              {latestVerdict.culpritOccupation}
            </p>
          </div>
          <button
            onClick={handleReplayVoice}
            className="p-2 rounded-lg bg-case-ink/10 hover:bg-case-ink/20 text-case-ink flex items-center space-x-1 text-xs font-mono"
            title="Replay Verdict Narration"
          >
            <Volume2 className="w-4 h-4" />
            <span>VOICEOVER</span>
          </button>
        </div>

        {/* Narrative Breakdown */}
        <div className="space-y-2 text-xs sm:text-sm text-case-ink font-sans leading-relaxed">
          <p className="whitespace-pre-line">{latestVerdict.verdictNarrative}</p>
        </div>

        {/* Evidence Chain */}
        <div className="p-3 rounded-lg bg-case-ink/5 border border-case-ink/10 space-y-1.5 text-xs font-mono">
          <span className="text-[10px] text-case-inkMuted font-bold uppercase block">
            CONFIRMED PHYSICAL CHAIN OF EVIDENCE:
          </span>
          {latestVerdict.keyEvidenceSummary.map((item, idx) => (
            <div key={idx} className="flex items-center space-x-1.5 text-case-ink">
              <CheckCircle2 className="w-3.5 h-3.5 text-case-red flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action to Field Report */}
      <div className="pt-2">
        <button
          onClick={handleViewReport}
          className="w-full py-4 px-6 rounded-xl bg-case-amber hover:bg-case-amberGlow text-case-bg font-serif text-lg font-bold tracking-wide shadow-xl shadow-case-amber/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
        >
          <span>VIEW OFFICIAL FIELD REPORT</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Volume2, Sparkles, UserX, ShieldCheck, Tag } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore.js';
import { voiceNarrator } from '../audio/voice-narrator.js';

export const RevealView: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeCase,
    session,
    latestNarrative,
    proceedNextBeat
  } = useGameStore();

  if (!activeCase || !session) return null;
  const currentBeat = activeCase.beats[session.currentBeatIndex];
  const isFinalBeat = session.currentBeatIndex >= 3;

  const handleProceed = () => {
    proceedNextBeat();
    if (isFinalBeat) {
      navigate(`/case/${activeCase.id}/accuse`);
    } else {
      navigate(`/case/${activeCase.id}/field`);
    }
  };

  const handleReplayVoice = () => {
    if (latestNarrative?.commentary) {
      voiceNarrator.playVoiceover(latestNarrative.commentary, latestNarrative.audioBase64);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6 animate-paper-reveal">
      {/* Evidence Unlocked Physical Card */}
      <div className="paper-texture p-6 rounded-2xl border border-case-amber/30 space-y-5 shadow-2xl relative overflow-hidden">
        {/* Confirmed Stamp */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-case-red uppercase tracking-widest">
            BEAT 0{currentBeat.beatNumber} / 04 EVIDENCE
          </span>
          <span className="stamp-effect text-[11px] px-2.5 py-1">
            LEAD UNLOCKED
          </span>
        </div>

        {/* Title */}
        <div>
          <span className="font-mono text-[10px] text-case-inkMuted uppercase tracking-wider block">
            DISCOVERED CLUE
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-case-ink leading-tight">
            {currentBeat.clueCardTitle}
          </h2>
        </div>

        {/* Game Master Narrative Commentary */}
        <div className="p-4 rounded-xl bg-case-ink/5 border border-case-ink/10 space-y-3 font-sans text-xs sm:text-sm text-case-ink leading-relaxed">
          <div className="flex items-center justify-between border-b border-case-ink/10 pb-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-case-red">
              AI GAME MASTER LOG
            </span>
            <button
              onClick={handleReplayVoice}
              className="p-1 text-case-ink hover:text-case-red flex items-center space-x-1 text-[11px] font-mono"
              title="Replay Voiceover"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>REPLAY AUDIO</span>
            </button>
          </div>

          <p className="italic">
            "{latestNarrative?.commentary || currentBeat.narrativeRevelation}"
          </p>

          <div className="p-2.5 rounded bg-case-ink/10 text-xs font-mono text-case-ink font-semibold">
            {latestNarrative?.clue || 'Evidence logged to case file.'}
          </div>
        </div>

        {/* Suspect Elimination Impact */}
        {currentBeat.eliminatedSuspectIds.length > 0 && (
          <div className="p-3.5 rounded-xl bg-case-forest/10 border border-case-moss/40 flex items-start space-x-3 text-xs">
            <UserX className="w-5 h-5 text-case-moss flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-mono text-[10px] font-bold text-case-moss uppercase block">
                SUSPECT RULED OUT
              </span>
              <p className="text-case-ink font-sans">
                Physical characteristics contradict the alibi of{' '}
                <strong>
                  {activeCase.suspects.find((s) => s.id === currentBeat.eliminatedSuspectIds[0])?.name || 'the suspect'}
                </strong>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Primary Continue Button */}
      <div className="pt-2">
        <button
          onClick={handleProceed}
          className="w-full py-4 px-6 rounded-xl bg-case-amber hover:bg-case-amberGlow text-case-bg font-serif text-lg font-bold tracking-wide shadow-xl shadow-case-amber/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
        >
          <span>{isFinalBeat ? 'PROCEED TO ACCUSATION' : 'PUT PHONE IN POCKET & EXPLORE'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

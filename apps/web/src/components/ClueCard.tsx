import React from 'react';
import { InvestigationBeat } from '@wildcase/core';
import { CheckCircle2, Lock, MapPin, Tag } from 'lucide-react';

interface ClueCardProps {
  beat: InvestigationBeat;
  isUnlocked: boolean;
  isActive: boolean;
  discoveredDescriptors?: string[];
  commentary?: string;
  onClick?: () => void;
}

export const ClueCard: React.FC<ClueCardProps> = ({
  beat,
  isUnlocked,
  isActive,
  discoveredDescriptors = [],
  commentary,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl border transition-all duration-300 ${
        isUnlocked
          ? 'paper-texture border-case-amber/40 shadow-lg'
          : isActive
          ? 'bg-case-card border-case-amber/80 ring-1 ring-case-amber/30'
          : 'bg-case-surface/40 border-case-border/30 opacity-60'
      }`}
    >
      {/* Beat Tag & Status */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`font-mono text-[10px] tracking-widest font-bold uppercase px-2 py-0.5 rounded ${
            isUnlocked
              ? 'bg-case-ink text-case-paper'
              : isActive
              ? 'bg-case-amber text-case-bg font-bold'
              : 'bg-case-border text-case-muted'
          }`}
        >
          BEAT 0{beat.beatNumber} / 04
        </span>

        {isUnlocked ? (
          <span className="flex items-center space-x-1 text-[11px] font-mono font-bold text-case-red">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>CONFIRMED</span>
          </span>
        ) : isActive ? (
          <span className="flex items-center space-x-1 text-[11px] font-mono text-case-amber animate-pulse">
            <MapPin className="w-3.5 h-3.5" />
            <span>ACTIVE SEARCH</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1 text-[11px] font-mono text-case-muted">
            <Lock className="w-3.5 h-3.5" />
            <span>LOCKED</span>
          </span>
        )}
      </div>

      {/* Clue / Prompt Title */}
      <h4
        className={`font-serif text-base font-bold mb-1 leading-snug ${
          isUnlocked ? 'text-case-ink' : 'text-case-paper'
        }`}
      >
        {isUnlocked ? beat.clueCardTitle : beat.title}
      </h4>

      {/* Content */}
      {isUnlocked ? (
        <div className="space-y-2 text-xs text-case-inkMuted font-sans">
          <p className="leading-relaxed italic">
            "{commentary || beat.narrativeRevelation}"
          </p>
          {discoveredDescriptors.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {discoveredDescriptors.map((desc, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono bg-case-ink/10 text-case-ink px-2 py-0.5 rounded border border-case-ink/20"
                >
                  #{desc}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-case-muted font-sans">
          <p className="line-clamp-2">{beat.prompt}</p>
        </div>
      )}
    </div>
  );
};

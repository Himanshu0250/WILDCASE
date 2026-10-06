import React from 'react';
import { Suspect } from '@wildcase/core';
import { ShieldAlert, CheckCircle2, User, Wrench, Compass, Eye, Key, Radio, Zap, Trees } from 'lucide-react';

interface SuspectCardProps {
  suspect: Suspect;
  isEliminated: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  selectable?: boolean;
}

export const SuspectCard: React.FC<SuspectCardProps> = ({
  suspect,
  isEliminated,
  isSelected,
  onSelect,
  selectable = false
}) => {
  const getAvatarIcon = (symbol: string) => {
    switch (symbol) {
      case 'wrench': return <Wrench className="w-5 h-5" />;
      case 'compass': return <Compass className="w-5 h-5" />;
      case 'eye': return <Eye className="w-5 h-5" />;
      case 'key': return <Key className="w-5 h-5" />;
      case 'radio': return <Radio className="w-5 h-5" />;
      case 'zap': return <Zap className="w-5 h-5" />;
      case 'tree':
      case 'leaf': return <Trees className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  return (
    <div
      onClick={selectable ? onSelect : undefined}
      className={`relative p-4 rounded-xl border transition-all duration-300 ${
        selectable ? 'cursor-pointer hover:border-case-amber' : ''
      } ${
        isSelected
          ? 'bg-case-amber/10 border-case-amber ring-2 ring-case-amber/30'
          : isEliminated
          ? 'bg-case-surface/40 border-case-border/40 opacity-75'
          : 'bg-case-card border-case-border'
      }`}
    >
      {/* Elimination Stamp */}
      {isEliminated && (
        <div className="absolute top-3 right-3 z-10">
          <span className="stamp-solved text-[10px] px-2 py-0.5 border-2">
            RULED OUT
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start space-x-3 mb-3">
        <div className="p-2.5 rounded-lg bg-case-surface border border-case-border text-case-amber">
          {getAvatarIcon(suspect.avatarSymbol)}
        </div>
        <div>
          <span className="font-mono text-[10px] tracking-wider text-case-muted uppercase block">
            {suspect.badgeTag}
          </span>
          <h3 className="font-serif text-base font-bold text-case-paper leading-tight">
            {suspect.name}
          </h3>
          <p className="text-xs text-case-cyan font-mono">{suspect.occupation}</p>
        </div>
      </div>

      {/* Dossier info */}
      <div className="space-y-2 text-xs text-case-muted font-sans border-t border-case-border/40 pt-2.5">
        <div>
          <span className="font-mono text-[10px] text-case-paper block font-semibold">MOTIVE:</span>
          <p className="italic text-[11px] leading-relaxed text-case-paper/80">{suspect.motive}</p>
        </div>
        <div>
          <span className="font-mono text-[10px] text-case-paper block font-semibold">CLAIMED ALIBI:</span>
          <p className="text-[11px] leading-relaxed">{suspect.alibi}</p>
        </div>
      </div>

      {/* Observable Traits */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {suspect.traits.map((trait, idx) => (
          <span
            key={idx}
            className="text-[10px] font-mono bg-case-surface px-2 py-0.5 rounded border border-case-border text-case-paper/90"
          >
            {trait}
          </span>
        ))}
      </div>

      {/* Elimination notes if eliminated */}
      {isEliminated && suspect.eliminationClue && (
        <div className="mt-2.5 p-2 rounded bg-case-forest/60 border border-case-moss/40 text-[11px] text-case-paper/90">
          <span className="font-mono font-bold text-case-moss block text-[10px]">EVIDENCE CONTRADICTION:</span>
          {suspect.eliminationClue}
        </div>
      )}
    </div>
  );
};

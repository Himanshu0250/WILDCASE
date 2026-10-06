import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckCircle2, Lock, MapPin, Clock } from 'lucide-react';
import { EvidenceStamp } from './EvidenceStamp.js';

export interface EvidenceCardProps {
  beatNumber: number;
  title: string;
  prompt: string;
  isUnlocked: boolean;
  isActive: boolean;
  clueTitle?: string;
  revelation?: string;
  descriptors?: string[];
  onClick?: () => void;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  beatNumber,
  title,
  prompt,
  isUnlocked,
  isActive,
  clueTitle,
  revelation,
  descriptors = [],
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx(
          'relative p-4 rounded-xl border transition-all duration-300',
          isUnlocked
            ? 'bg-[#f3ebd7] text-[#1e1c18] border-[#df9f28]/40 shadow-lg'
            : isActive
            ? 'bg-[#1b2027] text-[#f3ebd7] border-[#df9f28] ring-1 ring-[#df9f28]/30'
            : 'bg-[#15181d]/40 text-[#7a8599] border-[#2a313d]/30 opacity-60'
        )
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={clsx(
            'font-mono text-[10px] tracking-widest font-bold uppercase px-2 py-0.5 rounded',
            isUnlocked
              ? 'bg-[#1e1c18] text-[#f3ebd7]'
              : isActive
              ? 'bg-[#df9f28] text-[#0c0e11]'
              : 'bg-[#2a313d] text-[#7a8599]'
          )}
        >
          BEAT 0{beatNumber} / 04
        </span>

        {isUnlocked ? (
          <span className="flex items-center space-x-1 text-[11px] font-mono font-bold text-[#c23b2d]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>CONFIRMED</span>
          </span>
        ) : isActive ? (
          <span className="flex items-center space-x-1 text-[11px] font-mono text-[#df9f28] animate-pulse">
            <MapPin className="w-3.5 h-3.5" />
            <span>ACTIVE SEARCH</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1 text-[11px] font-mono text-[#7a8599]">
            <Lock className="w-3.5 h-3.5" />
            <span>LOCKED</span>
          </span>
        )}
      </div>

      <h4 className="font-serif text-base font-bold mb-1 leading-snug">
        {isUnlocked ? clueTitle || title : title}
      </h4>

      {isUnlocked ? (
        <div className="space-y-2 text-xs opacity-90 font-sans">
          <p className="leading-relaxed italic">"{revelation}"</p>
          {descriptors.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {descriptors.map((desc, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono bg-black/10 px-2 py-0.5 rounded border border-black/20"
                >
                  #{desc}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs opacity-80 font-sans">
          <p className="line-clamp-2">{prompt}</p>
        </div>
      )}
    </div>
  );
};

export interface CaseFileProps {
  caseNumber: string;
  title: string;
  tagline: string;
  environmentType: string;
  estimatedMinutes: number;
  difficulty: string | number;
  isSolved?: boolean;
  onClick?: () => void;
}

export const CaseFile: React.FC<CaseFileProps> = ({
  caseNumber,
  title,
  tagline,
  environmentType,
  estimatedMinutes,
  difficulty,
  isSolved,
  onClick
}) => {
  const diffNum = Number(difficulty) || 3;

  return (
    <div
      onClick={onClick}
      className="bg-[#f3ebd7] text-[#1e1c18] p-5 rounded-2xl border border-[#df9f28]/30 cursor-pointer hover:shadow-xl transition-all duration-300 relative group"
    >
      {isSolved && (
        <div className="absolute top-4 right-4 z-10">
          <EvidenceStamp label="SOLVED" variant="solved" />
        </div>
      )}

      <div className="space-y-1">
        <span className="font-mono text-[11px] font-bold text-[#c23b2d] uppercase tracking-wider">
          {caseNumber}
        </span>
        <h3 className="font-serif text-xl font-bold leading-tight group-hover:text-[#c23b2d] transition-colors">
          {title}
        </h3>
        <p className="font-serif italic text-xs text-[#575246] line-clamp-1">
          "{tagline}"
        </p>
      </div>

      <div className="flex items-center space-x-4 pt-3 mt-3 border-t border-black/10 text-xs font-mono text-[#1e1c18]">
        <span className="flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5 text-[#c23b2d]" />
          <span>{estimatedMinutes} MIN</span>
        </span>
        <span className="text-[#df9f28]">
          {'★'.repeat(diffNum)}
          <span className="opacity-30">{'★'.repeat(5 - diffNum)}</span>
        </span>
        <span className="text-[10px] uppercase opacity-70 truncate">
          {environmentType.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
};

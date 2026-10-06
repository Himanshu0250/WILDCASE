import React from 'react';
import { ShieldCheck, AlertCircle, MapPin } from 'lucide-react';

export const SafetyNotice: React.FC<{ notice?: string }> = ({
  notice = 'Only observe objects in open, public, accessible areas. Never trespass on private property.'
}) => {
  return (
    <div className="p-3 rounded-xl bg-[#132118] border border-[#467458]/40 text-xs text-[#f3ebd7]/90 flex items-start space-x-2.5">
      <ShieldCheck className="w-4 h-4 text-[#467458] flex-shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <span className="font-mono text-[10px] font-bold text-[#467458] uppercase block">
          OUTDOOR SAFETY PROTOCOL
        </span>
        <p className="font-sans text-[11px] leading-relaxed">{notice}</p>
      </div>
    </div>
  );
};

export interface CaseMetadataProps {
  locationLabel: string;
  estimatedMinutes: number;
  difficulty: string | number;
}

export const CaseMetadata: React.FC<CaseMetadataProps> = ({
  locationLabel,
  estimatedMinutes,
  difficulty
}) => {
  const diffNum = Number(difficulty) || 3;

  return (
    <div className="grid grid-cols-3 gap-2 font-mono text-xs">
      <div className="p-2.5 rounded-lg bg-black/20 border border-current/10">
        <span className="text-[10px] opacity-70 uppercase block">LOCATION</span>
        <span className="font-bold truncate block">{locationLabel}</span>
      </div>
      <div className="p-2.5 rounded-lg bg-black/20 border border-current/10">
        <span className="text-[10px] opacity-70 uppercase block">EST. WALK</span>
        <span className="font-bold block">{estimatedMinutes} MIN</span>
      </div>
      <div className="p-2.5 rounded-lg bg-black/20 border border-current/10">
        <span className="text-[10px] opacity-70 uppercase block">DIFFICULTY</span>
        <span className="font-bold text-[#df9f28] flex items-center">
          {'★'.repeat(diffNum)}
          <span className="opacity-30">{'★'.repeat(5 - diffNum)}</span>
        </span>
      </div>
    </div>
  );
};

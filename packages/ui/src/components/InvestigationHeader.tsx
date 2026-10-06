import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Compass, Eye, Volume2, VolumeX, FolderArchive } from 'lucide-react';

export interface InvestigationHeaderProps {
  caseNumber?: string;
  title?: string;
  awayPercent?: number;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onOpenArchive?: () => void;
  onHomeClick?: () => void;
}

export const InvestigationHeader: React.FC<InvestigationHeaderProps> = ({
  caseNumber = 'CASE 014',
  title = 'THE SILENT WITNESS',
  awayPercent,
  isMuted = false,
  onToggleMute,
  onOpenArchive,
  onHomeClick
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0c0e11]/90 backdrop-blur-md border-b border-[#2a313d]/60 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onHomeClick}
          className="text-left group flex items-center space-x-2 focus:outline-none"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#df9f28] animate-pulse"></span>
          <div>
            <h1 className="font-serif text-sm font-bold tracking-wider text-[#f3ebd7] group-hover:text-[#df9f28] transition-colors">
              WILDCASE
            </h1>
            <p className="font-mono text-[10px] text-[#7a8599] tracking-widest uppercase">
              {caseNumber}
            </p>
          </div>
        </button>
      </div>

      {awayPercent !== undefined && (
        <div className="hidden sm:flex items-center space-x-2 bg-[#15181d] border border-[#2a313d] rounded-full px-3 py-1 text-[11px] font-mono">
          <Eye className="w-3.5 h-3.5 text-[#5898ab]" />
          <span className="text-[#7a8599]">AWAY:</span>
          <span className="text-[#df9f28] font-bold">{awayPercent}%</span>
        </div>
      )}

      <div className="flex items-center space-x-2">
        {onToggleMute && (
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-[#15181d] hover:bg-[#1b2027] text-[#7a8599] hover:text-[#f3ebd7] border border-[#2a313d] transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#c23b2d]" /> : <Volume2 className="w-4 h-4 text-[#5898ab]" />}
          </button>
        )}
        {onOpenArchive && (
          <button
            onClick={onOpenArchive}
            className="p-2 rounded-lg bg-[#15181d] hover:bg-[#1b2027] text-[#7a8599] hover:text-[#f3ebd7] border border-[#2a313d] transition-colors"
            title="Archive"
          >
            <FolderArchive className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};

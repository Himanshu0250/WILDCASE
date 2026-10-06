import React from 'react';
import { Camera, HelpCircle, AlertTriangle, RefreshCw, FolderSearch, Loader2, Sparkles } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from './PrimaryButton.js';

export interface FieldModeShellProps {
  caseNumber: string;
  beatNumber: number;
  fieldInstruction: string;
  prompt: string;
  onTriggerDiscovery: () => void;
  onRequestHint?: () => void;
  activeHintText?: string;
}

export const FieldModeShell: React.FC<FieldModeShellProps> = ({
  caseNumber,
  beatNumber,
  fieldInstruction,
  prompt,
  onTriggerDiscovery,
  onRequestHint,
  activeHintText
}) => {
  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col justify-between px-4 py-6 max-w-lg mx-auto bg-[#0c0e11] text-[#f3ebd7] overflow-hidden select-none">
      {/* Top indicator */}
      <div className="flex items-center justify-between font-mono text-xs text-[#7a8599] border-b border-[#2a313d]/40 pb-3">
        <span className="text-[#df9f28] font-bold">{caseNumber}</span>
        <div className="flex items-center space-x-1.5 bg-[#15181d] px-2.5 py-1 rounded-full border border-[#2a313d]">
          <span className="w-2 h-2 rounded-full bg-[#467458] animate-pulse"></span>
          <span className="text-[#f3ebd7] text-[11px] font-bold">BEAT 0{beatNumber} / 04</span>
        </div>
      </div>

      {/* Center Breathing Sonar Indicator */}
      <div className="my-auto text-center space-y-8">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#df9f28]/10 animate-sonar-ping"></div>
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-[#1b2027]/40 border border-[#df9f28]/30 flex items-center justify-center animate-pulse-slow">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#15181d] border-2 border-[#df9f28] flex flex-col items-center justify-center shadow-2xl shadow-[#df9f28]/30">
              <span className="w-3.5 h-3.5 rounded-full bg-[#df9f28] shadow-lg shadow-[#df9f28]/50 animate-ping mb-1"></span>
              <span className="font-mono text-[9px] font-bold tracking-widest text-[#df9f28] uppercase">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 max-w-sm mx-auto px-4">
          <span className="font-mono text-xs font-bold text-[#5898ab] tracking-widest uppercase">
            {fieldInstruction}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#f3ebd7] leading-snug">
            {prompt}
          </h2>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="space-y-3 pt-4 border-t border-[#2a313d]/40">
        <PrimaryButton
          onClick={onTriggerDiscovery}
          icon={<Camera className="w-5 h-5" />}
          className="text-lg py-4 shadow-xl"
        >
          I FOUND SOMETHING
        </PrimaryButton>

        {onRequestHint && (
          <SecondaryButton
            onClick={onRequestHint}
            icon={<HelpCircle className="w-4 h-4 text-[#df9f28]" />}
          >
            REQUEST GAME MASTER HINT
          </SecondaryButton>
        )}

        {activeHintText && (
          <div className="p-3 rounded-xl bg-[#1a2e22] border border-[#467458]/40 text-xs font-sans text-[#f3ebd7]">
            <span className="font-mono text-[10px] text-[#467458] font-bold block uppercase">
              HINT DISPATCH:
            </span>
            <p className="mt-1 italic leading-relaxed">"{activeHintText}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'CONNECTING CASE ARCHITECT...'
}) => {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center space-y-4 text-center p-6">
      <Loader2 className="w-8 h-8 text-[#df9f28] animate-spin" />
      <span className="font-mono text-xs font-bold text-[#df9f28] tracking-widest uppercase">
        {message}
      </span>
    </div>
  );
};

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({
  message = 'An unexpected error occurred during field analysis.',
  onRetry
}) => {
  return (
    <div className="p-6 rounded-2xl bg-[#c23b2d]/10 border border-[#c23b2d]/30 text-center space-y-4 max-w-md mx-auto my-8">
      <AlertTriangle className="w-10 h-10 text-[#c23b2d] mx-auto" />
      <h3 className="font-serif text-lg font-bold text-[#f3ebd7]">
        Field Analysis Interrupted
      </h3>
      <p className="text-xs text-[#7a8599] font-sans leading-relaxed">{message}</p>
      {onRetry && (
        <SecondaryButton onClick={onRetry} icon={<RefreshCw className="w-4 h-4" />}>
          RETRY ACTION
        </SecondaryButton>
      )}
    </div>
  );
};

export const EmptyState: React.FC<{ title?: string; message?: string; onAction?: () => void; actionLabel?: string }> = ({
  title = 'No Case Files Found',
  message = 'Explore previous investigations or synthesize a new mystery.',
  onAction,
  actionLabel = 'CREATE NEW CASE'
}) => {
  return (
    <div className="p-8 rounded-2xl bg-[#15181d] border border-[#2a313d] text-center space-y-4 max-w-md mx-auto my-8">
      <FolderSearch className="w-12 h-12 text-[#df9f28] mx-auto" />
      <h3 className="font-serif text-xl font-bold text-[#f3ebd7]">{title}</h3>
      <p className="text-xs text-[#7a8599] font-sans leading-relaxed">{message}</p>
      {onAction && (
        <PrimaryButton onClick={onAction}>
          {actionLabel}
        </PrimaryButton>
      )}
    </div>
  );
};

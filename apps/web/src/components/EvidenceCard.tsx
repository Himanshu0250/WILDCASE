import React from 'react';
import { Shield, Sparkles, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { EvidenceQualityLevel } from '@wildcase/core';

export interface EvidenceCardProps {
  evidenceNumber: number | string;
  caseNumber: string;
  title: string;
  observedDescriptors: string[];
  qualityLevel: EvidenceQualityLevel;
  timestamp?: string;
  narrativeInterpretation?: string;
  narrativeConfidence?: number;
  sourceLabel?: string;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  evidenceNumber,
  caseNumber,
  title,
  observedDescriptors,
  qualityLevel,
  timestamp,
  narrativeInterpretation,
  narrativeConfidence,
  sourceLabel = 'LOCAL FIELD SENSOR'
}) => {
  const isVerified = qualityLevel === 'VERIFIED';
  const isPromising = qualityLevel === 'PROMISING';
  const isPartial = qualityLevel === 'PARTIAL';

  return (
    <div className="paper-texture p-4 rounded-xl border border-case-border/60 shadow-lg font-sans space-y-3 relative overflow-hidden">
      {/* Top Header Label */}
      <div className="flex items-center justify-between border-b border-case-border/40 pb-2">
        <div className="flex items-center space-x-2">
          <span className="stamp-effect text-[10px] text-case-red border-case-red font-mono">
            EVIDENCE 0{evidenceNumber}
          </span>
          <span className="font-mono text-[10px] text-case-muted">
            {caseNumber}
          </span>
        </div>
        <div className="flex items-center space-x-1.5 font-mono text-[10px]">
          {isVerified ? (
            <span className="flex items-center space-x-1 text-case-cyan font-bold bg-case-cyan/10 px-2 py-0.5 rounded border border-case-cyan/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>VERIFIED MATCH</span>
            </span>
          ) : isPromising ? (
            <span className="flex items-center space-x-1 text-case-amber font-bold bg-case-amber/10 px-2 py-0.5 rounded border border-case-amber/30">
              <AlertCircle className="w-3 h-3" />
              <span>PROMISING SIGNAL</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-case-muted font-bold bg-case-surface px-2 py-0.5 rounded border border-case-border">
              <HelpCircle className="w-3 h-3" />
              <span>PARTIAL CANDIDATE</span>
            </span>
          )}
        </div>
      </div>

      {/* Target Title & Observed Features */}
      <div className="space-y-1">
        <h4 className="font-serif font-bold text-sm text-case-ink">
          {title}
        </h4>
        <div className="flex flex-wrap gap-1 pt-1">
          {observedDescriptors.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[9px] px-1.5 py-0.5 bg-case-ink/5 border border-case-ink/15 rounded text-case-ink"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* AI Narrative Commentary (Transparently Labeled) */}
      {narrativeInterpretation && (
        <div className="bg-case-bg/50 p-2.5 rounded-lg border border-case-border/40 space-y-1 text-xs">
          <div className="flex items-center justify-between text-[10px] font-mono text-case-muted">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-case-amber" />
              <span>FIELD DISPATCH COMMENTARY</span>
            </span>
            {narrativeConfidence !== undefined && (
              <span className="text-case-amber">
                Narrative Confidence: {Math.round(narrativeConfidence * 100)}%
              </span>
            )}
          </div>
          <p className="font-sans text-case-ink leading-relaxed italic text-[11px]">
            "{narrativeInterpretation}"
          </p>
        </div>
      )}

      {/* Footer Provenance */}
      <div className="flex items-center justify-between text-[9px] font-mono text-case-muted pt-1 border-t border-case-border/30">
        <div className="flex items-center space-x-1">
          <Shield className="w-2.5 h-2.5 text-case-cyan" />
          <span>{sourceLabel}</span>
        </div>
        {timestamp && <span>{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
      </div>
    </div>
  );
};

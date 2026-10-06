import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, RefreshCw, FolderArchive, Award, CheckCircle2, Clock, Smartphone, Eye } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore.js';
import { MetricRing } from '../components/MetricRing.js';

export const FieldReportView: React.FC = () => {
  const navigate = useNavigate();
  const { session, setView, resetToHome } = useGameStore();

  if (!session || !session.finalReport) return null;

  const report = session.finalReport;

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `WILDCASE — ${report.title} Solved!`,
          text: `I just solved ${report.caseNumber} ("${report.title}") outdoors! ${report.awayPercentage}% of my time was spent away from screens in the real world. #Wildcase #TouchGrass`,
          url: window.location.origin
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(
        `WILDCASE — ${report.caseNumber} Solved! Spent ${report.awayPercentage}% away from screen exploring the real world. ${window.location.origin}`
      );
      alert('Report summary copied to clipboard!');
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Official Field Report Document */}
      <div className="paper-texture p-6 sm:p-8 rounded-3xl border border-case-amber/30 space-y-6 shadow-2xl relative overflow-hidden text-case-ink">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b-2 border-case-ink pb-4">
          <div>
            <span className="font-mono text-[10px] tracking-widest uppercase font-bold text-case-red block">
              OFFICIAL DISPATCH
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight">
              FIELD REPORT
            </h2>
          </div>
          <div className="text-right">
            <span className="stamp-solved text-[11px] px-2.5 py-1 border-2">
              {report.solved ? 'CASE SOLVED' : 'INCOMPLETE'}
            </span>
          </div>
        </div>

        {/* Case Name & Date */}
        <div className="space-y-1">
          <span className="font-mono text-xs font-bold text-case-inkMuted uppercase tracking-wider">
            {report.caseNumber}
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug">
            {report.title}
          </h3>
          <p className="font-mono text-[10px] text-case-inkMuted">
            FILED: {new Date(report.timestamp).toLocaleString()}
          </p>
        </div>

        {/* Big Circular Metric Gauge */}
        <div className="py-2 flex justify-center">
          <MetricRing
            percentage={report.awayPercentage}
            size={160}
            strokeWidth={12}
            label="AWAY RATIO"
            sublabel="EXPLORING THE REAL WORLD"
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 font-mono text-xs border-y border-case-ink/10 py-4">
          <div className="p-3 rounded-xl bg-case-ink/5 border border-case-ink/10 space-y-0.5">
            <span className="text-[10px] text-case-inkMuted uppercase flex items-center space-x-1">
              <Eye className="w-3 h-3 text-case-amber" />
              <span>TIME OUTSIDE</span>
            </span>
            <span className="font-serif text-2xl font-extrabold text-case-ink block">
              {formatTime(report.awayDurationMs)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-case-ink/5 border border-case-ink/10 space-y-0.5">
            <span className="text-[10px] text-case-inkMuted uppercase flex items-center space-x-1">
              <Smartphone className="w-3 h-3 text-case-red" />
              <span>SCREEN TIME</span>
            </span>
            <span className="font-serif text-2xl font-extrabold text-case-ink block">
              {formatTime(report.screenDurationMs)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-case-ink/5 border border-case-ink/10 space-y-0.5">
            <span className="text-[10px] text-case-inkMuted uppercase block">
              EVIDENCE VERIFIED
            </span>
            <span className="font-serif text-2xl font-extrabold text-case-ink block">
              {report.evidenceFoundCount} / 4
            </span>
          </div>

          <div className="p-3 rounded-xl bg-case-ink/5 border border-case-ink/10 space-y-0.5">
            <span className="text-[10px] text-case-inkMuted uppercase block">
              CONVICTED
            </span>
            <span className="font-serif text-lg font-bold text-case-red truncate block">
              {report.culpritName}
            </span>
          </div>
        </div>

        {/* Epigraph / Principle */}
        <div className="text-center font-serif italic text-xs text-case-inkMuted leading-relaxed px-4">
          "Your phone helped you investigate. It didn't become the investigation."
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleShare}
          className="w-full py-4 px-6 rounded-xl bg-case-amber hover:bg-case-amberGlow text-case-bg font-serif text-base font-bold shadow-xl shadow-case-amber/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
        >
          <Share2 className="w-5 h-5" />
          <span>SHARE FIELD REPORT</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setView('CASE_FILES');
              navigate('/cases');
            }}
            className="py-3 px-4 rounded-xl bg-case-surface hover:bg-case-card border border-case-border text-xs font-mono text-case-paper flex items-center justify-center space-x-2 transition-colors"
          >
            <FolderArchive className="w-4 h-4 text-case-cyan" />
            <span>CASE ARCHIVE</span>
          </button>

          <button
            onClick={() => {
              resetToHome();
              navigate('/');
            }}
            className="py-3 px-4 rounded-xl bg-case-surface hover:bg-case-card border border-case-border text-xs font-mono text-case-paper flex items-center justify-center space-x-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-case-amber" />
            <span>NEW CASE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

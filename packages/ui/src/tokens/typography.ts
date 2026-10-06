/**
 * WILDCASE Typography Roles
 * Display (Editorial Serif), UI (Clean Sans), Evidence (Monospace)
 */
export const CaseTypography = {
  fontFamilies: {
    display: '"Fraunces", Georgia, serif',
    ui: '"Inter", system-ui, -apple-system, sans-serif',
    evidence: '"JetBrains Mono", monospace'
  },
  roles: {
    caseNumber: 'font-mono text-xs font-bold uppercase tracking-widest text-case-red',
    caseTitle: 'font-serif text-3xl sm:text-4xl font-extrabold text-case-paper leading-tight',
    sectionHeader: 'font-serif text-xl sm:text-2xl font-bold text-case-paper',
    subheading: 'font-serif italic text-sm sm:text-base text-case-muted',
    evidenceId: 'font-mono text-[10px] font-bold uppercase tracking-wider text-case-amber',
    metadataLabel: 'font-mono text-[10px] text-case-muted uppercase tracking-wider',
    metadataValue: 'font-mono text-xs font-bold text-case-paper',
    button: 'font-serif text-base font-bold tracking-wide',
    statusBadge: 'font-mono text-[10px] uppercase font-bold tracking-wider',
    body: 'font-sans text-xs sm:text-sm text-case-paper/90 leading-relaxed'
  }
} as const;

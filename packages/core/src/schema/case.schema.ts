import { z } from 'zod';

export const EvidenceCategoryEnum = z.enum([
  'weathered_surface',
  'metal_object',
  'organic_matter',
  'stone_masonry',
  'signage_text',
  'color_anomaly',
  'shadow_silhouette',
  'architectural_boundary',
  'path_marker',
  'water_reflection'
]);
export type EvidenceCategory = z.infer<typeof EvidenceCategoryEnum>;

export const SuspectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  occupation: z.string().min(2),
  badgeTag: z.string().default('PERSON OF INTEREST'),
  avatarSymbol: z.string().default('user'),
  motive: z.string().min(5),
  alibi: z.string().min(5),
  traits: z.array(z.string()).min(2),
  hiddenTrait: z.string().min(3),
  eliminationClue: z.string().optional()
});
export type Suspect = z.infer<typeof SuspectSchema>;

export const EvidencePredicateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  targetCategory: EvidenceCategoryEnum,
  requiredDescriptors: z.array(z.string()).min(1),
  optionalDescriptors: z.array(z.string()).default([]),
  minimumMatchScore: z.number().min(0).max(1).default(0.4),
  safetyNotice: z.string().default('Only observe objects in open, public, accessible areas. Never trespass.')
});
export type EvidencePredicate = z.infer<typeof EvidencePredicateSchema>;

export const HintLevelsSchema = z.object({
  level1: z.string().min(5), // Atmospheric nudge
  level2: z.string().min(5), // Directional clue
  level3: z.string().min(5)  // Specific observation
});
export type HintLevels = z.infer<typeof HintLevelsSchema>;

export const InvestigationBeatSchema = z.object({
  id: z.string().min(1),
  beatNumber: z.number().int().min(1).max(4),
  title: z.string().min(2),
  prompt: z.string().min(5), // What to look for
  fieldInstruction: z.string().min(5), // Concise instructions to pocket phone
  targetPredicate: EvidencePredicateSchema,
  hintLevels: HintLevelsSchema,
  clueCardTitle: z.string().min(2),
  narrativeRevelation: z.string().min(10), // Detective GM narrative unlocked upon discovery
  eliminatedSuspectIds: z.array(z.string()).default([])
});
export type InvestigationBeat = z.infer<typeof InvestigationBeatSchema>;

export const CaseSchema = z.object({
  id: z.string().min(1),
  caseNumber: z.string().min(1), // e.g. "CASE-014"
  title: z.string().min(3),
  tagline: z.string().min(3),
  atmosphere: z.string().min(5),
  environmentType: z.enum(['park_green', 'urban_alley', 'suburban_trail', 'coastal_dock', 'campus_quad']),
  premise: z.string().min(20),
  estimatedMinutes: z.number().int().min(10).max(60).default(25),
  difficulty: z.enum(['1', '2', '3', '4', '5']).default('3'),
  suspects: z.array(SuspectSchema).min(3).max(4),
  culpritId: z.string().min(1),
  beats: z.array(InvestigationBeatSchema).length(4),
  solutionNarrative: z.string().min(20),
  audioNarrationSummary: z.string().min(10),
  createdAt: z.string().datetime().optional()
});
export type Case = z.infer<typeof CaseSchema>;

export const AccusationRequestSchema = z.object({
  caseId: z.string(),
  accusedSuspectId: z.string(),
  deductionNotes: z.string().optional()
});
export type AccusationRequest = z.infer<typeof AccusationRequestSchema>;

export const VerdictResponseSchema = z.object({
  caseId: z.string(),
  isCorrect: z.boolean(),
  culpritId: z.string(),
  culpritName: z.string(),
  culpritOccupation: z.string(),
  verdictTitle: z.string(),
  verdictNarrative: z.string(),
  keyEvidenceSummary: z.array(z.string()),
  audioNarration: z.string().optional()
});
export type VerdictResponse = z.infer<typeof VerdictResponseSchema>;

export const FieldReportSchema = z.object({
  caseId: z.string(),
  caseNumber: z.string(),
  title: z.string(),
  culpritId: z.string(),
  culpritName: z.string(),
  solved: z.boolean(),
  totalDurationMs: z.number().nonnegative(),
  screenDurationMs: z.number().nonnegative(),
  awayDurationMs: z.number().nonnegative(),
  awayPercentage: z.number().min(0).max(100),
  evidenceFoundCount: z.number().int().min(0).max(4),
  totalBeats: z.number().int().default(4),
  hintsUsedCount: z.number().int().default(0),
  timestamp: z.string()
});
export type FieldReport = z.infer<typeof FieldReportSchema>;

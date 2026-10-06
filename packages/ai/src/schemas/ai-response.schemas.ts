import { z } from 'zod';
import { CaseSchema } from '@wildcase/core';

export const CaseGenerationParamsSchema = z.object({
  environmentType: z.enum(['park_green', 'urban_alley', 'suburban_trail', 'coastal_dock', 'campus_quad']).default('park_green'),
  difficulty: z.enum(['1', '2', '3', '4', '5']).default('3'),
  playerThemePrompt: z.string().optional(),
  estimatedMinutes: z.number().int().min(15).max(45).default(25)
});
export type CaseGenerationParams = z.infer<typeof CaseGenerationParamsSchema>;

export const EvidenceInterpretationParamsSchema = z.object({
  caseId: z.string(),
  caseTitle: z.string(),
  beatNumber: z.number().int().min(1).max(4),
  beatTitle: z.string(),
  targetPredicateName: z.string(),
  candidateDescriptors: z.array(z.string()),
  userObservationNote: z.string().optional(),
  isMatch: z.boolean(),
  culpritName: z.string(),
  eliminatedSuspectName: z.string().optional()
});
export type EvidenceInterpretationParams = z.infer<typeof EvidenceInterpretationParamsSchema>;

export const EvidenceInterpretationResultSchema = z.object({
  narrativeTitle: z.string(),
  gmCommentary: z.string().min(10),
  leadUnlockedTitle: z.string(),
  deductionClue: z.string(),
  soundMood: z.enum(['tension', 'discovery', 'clue_locked', 'peril', 'subtle_lead']).default('discovery')
});
export type EvidenceInterpretationResult = z.infer<typeof EvidenceInterpretationResultSchema>;

export const HintGenerationParamsSchema = z.object({
  caseTitle: z.string(),
  beatNumber: z.number().int().min(1).max(4),
  beatPrompt: z.string(),
  hintLevel: z.number().int().min(1).max(4),
  targetCategory: z.string(),
  timeSpentSeconds: z.number()
});
export type HintGenerationParams = z.infer<typeof HintGenerationParamsSchema>;

export const HintResultSchema = z.object({
  hintLevel: z.number().int().min(1).max(4),
  hintText: z.string().min(5),
  atmosphericAdvisory: z.string()
});
export type HintResult = z.infer<typeof HintResultSchema>;

export const VerdictGenerationParamsSchema = z.object({
  caseTitle: z.string(),
  culpritName: z.string(),
  culpritOccupation: z.string(),
  accusedName: z.string(),
  isCorrect: z.boolean(),
  discoveredEvidenceTitles: z.array(z.string()),
  awayPercentage: z.number()
});
export type VerdictGenerationParams = z.infer<typeof VerdictGenerationParamsSchema>;

export const VerdictNarrativeResultSchema = z.object({
  verdictTitle: z.string(),
  openingStatement: z.string(),
  evidenceBreakdown: z.string(),
  concludingRemarks: z.string(),
  audioVoiceoverText: z.string()
});
export type VerdictNarrativeResult = z.infer<typeof VerdictNarrativeResultSchema>;

import { z } from 'zod';
import { CaseSchema, FieldReportSchema } from './case.schema.js';

export const InvestigationStatusEnum = z.enum([
  'IDLE',
  'CASE_BRIEFING',
  'PREPARING_FIELD',
  'FIELD_SEARCHING',
  'EVIDENCE_CAPTURING',
  'EVIDENCE_ANALYZING',
  'BEAT_REVEALED',
  'ACCUSATION_PENDING',
  'VERDICT_REVEALED',
  'REPORT_READY',
  'ABANDONED'
]);
export type InvestigationStatus = z.infer<typeof InvestigationStatusEnum>;

export const DiscoveredEvidenceSchema = z.object({
  beatId: z.string(),
  beatNumber: z.number().int().min(1).max(4),
  predicateId: z.string(),
  discoveredAt: z.number(), // epoch ms
  matchedDescriptors: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
  userObservationNote: z.string().optional(),
  gmCommentary: z.string()
});
export type DiscoveredEvidence = z.infer<typeof DiscoveredEvidenceSchema>;

export const ScreenMetricsSchema = z.object({
  startedAt: z.number(),
  lastActiveTimestamp: z.number(),
  isScreenActive: z.boolean(),
  totalScreenTimeMs: z.number().nonnegative(),
  totalAwayTimeMs: z.number().nonnegative(),
  switchCount: z.number().nonnegative()
});
export type ScreenMetrics = z.infer<typeof ScreenMetricsSchema>;

export const InvestigationSessionSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  caseData: CaseSchema,
  status: InvestigationStatusEnum,
  currentBeatIndex: z.number().int().min(0).max(3),
  discoveredEvidence: z.array(DiscoveredEvidenceSchema),
  unlockedClues: z.array(z.string()),
  eliminatedSuspects: z.array(z.string()),
  activeHintsRevealed: z.record(z.string(), z.number().int().min(0).max(4)), // beatId -> hintLevel (1,2,3,4)
  screenMetrics: ScreenMetricsSchema,
  accusation: z.object({
    accusedSuspectId: z.string(),
    accusedAt: z.number(),
    isCorrect: z.boolean()
  }).optional(),
  finalReport: FieldReportSchema.optional()
});
export type InvestigationSession = z.infer<typeof InvestigationSessionSchema>;

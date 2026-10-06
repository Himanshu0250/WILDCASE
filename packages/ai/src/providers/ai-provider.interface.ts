import { Case } from '@wildcase/core';
import {
  CaseGenerationParams,
  EvidenceInterpretationParams,
  EvidenceInterpretationResult,
  HintGenerationParams,
  HintResult,
  VerdictGenerationParams,
  VerdictNarrativeResult
} from '../schemas/ai-response.schemas.js';

export interface AIProvider {
  readonly providerId: string;
  readonly modelName: string;

  /**
   * Generates a fully playable, validated 4-beat mystery Case.
   */
  generateCase(params: CaseGenerationParams): Promise<Case>;

  /**
   * Interprets player evidence discovery and generates detective GM response.
   */
  interpretEvidence(params: EvidenceInterpretationParams): Promise<EvidenceInterpretationResult>;

  /**
   * Produces an atmospheric hint corresponding to level 1, 2, or 3.
   */
  generateHint(params: HintGenerationParams): Promise<HintResult>;

  /**
   * Crafts a cinematic closing verdict monologue.
   */
  generateVerdict(params: VerdictGenerationParams): Promise<VerdictNarrativeResult>;
}

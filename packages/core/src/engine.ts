import { Case, CaseSchema, FieldReport, VerdictResponse } from './schema/case.schema.js';
import { InvestigationMachine } from './state-machine/investigation-machine.js';
import { CaseValidator, ValidationResult } from './validator/case.validator.js';
import { EvidenceMatcher, MatchResult } from './predicates/matcher.js';
import { InvestigationSession } from './schema/investigation.schema.js';

export class WildcaseEngine {
  /**
   * Validates a candidate Case definition.
   */
  public static validateCase(rawCase: unknown): ValidationResult {
    return CaseValidator.validate(rawCase);
  }

  /**
   * Matches candidate descriptors against an evidence predicate.
   */
  public static testEvidence(
    predicate: Case['beats'][0]['targetPredicate'],
    candidateDescriptors: string[]
  ): MatchResult {
    return EvidenceMatcher.evaluate(predicate, candidateDescriptors);
  }

  /**
   * Creates a new investigation state machine session for a given case.
   */
  public static createSession(caseData: Case): InvestigationMachine {
    const validation = this.validateCase(caseData);
    if (!validation.valid) {
      throw new Error(`Invalid case provided to engine: ${validation.errors.join('; ')}`);
    }
    return new InvestigationMachine(caseData);
  }

  /**
   * Resumes an existing state machine session.
   */
  public static resumeSession(sessionData: InvestigationSession): InvestigationMachine {
    return new InvestigationMachine(sessionData);
  }

  /**
   * Evaluates an accusation and generates the canonical verdict payload.
   */
  public static evaluateAccusation(caseData: Case, suspectId: string): VerdictResponse {
    const isCorrect = caseData.culpritId === suspectId;
    const culprit = caseData.suspects.find((s) => s.id === caseData.culpritId);
    const accused = caseData.suspects.find((s) => s.id === suspectId);

    const culpritName = culprit ? culprit.name : 'Unknown';
    const culpritOccupation = culprit ? culprit.occupation : 'Unknown';

    if (isCorrect) {
      return {
        caseId: caseData.id,
        isCorrect: true,
        culpritId: caseData.culpritId,
        culpritName,
        culpritOccupation,
        verdictTitle: 'CASE CLOSED — PERPETRATOR APPREHENDED',
        verdictNarrative: `Your field deduction was flawless. ${caseData.solutionNarrative}`,
        keyEvidenceSummary: caseData.beats.map((b) => `${b.title}: ${b.clueCardTitle}`),
        audioNarration: `Case closed. The perpetrator, ${culpritName}, has been conclusively identified through physical evidence discovered across all four field beats.`
      };
    } else {
      return {
        caseId: caseData.id,
        isCorrect: false,
        culpritId: caseData.culpritId,
        culpritName,
        culpritOccupation,
        verdictTitle: 'INVESTIGATION FLAWED — FALSE ACCUSATION',
        verdictNarrative: `You accused ${accused?.name || 'an innocent person'}, but the evidence points conclusively elsewhere. ${caseData.solutionNarrative}`,
        keyEvidenceSummary: caseData.beats.map((b) => `${b.title}: ${b.clueCardTitle}`),
        audioNarration: `The accusation against ${accused?.name || 'the suspect'} failed. The true culprit was ${culpritName}. Review the field report to trace the evidence chain.`
      };
    }
  }
}

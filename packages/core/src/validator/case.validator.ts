import { Case, CaseSchema } from '../schema/case.schema.js';
import { isDescriptorSupported } from '../schema/evidence-vocabulary.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const FORBIDDEN_HAZARD_KEYWORDS = [
  'trespass',
  'private property',
  'climb over',
  'climb fence',
  'climb roof',
  'enter substation',
  'touch high voltage',
  'highway traffic',
  'railway track',
  'railroad track',
  'restricted area',
  'steep cliff',
  'deep water'
];

export class CaseValidator {
  /**
   * Validates a Case object against structural, logical, safety, sensor compatibility, and gameplay rules.
   */
  public static validate(rawCase: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Zod Schema Check
    const parseResult = CaseSchema.safeParse(rawCase);
    if (!parseResult.success) {
      return {
        valid: false,
        errors: parseResult.error.errors.map(
          (err) => `Schema error at [${err.path.join('.')}]: ${err.message}`
        ),
        warnings
      };
    }

    const caseData: Case = parseResult.data;

    // 2. Single Valid Culprit Check
    const suspectIds = new Set(caseData.suspects.map((s) => s.id));
    if (!suspectIds.has(caseData.culpritId)) {
      errors.push(
        `Culprit ID "${caseData.culpritId}" is not present in the suspect list [${Array.from(suspectIds).join(', ')}].`
      );
    }

    if (caseData.suspects.length < 3) {
      errors.push(`Case must have at least 3 suspects for meaningful deduction (found ${caseData.suspects.length}).`);
    }

    // 3. Beat Structure & Sequencing
    if (caseData.beats.length !== 4) {
      errors.push(`Case must have exactly 4 beats (found ${caseData.beats.length}).`);
    } else {
      caseData.beats.forEach((beat, idx) => {
        if (beat.beatNumber !== idx + 1) {
          errors.push(`Beat at index ${idx} has beatNumber ${beat.beatNumber}, expected ${idx + 1}.`);
        }

        // Verify eliminated suspects exist
        for (const eliminatedId of beat.eliminatedSuspectIds) {
          if (!suspectIds.has(eliminatedId)) {
            errors.push(`Beat ${beat.beatNumber} eliminates non-existent suspect "${eliminatedId}".`);
          }
          if (eliminatedId === caseData.culpritId) {
            errors.push(`Beat ${beat.beatNumber} mistakenly eliminates the true culprit "${eliminatedId}".`);
          }
        }

        // 6. Sensor Vocabulary Compatibility Audit
        for (const req of beat.targetPredicate.requiredDescriptors) {
          if (!isDescriptorSupported(req)) {
            errors.push(
              `Beat ${beat.beatNumber} target predicate "${beat.targetPredicate.name}" requires unsupported sensor descriptor "${req}". Field sensor cannot detect this capability.`
            );
          }
        }
      });
    }

    // 4. Safety Audit
    const allText = [
      caseData.premise,
      caseData.solutionNarrative,
      ...caseData.beats.flatMap((b) => [
        b.title,
        b.prompt,
        b.fieldInstruction,
        b.narrativeRevelation,
        b.hintLevels.level1,
        b.hintLevels.level2,
        b.hintLevels.level3
      ])
    ]
      .join(' ')
      .toLowerCase();

    for (const forbidden of FORBIDDEN_HAZARD_KEYWORDS) {
      if (allText.includes(forbidden)) {
        errors.push(`Safety violation: case text contains prohibited unsafe activity term "${forbidden}".`);
      }
    }

    // 5. Deductive Solvability Check
    const allEliminatedByBeats = new Set(
      caseData.beats.flatMap((b) => b.eliminatedSuspectIds)
    );
    const innocentSuspects = caseData.suspects
      .map((s) => s.id)
      .filter((id) => id !== caseData.culpritId);

    // Ensure all innocent suspects can be ruled out or the trail conclusively points to the culprit
    const uneliminatedInnocents = innocentSuspects.filter(
      (id) => !allEliminatedByBeats.has(id)
    );
    if (uneliminatedInnocents.length > 0) {
      warnings.push(
        `Innocent suspect(s) [${uneliminatedInnocents.join(', ')}] are not explicitly marked as eliminated in beat metadata. Clues must clearly distinguish them.`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

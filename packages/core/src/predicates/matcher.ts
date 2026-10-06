import { EvidencePredicate } from '../schema/case.schema.js';

export type EvidenceQualityLevel = 'NO_SIGNAL' | 'PARTIAL' | 'PROMISING' | 'VERIFIED';

export interface MatchResult {
  isMatch: boolean;
  qualityLevel: EvidenceQualityLevel;
  score: number; // 0.0 to 1.0
  matchedRequired: string[];
  missingRequired: string[];
  matchedOptional: string[];
  feedback: string;
  salienceBreakdown: {
    requiredScore: number;
    optionalBonus: number;
    totalRawScore: number;
  };
}

export class EvidenceMatcher {
  /**
   * Deterministically evaluates candidate descriptors against a target evidence predicate.
   * AI is strictly excluded from deciding whether physical evidence matches.
   */
  public static evaluate(
    predicate: EvidencePredicate,
    candidateDescriptors: string[]
  ): MatchResult {
    const normalizedCandidates = new Set(
      candidateDescriptors.map((d) => d.toLowerCase().trim())
    );

    const matchedRequired: string[] = [];
    const missingRequired: string[] = [];
    const matchedOptional: string[] = [];

    // 1. Evaluate required descriptors
    for (const req of predicate.requiredDescriptors) {
      const normReq = req.toLowerCase().trim();
      const matched = Array.from(normalizedCandidates).some(
        (c) => c === normReq || c.includes(normReq) || normReq.includes(c)
      );

      if (matched) {
        matchedRequired.push(req);
      } else {
        missingRequired.push(req);
      }
    }

    // 2. Evaluate optional descriptors
    for (const opt of predicate.optionalDescriptors) {
      const normOpt = opt.toLowerCase().trim();
      const matched = Array.from(normalizedCandidates).some(
        (c) => c === normOpt || c.includes(normOpt) || normOpt.includes(c)
      );

      if (matched) {
        matchedOptional.push(opt);
      }
    }

    // 3. Calculate score components
    const requiredRatio =
      predicate.requiredDescriptors.length > 0
        ? matchedRequired.length / predicate.requiredDescriptors.length
        : 1.0;

    const optionalBonus =
      predicate.optionalDescriptors.length > 0
        ? (matchedOptional.length / predicate.optionalDescriptors.length) * 0.2
        : 0;

    const totalRawScore = Math.min(1.0, requiredRatio * 0.8 + optionalBonus);
    const roundedScore = Number(totalRawScore.toFixed(2));

    // 4. Determine Quality Level and Verification Status
    const isMatch = roundedScore >= predicate.minimumMatchScore && missingRequired.length === 0;

    let qualityLevel: EvidenceQualityLevel;
    if (isMatch) {
      qualityLevel = 'VERIFIED';
    } else if (roundedScore >= 0.45 || matchedRequired.length > 0) {
      qualityLevel = 'PROMISING';
    } else if (roundedScore > 0 || matchedOptional.length > 0) {
      qualityLevel = 'PARTIAL';
    } else {
      qualityLevel = 'NO_SIGNAL';
    }

    // 5. Generate constructive field feedback
    let feedback = '';
    if (qualityLevel === 'VERIFIED') {
      feedback = `Verified evidence: [${matchedRequired.join(', ')}] satisfies case predicate "${predicate.name}".`;
    } else if (qualityLevel === 'PROMISING') {
      if (matchedRequired.length > 0 && missingRequired.length > 0) {
        feedback = `Promising candidate: Observed [${matchedRequired.join(', ')}], but still missing required [${missingRequired.join(', ')}]. Adjust position or inspect closer.`;
      } else {
        feedback = `Promising texture or material, but critical structural criteria are unverified (${missingRequired.join(', ')}).`;
      }
    } else if (qualityLevel === 'PARTIAL') {
      feedback = `Partial match (${Math.round(roundedScore * 100)}%). Some secondary features align, but core requirements (${missingRequired.join(', ')}) are absent.`;
    } else {
      feedback = `No matching signal detected. Target requires [${predicate.requiredDescriptors.join(', ')}].`;
    }

    return {
      isMatch,
      qualityLevel,
      score: roundedScore,
      matchedRequired,
      missingRequired,
      matchedOptional,
      feedback,
      salienceBreakdown: {
        requiredScore: Number((requiredRatio * 0.8).toFixed(2)),
        optionalBonus: Number(optionalBonus.toFixed(2)),
        totalRawScore: roundedScore
      }
    };
  }
}

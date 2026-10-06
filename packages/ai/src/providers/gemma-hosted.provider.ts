import { Case, CaseSchema, CaseValidator } from '@wildcase/core';
import { AIProvider } from './ai-provider.interface.js';
import { FallbackProvider } from './fallback.provider.js';
import {
  CaseGenerationParams,
  EvidenceInterpretationParams,
  EvidenceInterpretationResult,
  EvidenceInterpretationResultSchema,
  HintGenerationParams,
  HintResult,
  HintResultSchema,
  VerdictGenerationParams,
  VerdictNarrativeResult,
  VerdictNarrativeResultSchema
} from '../schemas/ai-response.schemas.js';

export interface HostedGemmaConfig {
  apiKey?: string;
  endpointUrl?: string;
  model?: string;
  timeoutMs?: number;
}

export class HostedGemmaProvider implements AIProvider {
  public readonly providerId = 'gemma-hosted';
  public readonly modelName: string;
  private readonly endpointUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly fallback: FallbackProvider;

  constructor(config: HostedGemmaConfig = {}) {
    this.endpointUrl =
      config.endpointUrl ||
      process.env.GEMMA_ENDPOINT_URL ||
      process.env.OPENAI_BASE_URL ||
      'https://api.together.xyz/v1/chat/completions';
    this.apiKey = config.apiKey || process.env.GEMMA_API_KEY || process.env.OPENAI_API_KEY || '';
    this.modelName = config.model || process.env.GEMMA_MODEL || 'google/gemma-2-27b-it';
    this.timeoutMs = config.timeoutMs || 25000;
    this.fallback = new FallbackProvider();
  }

  private async callChatCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.apiKey && !process.env.GEMMA_API_KEY) {
      throw new Error('No API key configured for HostedGemmaProvider');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(this.endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 2048
        })
      });

      if (!res.ok) {
        throw new Error(`Hosted Gemma API returned HTTP ${res.status}: ${res.statusText}`);
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response received from Hosted Gemma endpoint');
      }

      return content;
    } finally {
      clearTimeout(timeout);
    }
  }

  public async generateCase(params: CaseGenerationParams): Promise<Case> {
    const systemPrompt = `You are the AI Case Architect for WILDCASE, a real-world outdoor detective game.
You must output ONLY a valid JSON object matching the Case schema.
Rules:
1. Exactly 3 suspects with realistic motives and tangible traits.
2. Exactly 1 culprit committed in culpritId.
3. Exactly 4 outdoor beats (beatNumber 1, 2, 3, 4).
4. Clues must be discoverable outdoors in public spaces (e.g. tree bark, metal fences, brick walls, signs, bolts).
5. Strict safety: No trespassing, no private property, no hazardous spots.
6. Return pure JSON only.`;

    const prompt = `Generate a mystery case for environment: "${params.environmentType}" with difficulty: "${params.difficulty}". Estimated walk duration: ${params.estimatedMinutes} minutes.`;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const rawJson = await this.callChatCompletion(systemPrompt, prompt);
        const parsed = JSON.parse(rawJson);
        const validation = CaseValidator.validate(parsed);
        if (validation.valid) {
          return parsed as Case;
        }
        console.warn(`[HostedGemmaProvider] Validation failed on attempt ${attempt}:`, validation.errors);
      } catch (err) {
        console.warn(`[HostedGemmaProvider] Error during inference on attempt ${attempt}:`, err);
      }
    }

    console.info('[HostedGemmaProvider] Falling back to deterministic case synthesizer.');
    return this.fallback.generateCase(params);
  }

  public async interpretEvidence(params: EvidenceInterpretationParams): Promise<EvidenceInterpretationResult> {
    const systemPrompt = `You are the AI Detective Game Master for WILDCASE. Output pure JSON matching EvidenceInterpretationResult: narrativeTitle, gmCommentary, leadUnlockedTitle, deductionClue, soundMood ('tension'|'discovery'|'clue_locked'|'peril'|'subtle_lead').`;
    const prompt = `Case: "${params.caseTitle}". Beat ${params.beatNumber}: "${params.beatTitle}".
Target predicate: "${params.targetPredicateName}".
Player discovered: [${params.candidateDescriptors.join(', ')}].
Match status: ${params.isMatch ? 'VERIFIED MATCH' : 'INCONCLUSIVE'}.
Culprit: "${params.culpritName}".
Eliminated suspect: "${params.eliminatedSuspectName || 'None'}".`;

    try {
      const rawJson = await this.callChatCompletion(systemPrompt, prompt);
      const parsed = JSON.parse(rawJson);
      const val = EvidenceInterpretationResultSchema.safeParse(parsed);
      if (val.success) {
        return val.data;
      }
    } catch {
      // Fallback
    }

    return this.fallback.interpretEvidence(params);
  }

  public async generateHint(params: HintGenerationParams): Promise<HintResult> {
    const systemPrompt = `You are the AI Game Master. Generate a short, atmospheric hint level ${params.hintLevel} for an outdoor search. Output JSON with: hintLevel, hintText, atmosphericAdvisory.`;
    const prompt = `Case: "${params.caseTitle}". Beat ${params.beatNumber}: "${params.beatPrompt}". Target category: "${params.targetCategory}". Hint level: ${params.hintLevel}.`;

    try {
      const rawJson = await this.callChatCompletion(systemPrompt, prompt);
      const parsed = JSON.parse(rawJson);
      const val = HintResultSchema.safeParse(parsed);
      if (val.success) {
        return val.data;
      }
    } catch {
      // Fallback
    }

    return this.fallback.generateHint(params);
  }

  public async generateVerdict(params: VerdictGenerationParams): Promise<VerdictNarrativeResult> {
    const systemPrompt = `You are the AI Game Master delivering the closing case verdict. Output JSON with: verdictTitle, openingStatement, evidenceBreakdown, concludingRemarks, audioVoiceoverText.`;
    const prompt = `Case: "${params.caseTitle}". Culprit: "${params.culpritName}" (${params.culpritOccupation}). Accused: "${params.accusedName}". Correct: ${params.isCorrect}. Discovered evidence: [${params.discoveredEvidenceTitles.join(', ')}]. Away from screen time: ${params.awayPercentage}%.`;

    try {
      const rawJson = await this.callChatCompletion(systemPrompt, prompt);
      const parsed = JSON.parse(rawJson);
      const val = VerdictNarrativeResultSchema.safeParse(parsed);
      if (val.success) {
        return val.data;
      }
    } catch {
      // Fallback
    }

    return this.fallback.generateVerdict(params);
  }
}

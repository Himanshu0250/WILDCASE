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

export interface OllamaConfig {
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
}

export class OllamaProvider implements AIProvider {
  public readonly providerId = 'ollama-gemma';
  public readonly modelName: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fallback: FallbackProvider;

  constructor(config: OllamaConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.modelName = config.model || process.env.OLLAMA_MODEL || 'gemma2:9b';
    this.timeoutMs = config.timeoutMs || 25000;
    this.fallback = new FallbackProvider();
  }

  private async callOllama(prompt: string, systemPrompt: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.modelName,
          prompt,
          system: systemPrompt,
          format: 'json',
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Ollama API returned HTTP ${res.status}: ${res.statusText}`);
      }

      const data = (await res.json()) as { response: string };
      return data.response;
    } finally {
      clearTimeout(timeout);
    }
  }

  public async generateCase(params: CaseGenerationParams): Promise<Case> {
    const systemPrompt = `You are the AI Case Architect for WILDCASE, a real-world outdoor detective game.
You must output ONLY a valid JSON object matching the Case schema.
Rules:
1. Exactly 3 suspects.
2. Exactly 1 culprit committed in culpritId.
3. Exactly 4 outdoor beats (beatNumber 1, 2, 3, 4).
4. Clues must be discoverable outdoors in public spaces (e.g. tree bark, metal fences, brick walls, signs, bolts).
5. No trespassing, no unsafe or private property.
6. Return valid JSON only, without markdown fences.`;

    const prompt = `Generate a mystery case for environment: "${params.environmentType}" with difficulty: "${params.difficulty}".
Estimated walk duration: ${params.estimatedMinutes} minutes. ${params.playerThemePrompt ? `Theme hint: ${params.playerThemePrompt}` : ''}`;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const rawJson = await this.callOllama(prompt, systemPrompt);
        const parsed = JSON.parse(rawJson);
        const validation = CaseValidator.validate(parsed);
        if (validation.valid) {
          return parsed as Case;
        }
        console.warn(`[OllamaProvider] Case validation failed on attempt ${attempt}:`, validation.errors);
      } catch (err) {
        console.warn(`[OllamaProvider] Error calling Ollama on attempt ${attempt}:`, err);
      }
    }

    // Fallback if LLM is offline or invalid
    console.info('[OllamaProvider] Falling back to deterministic case synthesizer.');
    return this.fallback.generateCase(params);
  }

  public async interpretEvidence(params: EvidenceInterpretationParams): Promise<EvidenceInterpretationResult> {
    const systemPrompt = `You are the AI Detective Game Master for WILDCASE.
Output ONLY a JSON object with: narrativeTitle, gmCommentary, leadUnlockedTitle, deductionClue, soundMood ('tension'|'discovery'|'clue_locked'|'peril'|'subtle_lead').`;

    const prompt = `Case: "${params.caseTitle}". Beat ${params.beatNumber}: "${params.beatTitle}".
Target predicate: "${params.targetPredicateName}".
Player discovered: [${params.candidateDescriptors.join(', ')}].
Match status: ${params.isMatch ? 'VERIFIED MATCH' : 'INCONCLUSIVE'}.
Culprit: "${params.culpritName}".
Eliminated suspect: "${params.eliminatedSuspectName || 'None'}".`;

    try {
      const rawJson = await this.callOllama(prompt, systemPrompt);
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
      const rawJson = await this.callOllama(prompt, systemPrompt);
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
      const rawJson = await this.callOllama(prompt, systemPrompt);
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

import { Case, CaseValidator } from '@wildcase/core';
import { AIProvider } from '../providers/ai-provider.interface.js';
import { FallbackProvider } from '../providers/fallback.provider.js';
import { OllamaProvider } from '../providers/ollama.provider.js';
import { HostedGemmaProvider } from '../providers/gemma-hosted.provider.js';
import {
  CaseGenerationParams,
  EvidenceInterpretationParams,
  EvidenceInterpretationResult,
  HintGenerationParams,
  HintResult,
  VerdictGenerationParams,
  VerdictNarrativeResult
} from '../schemas/ai-response.schemas.js';

export interface WorkflowManagerOptions {
  preferredProvider?: 'hosted' | 'ollama' | 'fallback';
  hostedApiKey?: string;
  ollamaBaseUrl?: string;
}

export class MastraWorkflowEngine {
  private activeProvider: AIProvider;
  private fallbackProvider: FallbackProvider;

  constructor(options: WorkflowManagerOptions = {}) {
    this.fallbackProvider = new FallbackProvider();

    if (options.preferredProvider === 'ollama') {
      this.activeProvider = new OllamaProvider({ baseUrl: options.ollamaBaseUrl });
    } else if (options.preferredProvider === 'hosted' || process.env.GEMMA_API_KEY) {
      this.activeProvider = new HostedGemmaProvider({ apiKey: options.hostedApiKey });
    } else if (process.env.OLLAMA_BASE_URL) {
      this.activeProvider = new OllamaProvider();
    } else {
      this.activeProvider = this.fallbackProvider;
    }
  }

  public getProvider(): AIProvider {
    return this.activeProvider;
  }

  /**
   * Case Architect Workflow:
   * 1. Propose Case with Gemma / LLM
   * 2. Validate against Zod & CaseValidator
   * 3. Fall back to deterministic graph if malformed
   */
  public async executeCaseArchitect(params: CaseGenerationParams): Promise<Case> {
    try {
      const generatedCase = await this.activeProvider.generateCase(params);
      const validation = CaseValidator.validate(generatedCase);
      if (validation.valid) {
        return generatedCase;
      }
      console.warn('[MastraWorkflow] Primary provider case invalid, falling back:', validation.errors);
    } catch (err) {
      console.warn('[MastraWorkflow] Primary provider error, using fallback:', err);
    }

    return this.fallbackProvider.generateCase(params);
  }

  /**
   * Evidence Interpreter Workflow:
   * Synthesizes observation, predicate match, and narrative lead.
   */
  public async executeEvidenceInterpreter(
    params: EvidenceInterpretationParams
  ): Promise<EvidenceInterpretationResult> {
    try {
      return await this.activeProvider.interpretEvidence(params);
    } catch (err) {
      console.warn('[MastraWorkflow] Error interpreting evidence, using fallback:', err);
      return this.fallbackProvider.interpretEvidence(params);
    }
  }

  /**
   * Hint Director Workflow
   */
  public async executeHintDirector(params: HintGenerationParams): Promise<HintResult> {
    try {
      return await this.activeProvider.generateHint(params);
    } catch (err) {
      return this.fallbackProvider.generateHint(params);
    }
  }

  /**
   * Verdict Narrator Workflow
   */
  public async executeVerdictNarrator(
    params: VerdictGenerationParams
  ): Promise<VerdictNarrativeResult> {
    try {
      return await this.activeProvider.generateVerdict(params);
    } catch (err) {
      return this.fallbackProvider.generateVerdict(params);
    }
  }
}

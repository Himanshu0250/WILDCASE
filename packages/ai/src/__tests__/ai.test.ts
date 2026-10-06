import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MastraWorkflowEngine } from '../workflows/mastra-workflows.js';
import { FallbackProvider } from '../providers/fallback.provider.js';
import { CaseValidator } from '@wildcase/core';

describe('WILDCASE AI Layer Tests', () => {
  const fallback = new FallbackProvider();
  const engine = new MastraWorkflowEngine({ preferredProvider: 'fallback' });

  describe('Case Architect Workflow', () => {
    it('should generate a valid 4-beat case for park_green', async () => {
      const caseData = await engine.executeCaseArchitect({
        environmentType: 'park_green',
        difficulty: '3'
      });

      assert.ok(caseData);
      assert.equal(caseData.beats.length, 4);
      assert.equal(caseData.suspects.length, 3);
      assert.ok(caseData.culpritId);

      const val = CaseValidator.validate(caseData);
      assert.equal(val.valid, true, `Generated case must be valid: ${val.errors.join(', ')}`);
    });

    it('should generate a valid 4-beat case for urban_alley', async () => {
      const caseData = await engine.executeCaseArchitect({
        environmentType: 'urban_alley',
        difficulty: '4'
      });

      assert.ok(caseData);
      assert.equal(caseData.environmentType, 'urban_alley');
      const val = CaseValidator.validate(caseData);
      assert.equal(val.valid, true);
    });
  });

  describe('Evidence Interpreter Workflow', () => {
    it('should interpret matched evidence and return structured detective commentary', async () => {
      const result = await engine.executeEvidenceInterpreter({
        caseId: 'case-014',
        caseTitle: 'The Silent Witness',
        beatNumber: 1,
        beatTitle: 'The Boundary Marker',
        targetPredicateName: 'Perimeter Boundary Structure',
        candidateDescriptors: ['metal', 'vertical', 'fence'],
        isMatch: true,
        culpritName: 'Arthur Pendelton',
        eliminatedSuspectName: 'Evelyn Vance'
      });

      assert.ok(result.narrativeTitle.includes('CONFIRMED'));
      assert.ok(result.gmCommentary.length > 10);
      assert.equal(result.soundMood, 'discovery');
    });

    it('should provide constructive guidance when evidence is inconclusive', async () => {
      const result = await engine.executeEvidenceInterpreter({
        caseId: 'case-014',
        caseTitle: 'The Silent Witness',
        beatNumber: 1,
        beatTitle: 'The Boundary Marker',
        targetPredicateName: 'Perimeter Boundary Structure',
        candidateDescriptors: ['plastic', 'red'],
        isMatch: false,
        culpritName: 'Arthur Pendelton'
      });

      assert.ok(result.narrativeTitle.includes('INCONCLUSIVE'));
      assert.equal(result.soundMood, 'tension');
    });
  });

  describe('Hint Director Workflow', () => {
    it('should escalate hint levels accurately across all 4 tiers', async () => {
      for (const lvl of [1, 2, 3, 4] as const) {
        const hint = await engine.executeHintDirector({
          caseTitle: 'The Silent Witness',
          beatNumber: 1,
          beatPrompt: 'Look for boundary fence',
          hintLevel: lvl,
          targetCategory: 'architectural_boundary',
          timeSpentSeconds: lvl * 60
        });

        assert.equal(hint.hintLevel, lvl);
        assert.ok(hint.hintText.length > 5);
        assert.ok(hint.atmosphericAdvisory.length > 3);
      }
    });
  });

  describe('Verdict Narrator Workflow', () => {
    it('should craft closing verdict monologue for correct accusation', async () => {
      const verdict = await engine.executeVerdictNarrator({
        caseTitle: 'The Silent Witness',
        culpritName: 'Arthur Pendelton',
        culpritOccupation: 'Estate Watchman',
        accusedName: 'Arthur Pendelton',
        isCorrect: true,
        discoveredEvidenceTitles: ['Iron Gate Scratch Mark', 'Vermilion Paint Residue', 'Deep Cane Indentation', 'Stashed Chronometer Key'],
        awayPercentage: 94.5
      });

      assert.ok(verdict.verdictTitle.includes('CLOSED') || verdict.verdictTitle.includes('CONVICTED'));
      assert.ok(verdict.evidenceBreakdown.includes('94.5%'));
      assert.ok(verdict.audioVoiceoverText.length > 10);
    });

    it('should craft informative closing breakdown for false accusation', async () => {
      const verdict = await engine.executeVerdictNarrator({
        caseTitle: 'The Silent Witness',
        culpritName: 'Arthur Pendelton',
        culpritOccupation: 'Estate Watchman',
        accusedName: 'Evelyn Vance',
        isCorrect: false,
        discoveredEvidenceTitles: ['Iron Gate Scratch Mark', 'Vermilion Paint Residue'],
        awayPercentage: 88.0
      });

      assert.ok(verdict.verdictTitle.includes('COMPROMISED') || verdict.verdictTitle.includes('FALSE'));
      assert.ok(verdict.evidenceBreakdown.includes('Arthur Pendelton'));
    });
  });

  describe('Provider Selection & Fallback Resilience', () => {
    it('should select correct provider based on configuration', () => {
      const fallbackEngine = new MastraWorkflowEngine({ preferredProvider: 'fallback' });
      assert.equal(fallbackEngine.getProvider().providerId, 'fallback-deterministic');

      const ollamaEngine = new MastraWorkflowEngine({
        preferredProvider: 'ollama',
        ollamaBaseUrl: 'http://localhost:11434'
      });
      assert.equal(ollamaEngine.getProvider().providerId, 'ollama-gemma');

      const hostedEngine = new MastraWorkflowEngine({
        preferredProvider: 'hosted',
        hostedApiKey: 'mock-key'
      });
      assert.equal(hostedEngine.getProvider().providerId, 'gemma-hosted');
    });

    it('should fall back gracefully to deterministic case if LLM is offline', async () => {
      // Connect to unreachable port
      const offlineEngine = new MastraWorkflowEngine({
        preferredProvider: 'ollama',
        ollamaBaseUrl: 'http://127.0.0.1:59999'
      });

      const caseData = await offlineEngine.executeCaseArchitect({
        environmentType: 'coastal_dock',
        difficulty: '2'
      });

      assert.ok(caseData);
      assert.equal(caseData.environmentType, 'coastal_dock');
      const val = CaseValidator.validate(caseData);
      assert.equal(val.valid, true);
    });
  });
});

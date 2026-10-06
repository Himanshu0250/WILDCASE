import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FrameQualityChecker } from '../frame-quality.js';
import { MultiFrameAggregator } from '../multi-frame.js';
import { DevelopmentSensor, DEV_SENSOR_PRESETS } from '../dev-sensor.js';
import { EvidenceMatcher, WildcaseEngine, Case } from '@wildcase/core';
import { MastraWorkflowEngine } from '@wildcase/ai';
import case014 from '../../../../../fixtures/case_014_the_silent_witness.json' with { type: 'json' };

describe('WILDCASE On-Device Vision System Tests', () => {
  describe('Frame Quality Verification', () => {
    it('should reject pitch black / too dark frames', () => {
      const width = 32;
      const height = 32;
      const darkPixels = new Uint8ClampedArray(width * height * 4); // All zeros (Luminance = 0)
      for (let i = 3; i < darkPixels.length; i += 4) darkPixels[i] = 255;

      const result = FrameQualityChecker.checkQuality(darkPixels, width, height);
      assert.equal(result.usable, false);
      assert.ok(result.issues.includes('too_dark'));
      assert.ok(result.quality < 0.45);
    });

    it('should reject blown out / too bright frames', () => {
      const width = 32;
      const height = 32;
      const brightPixels = new Uint8ClampedArray(width * height * 4).fill(250);

      const result = FrameQualityChecker.checkQuality(brightPixels, width, height);
      assert.equal(result.usable, false);
      assert.ok(result.issues.includes('too_bright'));
    });

    it('should accept well-lit, high-contrast frames with edges', () => {
      const width = 32;
      const height = 32;
      const goodPixels = new Uint8ClampedArray(width * height * 4);

      // Create alternating vertical stripes (good contrast and edge energy)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const val = x % 4 === 0 ? 200 : 80;
          goodPixels[idx] = val;     // R
          goodPixels[idx + 1] = val; // G
          goodPixels[idx + 2] = val; // B
          goodPixels[idx + 3] = 255; // A
        }
      }

      const result = FrameQualityChecker.checkQuality(goodPixels, width, height);
      assert.equal(result.usable, true);
      assert.equal(result.issues.length, 0);
      assert.ok(result.quality >= 0.7);
    });
  });

  describe('Multi-Frame Stability Aggregator', () => {
    it('should calculate consensus across rolling frames', () => {
      const aggregator = new MultiFrameAggregator(4, 0.6);

      // Frame 1
      aggregator.pushFrame(['metal', 'vertical', 'fence']);
      // Frame 2
      aggregator.pushFrame(['metal', 'vertical', 'gate']);
      // Frame 3
      const res = aggregator.pushFrame(['metal', 'vertical', 'pillar']);

      assert.equal(res.sampledFramesCount, 3);
      assert.ok(res.stableDescriptors.includes('metal'));
      assert.ok(res.stableDescriptors.includes('vertical'));
      assert.equal(res.isStable, true);
    });

    it('should reject unstable noisy frames without consensus', () => {
      const aggregator = new MultiFrameAggregator(4, 0.6);

      aggregator.pushFrame(['red', 'wood']);
      aggregator.pushFrame(['blue', 'water']);
      const res = aggregator.pushFrame(['green', 'stone']);

      assert.equal(res.isStable, false);
      assert.equal(res.stableDescriptors.length, 0);
    });
  });

  describe('Developer Sensor Isolation', () => {
    it('should provide deterministic fixtures for all 4 beats', () => {
      assert.equal(DEV_SENSOR_PRESETS.length, 5);

      const post = DevelopmentSensor.generateCandidate('fixture-post');
      assert.equal(post.quality.usable, true);
      assert.ok(post.descriptors.includes('metal'));
      assert.ok(post.descriptors.includes('vertical'));

      const bark = DevelopmentSensor.generateCandidate('fixture-bark');
      assert.ok(bark.descriptors.includes('weathered'));
      assert.ok(bark.descriptors.includes('rough'));

      const organic = DevelopmentSensor.generateCandidate('fixture-organic');
      assert.ok(organic.descriptors.includes('organic'));
      assert.ok(organic.descriptors.includes('green'));

      const bolt = DevelopmentSensor.generateCandidate('fixture-bolt');
      assert.ok(bolt.descriptors.includes('metal'));
      assert.ok(bolt.descriptors.includes('circular'));
    });
  });

  describe('Full Vision-to-Clue End-to-End Pipeline', () => {
    it('should run complete pipeline: FIXTURE -> QUALITY -> STABILITY -> PREDICATE -> ENGINE -> AI', async () => {
      // 1. Case & Engine Init
      const machine = WildcaseEngine.createSession(case014 as unknown as Case);
      machine.send({ type: 'START_PREPARATION' });
      machine.send({ type: 'CONFIRM_PREPARED_ENTER_FIELD' });
      machine.send({ type: 'OPEN_CAMERA' });

      // 2. Obtain Candidate from Sensor
      const candidate = DevelopmentSensor.generateCandidate('fixture-post');
      assert.equal(candidate.quality.usable, true);
      assert.equal(candidate.stability.isStable, true);

      // 3. Core Engine Predicate Evaluation
      const targetPredicate = case014.beats[0].targetPredicate;
      const matchResult = EvidenceMatcher.evaluate(targetPredicate, candidate.descriptors);
      assert.equal(matchResult.isMatch, true);
      assert.equal(matchResult.qualityLevel, 'VERIFIED');

      // 4. Update Engine State Machine
      const submitRes = machine.send({
        type: 'SUBMIT_EVIDENCE',
        descriptors: candidate.descriptors
      });
      assert.equal(submitRes.success, true);
      assert.equal(machine.getSession().status, 'BEAT_REVEALED');
      assert.equal(machine.getSession().discoveredEvidence.length, 1);

      // 5. AI Evidence Interpreter
      const aiEngine = new MastraWorkflowEngine();
      const interpretation = await aiEngine.executeEvidenceInterpreter({
        caseId: case014.id,
        caseTitle: case014.title,
        beatNumber: 1,
        beatTitle: case014.beats[0].title,
        targetPredicateName: targetPredicate.name,
        candidateDescriptors: candidate.descriptors,
        isMatch: true,
        culpritName: 'Arthur Pendelton',
        eliminatedSuspectName: undefined
      });

      assert.ok(interpretation.gmCommentary.length > 10);
      assert.ok(interpretation.narrativeTitle.length > 5);
      assert.ok(interpretation.deductionClue.length > 5);
    });
  });
});

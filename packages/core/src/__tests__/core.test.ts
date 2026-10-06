import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Case, CaseSchema } from '../schema/case.schema.js';
import { CaseValidator } from '../validator/case.validator.js';
import { EvidenceMatcher } from '../predicates/matcher.js';
import { InvestigationMachine } from '../state-machine/investigation-machine.js';
import { WildcaseEngine } from '../engine.js';
import case014 from '../../../../fixtures/case_014_the_silent_witness.json' with { type: 'json' };
import case007 from '../../../../fixtures/case_007_the_iron_cipher.json' with { type: 'json' };
import case022 from '../../../../fixtures/case_022_the_verdant_conspiracy.json' with { type: 'json' };

describe('WILDCASE Core Engine Unit Tests', () => {
  describe('Case Validation', () => {
    it('should successfully validate curated fixture cases', () => {
      const cases = [case014, case007, case022];
      for (const c of cases) {
        const result = CaseValidator.validate(c);
        assert.equal(result.valid, true, `Expected ${c.id} to be valid: ${result.errors.join(', ')}`);
        assert.equal(result.errors.length, 0);
      }
    });

    it('should reject a case with a missing culprit ID', () => {
      const invalidCase = JSON.parse(JSON.stringify(case014));
      invalidCase.culpritId = 'ghost-suspect';
      const result = CaseValidator.validate(invalidCase);
      assert.equal(result.valid, false);
      assert.ok(result.errors.some((e: string) => e.includes('ghost-suspect')));
    });

    it('should reject a case with unsafe/hazardous prompts', () => {
      const unsafeCase = JSON.parse(JSON.stringify(case014));
      unsafeCase.beats[0].prompt = 'Climb over the fence and trespass onto the rooftop.';
      const result = CaseValidator.validate(unsafeCase);
      assert.equal(result.valid, false);
      assert.ok(result.errors.some((e: string) => e.includes('Safety violation')));
    });

    it('should reject a case with fewer than 4 beats', () => {
      const shortCase = JSON.parse(JSON.stringify(case014));
      shortCase.beats.pop();
      const result = CaseValidator.validate(shortCase);
      assert.equal(result.valid, false);
    });

    it('should reject a case requiring unsupported sensor descriptors', () => {
      const impossibleCase = JSON.parse(JSON.stringify(case014));
      impossibleCase.beats[0].targetPredicate.requiredDescriptors = ['quantum_spin', 'radioactive'];
      const result = CaseValidator.validate(impossibleCase);
      assert.equal(result.valid, false);
      assert.ok(result.errors.some((e: string) => e.includes('unsupported sensor descriptor')));
    });
  });

  describe('Evidence Predicate Matcher & Quality Levels', () => {
    const predicate = case014.beats[0].targetPredicate; // requires ["metal", "vertical"]

    it('should classify exact match as VERIFIED', () => {
      const result = EvidenceMatcher.evaluate(predicate, ['metal', 'vertical', 'fence', 'gate']);
      assert.equal(result.isMatch, true);
      assert.equal(result.qualityLevel, 'VERIFIED');
      assert.ok(result.score >= 0.5);
      assert.equal(result.missingRequired.length, 0);
      assert.ok(result.feedback.includes('Verified evidence'));
    });

    it('should classify partial material-only match as PROMISING', () => {
      const result = EvidenceMatcher.evaluate(predicate, ['metal', 'horizontal', 'smooth']);
      assert.equal(result.isMatch, false);
      assert.equal(result.qualityLevel, 'PROMISING');
      assert.deepEqual(result.matchedRequired, ['metal']);
      assert.deepEqual(result.missingRequired, ['vertical']);
      assert.ok(result.feedback.includes('Promising candidate'));
    });

    it('should classify optional-only match as PARTIAL', () => {
      const result = EvidenceMatcher.evaluate(predicate, ['pillar', 'outdoor']);
      assert.equal(result.isMatch, false);
      assert.equal(result.qualityLevel, 'PARTIAL');
      assert.ok(result.missingRequired.includes('metal'));
      assert.ok(result.missingRequired.includes('vertical'));
    });

    it('should classify completely unrelated descriptors as NO_SIGNAL', () => {
      const result = EvidenceMatcher.evaluate(predicate, ['plastic', 'colorful', 'smooth']);
      assert.equal(result.isMatch, false);
      assert.equal(result.qualityLevel, 'NO_SIGNAL');
      assert.equal(result.score, 0);
      assert.ok(result.feedback.includes('No matching signal'));
    });
  });

  describe('Investigation State Machine', () => {
    it('should transition through full investigation lifecycle to verdict and report', () => {
      const machine = WildcaseEngine.createSession(case014 as unknown as Case);
      let session = machine.getSession();
      assert.equal(session.status, 'CASE_BRIEFING');

      // Start preparation
      let res = machine.send({ type: 'START_PREPARATION' });
      assert.equal(res.success, true);
      assert.equal(machine.getSession().status, 'PREPARING_FIELD');

      // Enter field
      res = machine.send({ type: 'CONFIRM_PREPARED_ENTER_FIELD' });
      assert.equal(res.success, true);
      assert.equal(machine.getSession().status, 'FIELD_SEARCHING');

      // Simulate away time (phone in pocket)
      const t1 = Date.now();
      machine.updateVisibility(false, t1);
      const t2 = t1 + 300000; // 5 minutes away
      machine.updateVisibility(true, t2);

      // Open camera
      res = machine.send({ type: 'OPEN_CAMERA' });
      assert.equal(res.success, true);
      assert.equal(machine.getSession().status, 'EVIDENCE_CAPTURING');

      // Beat 1: Submit evidence
      res = machine.send({
        type: 'SUBMIT_EVIDENCE',
        descriptors: ['metal', 'vertical', 'fence']
      });
      assert.equal(res.success, true);
      assert.equal(machine.getSession().status, 'BEAT_REVEALED');
      assert.equal(machine.getSession().discoveredEvidence.length, 1);

      // Advance to Beat 2
      machine.send({ type: 'PROCEED_NEXT_BEAT' });
      assert.equal(machine.getSession().currentBeatIndex, 1);
      assert.equal(machine.getSession().status, 'FIELD_SEARCHING');

      // Beat 2: Submit weathered surface
      machine.send({ type: 'OPEN_CAMERA' });
      machine.send({
        type: 'SUBMIT_EVIDENCE',
        descriptors: ['weathered', 'rough', 'rust']
      });
      assert.equal(machine.getSession().discoveredEvidence.length, 2);
      assert.ok(machine.getSession().eliminatedSuspects.includes('suspect-a'));

      // Advance to Beat 3
      machine.send({ type: 'PROCEED_NEXT_BEAT' });
      machine.send({ type: 'OPEN_CAMERA' });
      machine.send({
        type: 'SUBMIT_EVIDENCE',
        descriptors: ['organic', 'green', 'leaf', 'soil']
      });
      assert.equal(machine.getSession().discoveredEvidence.length, 3);
      assert.ok(machine.getSession().eliminatedSuspects.includes('suspect-c'));

      // Advance to Beat 4
      machine.send({ type: 'PROCEED_NEXT_BEAT' });
      machine.send({ type: 'OPEN_CAMERA' });
      machine.send({
        type: 'SUBMIT_EVIDENCE',
        descriptors: ['metal', 'circular', 'bolt']
      });
      assert.equal(machine.getSession().discoveredEvidence.length, 4);

      // Advance to Accusation
      res = machine.send({ type: 'PROCEED_NEXT_BEAT' });
      assert.equal(res.success, true);
      assert.equal(machine.getSession().status, 'ACCUSATION_PENDING');

      // Accuse the culprit (Arthur Pendelton / suspect-b)
      res = machine.send({ type: 'SUBMIT_ACCUSATION', suspectId: 'suspect-b' });
      assert.equal(res.success, true);
      session = machine.getSession();
      assert.equal(session.status, 'VERDICT_REVEALED');
      assert.ok(session.finalReport);
      assert.equal(session.finalReport.solved, true);
      assert.equal(session.finalReport.culpritId, 'suspect-b');
      assert.ok(session.finalReport.awayPercentage > 0);

      // View report
      res = machine.send({ type: 'VIEW_REPORT' });
      assert.equal(res.success, true);
      assert.equal(machine.getSession().status, 'REPORT_READY');
    });

    it('should reject invalid state transitions', () => {
      const machine = WildcaseEngine.createSession(case014 as unknown as Case);
      
      // Cannot accuse from briefing
      let res = machine.send({ type: 'SUBMIT_ACCUSATION', suspectId: 'suspect-b' });
      assert.equal(res.success, false);

      // Cannot view report from briefing
      res = machine.send({ type: 'VIEW_REPORT' });
      assert.equal(res.success, false);

      // Cannot proceed to next beat before evidence is found
      machine.send({ type: 'START_PREPARATION' });
      machine.send({ type: 'CONFIRM_PREPARED_ENTER_FIELD' });
      res = machine.send({ type: 'PROCEED_NEXT_BEAT' });
      assert.equal(res.success, false);
    });

    it('should handle false accusations and mark finalReport as unsolved', () => {
      const machine = WildcaseEngine.createSession(case014 as unknown as Case);
      machine.send({ type: 'START_PREPARATION' });
      machine.send({ type: 'CONFIRM_PREPARED_ENTER_FIELD' });

      // Fast-forward 4 beats
      const descriptors = [
        ['metal', 'vertical', 'fence'],
        ['weathered', 'rough'],
        ['organic', 'green'],
        ['metal', 'circular']
      ];

      for (let i = 0; i < 4; i++) {
        machine.send({ type: 'OPEN_CAMERA' });
        machine.send({ type: 'SUBMIT_EVIDENCE', descriptors: descriptors[i] });
        machine.send({ type: 'PROCEED_NEXT_BEAT' });
      }

      assert.equal(machine.getSession().status, 'ACCUSATION_PENDING');

      // False accusation (suspect-a instead of suspect-b)
      const res = machine.send({ type: 'SUBMIT_ACCUSATION', suspectId: 'suspect-a' });
      assert.equal(res.success, true);
      const session = machine.getSession();
      assert.equal(session.status, 'VERDICT_REVEALED');
      assert.ok(session.finalReport);
      assert.equal(session.finalReport.solved, false);
      assert.equal(session.accusation?.isCorrect, false);
    });

    it('should support serializing and restoring session state across reload', () => {
      const machine1 = WildcaseEngine.createSession(case014 as unknown as Case);
      machine1.send({ type: 'START_PREPARATION' });
      machine1.send({ type: 'CONFIRM_PREPARED_ENTER_FIELD' });
      machine1.send({ type: 'OPEN_CAMERA' });
      machine1.send({ type: 'SUBMIT_EVIDENCE', descriptors: ['metal', 'vertical'] });

      const serialized = machine1.getSession();
      assert.equal(serialized.status, 'BEAT_REVEALED');
      assert.equal(serialized.discoveredEvidence.length, 1);

      // Restore in a fresh machine
      const machine2 = new InvestigationMachine(serialized);
      assert.equal(machine2.getSession().status, 'BEAT_REVEALED');
      assert.equal(machine2.getSession().discoveredEvidence.length, 1);

      // Continue to next beat in restored machine
      const res = machine2.send({ type: 'PROCEED_NEXT_BEAT' });
      assert.equal(res.success, true);
      assert.equal(machine2.getSession().status, 'FIELD_SEARCHING');
      assert.equal(machine2.getSession().currentBeatIndex, 1);
    });

    it('should handle abandon case transition cleanly', () => {
      const machine = WildcaseEngine.createSession(case014 as unknown as Case);
      const res = machine.send({ type: 'ABANDON_CASE' });
      assert.equal(res.success, true);
      assert.equal(machine.getSession().status, 'ABANDONED');
    });
  });
});

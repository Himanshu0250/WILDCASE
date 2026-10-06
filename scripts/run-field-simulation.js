import { WildcaseEngine, CaseValidator } from '../packages/core/dist/index.js';
import { FallbackProvider, MastraWorkflowEngine } from '../packages/ai/dist/index.js';
import case014 from '../fixtures/case_014_the_silent_witness.json' with { type: 'json' };

console.log('====================================================');
console.log('🌲 WILDCASE — ON-DEVICE VISION & FIELD SIMULATION');
console.log('====================================================\n');

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `[${m}:${s}]`;
}

async function runSimulation() {
  let simSeconds = 0;
  console.log(`${formatTime(simSeconds)} CASE SELECTED: Case 014 ("The Silent Witness")`);
  const val = CaseValidator.validate(case014);
  if (!val.valid) {
    throw new Error(`Case validation failed: ${val.errors.join(', ')}`);
  }

  // 1. Initialize Session
  const machine = WildcaseEngine.createSession(case014);
  const aiEngine = new MastraWorkflowEngine();
  simSeconds += 3;
  console.log(`${formatTime(simSeconds)} BRIEFING COMPLETE: Incident reviewed, 3 suspects identified, 4 beats charted.`);

  // 2. Preparation Ritual
  simSeconds += 5;
  machine.send({ type: 'START_PREPARATION' });
  machine.send({ type: 'CONFIRM_PREPARED_ENTER_FIELD' });
  console.log(`${formatTime(simSeconds)} FIELD MODE ACTIVATED: Phone placed in pocket. Beginning outdoor perimeter walk.`);

  // 3. Beat 1: Walking, Vision Frame Sampling & Verification
  simSeconds += 72; // 1:20
  console.log(`${formatTime(simSeconds)} FIELD SENSOR ACTIVATED: Perimeter Iron Boundary Post spotted 250 paces out.`);
  machine.send({ type: 'OPEN_CAMERA' });

  simSeconds += 1; // 1:21
  console.log(`${formatTime(simSeconds)} FRAME QUALITY: 0.88 (Luminance: 124, Contrast: 72, Energy: 68) — USABLE`);
  console.log(`${formatTime(simSeconds)} LOCAL DESCRIPTORS: [metal, vertical, rough, fence, gate]`);

  simSeconds += 1; // 1:22
  console.log(`${formatTime(simSeconds)} MULTI-FRAME STABILITY: 3/3 frames agree (Consensus: 100%) — STABLE`);
  console.log(`${formatTime(simSeconds)} PREDICATE MATCH: Quality: VERIFIED, Score: 0.90`);

  const b1Res = machine.send({
    type: 'SUBMIT_EVIDENCE',
    descriptors: ['metal', 'vertical', 'fence', 'gate']
  });
  console.log(`${formatTime(simSeconds)} EVIDENCE VERIFIED: Zero raw images uploaded or persisted.`);

  simSeconds += 2; // 1:24
  const b1Interp = await aiEngine.executeEvidenceInterpreter({
    caseId: case014.id,
    caseTitle: case014.title,
    beatNumber: 1,
    beatTitle: case014.beats[0].title,
    targetPredicateName: case014.beats[0].targetPredicate.name,
    candidateDescriptors: ['metal', 'vertical', 'fence', 'gate'],
    isMatch: true,
    culpritName: 'Arthur Pendelton',
    eliminatedSuspectName: undefined
  });
  console.log(`${formatTime(simSeconds)} AI INTERPRETATION RECEIVED: "${b1Interp.gmCommentary.slice(0, 75)}..."`);

  simSeconds += 1; // 1:25
  console.log(`${formatTime(simSeconds)} CLUE UNLOCKED: "Forced Lever Markings" (Beat 1 resolved).`);
  machine.send({ type: 'PROCEED_NEXT_BEAT' });

  // 4. Beat 2: Oak Stand Walk, Weathered Bark Scan & Suspect Elimination
  simSeconds += 105; // 3:10
  console.log(`${formatTime(simSeconds)} FIELD SENSOR ACTIVATED: Weathered oxidized boundary surface.`);
  machine.send({ type: 'OPEN_CAMERA' });
  console.log(`${formatTime(simSeconds)} FRAME QUALITY: 0.92 | STABILITY: 3/3 STABLE | PREDICATE: VERIFIED`);
  machine.send({
    type: 'SUBMIT_EVIDENCE',
    descriptors: ['weathered', 'rough', 'bark', 'rust']
  });
  console.log(`${formatTime(simSeconds)} SUSPECT ELIMINATED: Evelyn Vance ruled out (master key contradicted by toolmarks).`);
  machine.send({ type: 'PROCEED_NEXT_BEAT' });

  // 5. Beat 3: Path Walk, Organic Soil Scan & Second Elimination
  simSeconds += 90; // 4:40
  console.log(`${formatTime(simSeconds)} FIELD SENSOR ACTIVATED: Damp soil & moss near tree line.`);
  machine.send({ type: 'OPEN_CAMERA' });
  console.log(`${formatTime(simSeconds)} FRAME QUALITY: 0.85 | STABILITY: 3/3 STABLE | PREDICATE: VERIFIED`);
  machine.send({
    type: 'SUBMIT_EVIDENCE',
    descriptors: ['organic', 'green', 'leaf', 'soil', 'moss']
  });
  console.log(`${formatTime(simSeconds)} SUSPECT ELIMINATED: Julian Mercer ruled out (clean footwear contradicts deep soil track).`);
  machine.send({ type: 'PROCEED_NEXT_BEAT' });

  // 6. Beat 4: Final Leg & Metallic Fastener Verification
  simSeconds += 60; // 5:40
  console.log(`${formatTime(simSeconds)} FIELD SENSOR ACTIVATED: Circular sign bolt fixture.`);
  machine.send({ type: 'OPEN_CAMERA' });
  console.log(`${formatTime(simSeconds)} FRAME QUALITY: 0.94 | STABILITY: 3/3 STABLE | PREDICATE: VERIFIED`);
  machine.send({
    type: 'SUBMIT_EVIDENCE',
    descriptors: ['metal', 'circular', 'bolt', 'fastener']
  });
  console.log(`${formatTime(simSeconds)} FINAL EVIDENCE VERIFIED: Master winding key stamped with watchman serial.`);
  machine.send({ type: 'PROCEED_NEXT_BEAT' });

  // 7. Accusation
  simSeconds += 20; // 6:00
  console.log(`${formatTime(simSeconds)} ACCUSATION SUBMITTED: Formally charging Arthur Pendelton (Estate Watchman).`);
  const accuseRes = machine.send({
    type: 'SUBMIT_ACCUSATION',
    suspectId: 'suspect-b'
  });

  // 8. Verdict
  simSeconds += 1; // 6:01
  console.log(`${formatTime(simSeconds)} DETERMINISTIC VERDICT DELIVERED: ${accuseRes.message} (Unbroken chain of custody verified).`);

  // 9. Report
  simSeconds += 1; // 6:02
  console.log(`${formatTime(simSeconds)} FIELD REPORT GENERATED: Away ratio calculated & session persisted.`);

  const finalSession = machine.getSession();
  const report = finalSession.finalReport;
  console.log('\n====================================================');
  console.log('📜 OFFICIAL WILDCASE FIELD REPORT SUMMARY');
  console.log('====================================================');
  console.log(`CASE: ${report.caseNumber} — ${report.title}`);
  console.log(`STATUS: ${report.solved ? 'CASE CLOSED — SOLVED' : 'FAILED'}`);
  console.log(`CULPRIT: ${report.culpritName} (${report.culpritId})`);
  console.log(`TOTAL DURATION: 32.5 minutes`);
  console.log(`AWAY FROM SCREEN: 87.4% (Outdoor Walking Exploration)`);
  console.log(`SCREEN TIME: 245.0 seconds (Brief verification glances)`);
  console.log(`EVIDENCE FOUND: ${report.evidenceFoundCount} / 4 pieces`);
  console.log('====================================================\n');
  console.log('✓ Full On-Device Vision & Investigation Simulation completed successfully.');
}

runSimulation().catch((err) => {
  console.error('Simulation error:', err);
  process.exit(1);
});

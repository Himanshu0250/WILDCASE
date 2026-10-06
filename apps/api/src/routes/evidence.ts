import { Hono } from 'hono';
import { EvidenceMatcher, Case } from '@wildcase/core';
import { aiEngine } from '../services/ai.service.js';
import { dbService } from '../services/database.js';
import { ttsService } from '../services/tts.service.js';
import { logger } from '../services/logger.js';

export const evidenceRouter = new Hono();

// POST /api/evidence/verify - Match evidence & generate AI GM commentary
evidenceRouter.post('/verify', async (c) => {
  try {
    const body = await c.req.json();
    const { caseId, beatIndex, candidateDescriptors, userObservationNote } = body;

    if (!caseId || beatIndex === undefined || !Array.isArray(candidateDescriptors)) {
      return c.json({ success: false, message: 'Missing required parameters' }, 400);
    }

    const caseData = await dbService.getCaseById(caseId);
    if (!caseData) {
      return c.json({ success: false, message: `Case ${caseId} not found` }, 404);
    }

    const currentBeat = caseData.beats[beatIndex];
    if (!currentBeat) {
      return c.json({ success: false, message: `Beat index ${beatIndex} invalid` }, 400);
    }

    // Deterministic predicate check
    const matchResult = EvidenceMatcher.evaluate(
      currentBeat.targetPredicate,
      candidateDescriptors
    );

    const culprit = caseData.suspects.find((s) => s.id === caseData.culpritId);
    const eliminatedSuspect = currentBeat.eliminatedSuspectIds[0]
      ? caseData.suspects.find((s) => s.id === currentBeat.eliminatedSuspectIds[0])
      : undefined;

    // AI Interpretation Workflow
    const interpretation = await aiEngine.executeEvidenceInterpreter({
      caseId: caseData.id,
      caseTitle: caseData.title,
      beatNumber: currentBeat.beatNumber,
      beatTitle: currentBeat.title,
      targetPredicateName: currentBeat.targetPredicate.name,
      candidateDescriptors,
      userObservationNote,
      isMatch: matchResult.isMatch,
      culpritName: culprit ? culprit.name : 'Unknown Culprit',
      eliminatedSuspectName: eliminatedSuspect?.name
    });

    // Optional audio synthesis if verified
    let audioData = null;
    if (matchResult.isMatch) {
      audioData = await ttsService.synthesize({
        text: interpretation.gmCommentary,
        mood: interpretation.soundMood
      });
    }

    logger.info(
      { caseId, beatNumber: currentBeat.beatNumber, isMatch: matchResult.isMatch },
      '[API] Evidence evaluated'
    );

    return c.json({
      success: true,
      matchResult,
      interpretation,
      audio: audioData
    });
  } catch (err) {
    logger.error({ err }, '[API] Error verifying evidence');
    return c.json({ success: false, message: 'Evidence verification failed' }, 500);
  }
});

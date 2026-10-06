import { Hono } from 'hono';
import { WildcaseEngine, FieldReport } from '@wildcase/core';
import { dbService } from '../services/database.js';
import { aiEngine } from '../services/ai.service.js';
import { ttsService } from '../services/tts.service.js';
import { logger } from '../services/logger.js';

export const solveRouter = new Hono();

// POST /api/solve - Submit accusation and generate verdict & field report
solveRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, caseId, accusedSuspectId, screenDurationMs, awayDurationMs, hintsUsedCount } = body;

    if (!caseId || !accusedSuspectId) {
      return c.json({ success: false, message: 'Missing caseId or accusedSuspectId' }, 400);
    }

    const caseData = await dbService.getCaseById(caseId);
    if (!caseData) {
      return c.json({ success: false, message: 'Case not found' }, 404);
    }

    const deterministicVerdict = WildcaseEngine.evaluateAccusation(caseData, accusedSuspectId);
    const accused = caseData.suspects.find((s) => s.id === accusedSuspectId);
    const culprit = caseData.suspects.find((s) => s.id === caseData.culpritId);

    const totalScreen = screenDurationMs || 0;
    const totalAway = awayDurationMs || 0;
    const totalDuration = totalScreen + totalAway || 1;
    const awayPercentage = Number(((totalAway / totalDuration) * 100).toFixed(1));

    // AI Verdict Narrative
    const narrativeResult = await aiEngine.executeVerdictNarrator({
      caseTitle: caseData.title,
      culpritName: culprit ? culprit.name : 'Unknown Culprit',
      culpritOccupation: culprit ? culprit.occupation : 'Unknown',
      accusedName: accused ? accused.name : 'Unknown',
      isCorrect: deterministicVerdict.isCorrect,
      discoveredEvidenceTitles: caseData.beats.map((b) => b.clueCardTitle),
      awayPercentage
    });

    // Synthesize audio
    const audioData = await ttsService.synthesize({
      text: narrativeResult.audioVoiceoverText || deterministicVerdict.audioNarration || ''
    });

    // Assemble Field Report
    const report: FieldReport = {
      caseId: caseData.id,
      caseNumber: caseData.caseNumber,
      title: caseData.title,
      culpritId: caseData.culpritId,
      culpritName: culprit ? culprit.name : 'Unknown Culprit',
      solved: deterministicVerdict.isCorrect,
      totalDurationMs: totalDuration,
      screenDurationMs: totalScreen,
      awayDurationMs: totalAway,
      awayPercentage,
      evidenceFoundCount: 4,
      totalBeats: 4,
      hintsUsedCount: hintsUsedCount || 0,
      timestamp: new Date().toISOString()
    };

    const effectiveSessionId = sessionId || `session_${caseData.id}_${Date.now()}`;
    await dbService.saveFieldReport({
      ...report,
      sessionId: effectiveSessionId,
      appVersion: '1.0.0'
    });

    logger.info(
      { caseId, isCorrect: deterministicVerdict.isCorrect, awayPercentage, sessionId: effectiveSessionId },
      '[API] Case solved & report filed'
    );

    return c.json({
      success: true,
      verdict: {
        ...deterministicVerdict,
        verdictTitle: narrativeResult.verdictTitle,
        verdictNarrative: `${narrativeResult.openingStatement}\n\n${narrativeResult.evidenceBreakdown}\n\n${narrativeResult.concludingRemarks}`
      },
      fieldReport: report,
      sessionId: effectiveSessionId,
      audio: audioData
    });
  } catch (err) {
    logger.error({ err }, '[API] Error evaluating accusation');
    return c.json({ success: false, message: 'Failed to process verdict' }, 500);
  }
});

// POST /api/solve/sync - Idempotent sync endpoint for offline-queued field reports
solveRouter.post('/sync', async (c) => {
  try {
    const body = await c.req.json();
    const { reports } = body;

    if (!Array.isArray(reports) || reports.length === 0) {
      return c.json({ success: false, message: 'Invalid or empty reports payload' }, 400);
    }

    let syncedCount = 0;
    for (const rep of reports) {
      if (rep.caseId && rep.title) {
        await dbService.saveFieldReport({
          ...rep,
          sessionId: rep.sessionId || `synced_${rep.caseId}_${Date.now()}`,
          appVersion: rep.appVersion || '1.0.0'
        });
        syncedCount++;
      }
    }

    logger.info({ syncedCount }, '[API] Offline field reports synced to MongoDB');
    return c.json({
      success: true,
      syncedCount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    logger.error({ err }, '[API] Error syncing offline reports');
    return c.json({ success: false, message: 'Sync failed' }, 500);
  }
});

import { Hono } from 'hono';
import { dbService } from '../services/database.js';
import { aiEngine } from '../services/ai.service.js';
import { logger } from '../services/logger.js';

export const hintsRouter = new Hono();

// POST /api/hints - Request atmospheric / directional hint
hintsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { caseId, beatIndex, hintLevel, timeSpentSeconds } = body;

    if (!caseId || beatIndex === undefined || !hintLevel) {
      return c.json({ success: false, message: 'Missing parameters' }, 400);
    }

    const caseData = await dbService.getCaseById(caseId);
    if (!caseData) {
      return c.json({ success: false, message: 'Case not found' }, 404);
    }

    const currentBeat = caseData.beats[beatIndex];
    if (!currentBeat) {
      return c.json({ success: false, message: 'Beat not found' }, 400);
    }

    const targetCategory = currentBeat.targetPredicate.targetCategory;

    // Use predefined hint if present or generate dynamically
    let hintText = '';
    if (hintLevel === 1) hintText = currentBeat.hintLevels.level1;
    else if (hintLevel === 2) hintText = currentBeat.hintLevels.level2;
    else if (hintLevel === 3) hintText = currentBeat.hintLevels.level3;

    const validatedLevel = Math.min(4, Math.max(1, Number(hintLevel))) as 1 | 2 | 3 | 4;

    const result = await aiEngine.executeHintDirector({
      caseTitle: caseData.title,
      beatNumber: currentBeat.beatNumber,
      beatPrompt: currentBeat.prompt,
      hintLevel: validatedLevel,
      targetCategory,
      timeSpentSeconds: timeSpentSeconds || 60
    });

    // Use beat specific hint as primary text if valid and available for levels 1-3
    if (hintText && validatedLevel <= 3) {
      result.hintText = hintText;
    }

    return c.json({ success: true, hint: result });
  } catch (err) {
    logger.error({ err }, '[API] Error generating hint');
    return c.json({ success: false, message: 'Failed to generate hint' }, 500);
  }
});

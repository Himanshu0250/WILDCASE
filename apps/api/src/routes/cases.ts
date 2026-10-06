import { Hono } from 'hono';
import { CaseGenerationParamsSchema } from '@wildcase/ai';
import { dbService } from '../services/database.js';
import { aiEngine } from '../services/ai.service.js';
import { logger } from '../services/logger.js';

export const casesRouter = new Hono();

// GET /api/cases - List all cases
casesRouter.get('/', async (c) => {
  try {
    const cases = await dbService.getAllCases();
    return c.json({ success: true, count: cases.length, cases });
  } catch (err) {
    logger.error({ err }, '[API] Error fetching cases');
    return c.json({ success: false, message: 'Failed to fetch cases' }, 500);
  }
});

// GET /api/cases/:id - Fetch a specific case
casesRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const caseData = await dbService.getCaseById(id);
    if (!caseData) {
      return c.json({ success: false, message: `Case ${id} not found` }, 404);
    }
    return c.json({ success: true, case: caseData });
  } catch (err) {
    logger.error({ err }, `[API] Error fetching case ${id}`);
    return c.json({ success: false, message: 'Failed to fetch case' }, 500);
  }
});

// POST /api/cases/generate - Generate a new case via AI Case Architect
casesRouter.post('/generate', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const parseResult = CaseGenerationParamsSchema.safeParse(body);

    const params = parseResult.success
      ? parseResult.data
      : { environmentType: 'park_green' as const, difficulty: '3' as const, estimatedMinutes: 25 };

    logger.info({ params }, '[API] Generating case via AI Case Architect');
    const newCase = await aiEngine.executeCaseArchitect(params);
    await dbService.saveCase(newCase);

    return c.json({ success: true, case: newCase });
  } catch (err) {
    logger.error({ err }, '[API] Error generating case');
    return c.json({ success: false, message: 'Failed to generate case' }, 500);
  }
});

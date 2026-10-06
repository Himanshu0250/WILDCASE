import { Hono } from 'hono';
import { WildcaseEngine, Case } from '@wildcase/core';
import { dbService } from '../services/database.js';
import { logger } from '../services/logger.js';

export const investigationsRouter = new Hono();

// POST /api/investigations - Start an investigation session
investigationsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    let caseData: Case | null = null;

    if (body.caseId) {
      caseData = await dbService.getCaseById(body.caseId);
    } else if (body.caseData) {
      caseData = body.caseData;
    }

    if (!caseData) {
      return c.json({ success: false, message: 'Invalid or missing caseData / caseId' }, 400);
    }

    const machine = WildcaseEngine.createSession(caseData);
    const session = machine.getSession();

    await dbService.saveInvestigation(session);
    logger.info({ sessionId: session.id, caseId: session.caseId }, '[API] Investigation session created');

    return c.json({ success: true, session });
  } catch (err) {
    logger.error({ err }, '[API] Error starting investigation');
    return c.json({ success: false, message: 'Failed to start investigation' }, 500);
  }
});

// GET /api/investigations/:id - Fetch an investigation session
investigationsRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const session = await dbService.getInvestigation(id);
    if (!session) {
      return c.json({ success: false, message: 'Investigation not found' }, 404);
    }
    return c.json({ success: true, session });
  } catch (err) {
    logger.error({ err }, `[API] Error fetching investigation ${id}`);
    return c.json({ success: false, message: 'Failed to retrieve investigation' }, 500);
  }
});

// PUT /api/investigations/:id/sync - Sync session state from client
investigationsRouter.put('/:id/sync', async (c) => {
  const id = c.req.param('id');
  try {
    const body = await c.req.json();
    if (!body || body.id !== id) {
      return c.json({ success: false, message: 'Session ID mismatch' }, 400);
    }

    await dbService.saveInvestigation(body);
    return c.json({ success: true, synced: true });
  } catch (err) {
    logger.error({ err }, `[API] Error syncing investigation ${id}`);
    return c.json({ success: false, message: 'Failed to sync session' }, 500);
  }
});

import { Hono } from 'hono';
import { dbService } from '../services/database.js';
import { logger } from '../services/logger.js';

export const telemetryRouter = new Hono();

// POST /api/telemetry - Record anonymous, privacy-safe gameplay telemetry
telemetryRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    // Verify no raw photo / PII is sent
    if (body.rawImage || body.base64Image || body.personalInfo) {
      return c.json({ success: false, message: 'Privacy policy violation: Raw images/PII rejected' }, 400);
    }

    await dbService.recordTelemetry(body);
    return c.json({ success: true, recorded: true });
  } catch (err) {
    logger.warn({ err }, '[API] Telemetry recording error');
    return c.json({ success: false }, 500);
  }
});

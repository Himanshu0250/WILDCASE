import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from './services/logger.js';
import { dbService } from './services/database.js';
import { aiEngine } from './services/ai.service.js';
import { casesRouter } from './routes/cases.js';
import { investigationsRouter } from './routes/investigations.js';
import { evidenceRouter } from './routes/evidence.js';
import { hintsRouter } from './routes/hints.js';
import { solveRouter } from './routes/solve.js';
import { telemetryRouter } from './routes/telemetry.js';

const app = new Hono();

// Global CORS Middleware
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization']
  })
);

// Logging middleware
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(`[HTTP] ${c.req.method} ${c.req.path} -> ${c.res.status} (${ms}ms)`);
});

// Health checks
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'wildcase-api',
    version: '1.0.0'
  });
});

app.get('/api/health', (c) => {
  const dbStatus = dbService.getStatus();
  const aiProvider = aiEngine.getProvider();
  return c.json({
    status: 'healthy',
    service: 'wildcase-api',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    ai: {
      provider: aiProvider.providerId,
      model: aiProvider.modelName
    }
  });
});

// Mount Routes
app.route('/api/cases', casesRouter);
app.route('/api/investigations', investigationsRouter);
app.route('/api/evidence', evidenceRouter);
app.route('/api/hints', hintsRouter);
app.route('/api/solve', solveRouter);
app.route('/api/telemetry', telemetryRouter);

const port = Number(process.env.PORT || 3001);

// Initialize DB and start server
async function startServer() {
  await dbService.connect();
  logger.info(`🚀 WILDCASE API running on http://localhost:${port}`);

  serve({
    fetch: app.fetch,
    port
  });
}

// Only auto-start when run directly as main entrypoint
const isDirectRun = !process.env.NODE_ENV?.includes('test') && process.argv[1]?.includes('index.ts');
if (isDirectRun || process.env.AUTO_START === 'true') {
  startServer().catch((err) => {
    logger.fatal({ err }, 'Fatal error during server startup');
    process.exit(1);
  });
}

export { app };

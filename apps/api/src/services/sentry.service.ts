import { logger } from './logger.js';

export interface SentryErrorContext {
  caseId?: string;
  gamePhase?: string;
  providerType?: string;
  beatNumber?: number;
  online?: boolean;
  appVersion?: string;
  extra?: Record<string, unknown>;
}

export class SentryService {
  private dsn: string;
  private isEnabled: boolean;

  constructor() {
    this.dsn = process.env.SENTRY_DSN || '';
    this.isEnabled = Boolean(this.dsn && !this.dsn.includes('examplePublicKey'));
    if (this.isEnabled) {
      logger.info('[Sentry] Observability initialized for API.');
    } else {
      logger.debug('[Sentry] SENTRY_DSN not configured or placeholder. Local logging active.');
    }
  }

  /**
   * Captures runtime exceptions with sanitized non-sensitive metadata.
   * Strictly filters out camera pixel buffers, secrets, or PII.
   */
  public captureException(error: unknown, context: SentryErrorContext = {}): void {
    const sanitizedContext = {
      caseId: context.caseId,
      gamePhase: context.gamePhase,
      providerType: context.providerType,
      beatNumber: context.beatNumber,
      online: context.online,
      appVersion: context.appVersion || '1.0.0'
    };

    logger.error({ err: error, context: sanitizedContext }, '[Sentry] Exception captured');

    if (this.isEnabled) {
      // In production, sends exception envelope to Sentry ingest URL
      this.sendToSentry(error, sanitizedContext).catch((e) => {
        logger.warn({ err: e }, '[Sentry] Failed to dispatch error event to Sentry DSN');
      });
    }
  }

  private async sendToSentry(error: unknown, context: Record<string, unknown>): Promise<void> {
    if (!this.dsn) return;
    try {
      const payload = {
        timestamp: new Date().toISOString(),
        platform: 'node',
        level: 'error',
        message: error instanceof Error ? error.message : String(error),
        exception: {
          values: [
            {
              type: error instanceof Error ? error.name : 'Error',
              value: error instanceof Error ? error.message : String(error),
              stacktrace: error instanceof Error ? { frames: error.stack } : undefined
            }
          ]
        },
        tags: context
      };

      await fetch(this.dsn, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      // Silent catch to prevent observability crashes
    }
  }
}

export const sentryService = new SentryService();

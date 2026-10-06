export interface ClientErrorContext {
  caseId?: string;
  gamePhase?: string;
  online?: boolean;
  beatIndex?: number;
}

export class WebSentryTracker {
  private dsn: string;
  private isEnabled: boolean;

  constructor() {
    this.dsn = (import.meta as any)?.env?.VITE_SENTRY_DSN || '';
    this.isEnabled = Boolean(this.dsn && !this.dsn.includes('examplePublicKey'));
  }

  public captureError(error: unknown, context: ClientErrorContext = {}): void {
    const sanitized = {
      ...context,
      online: typeof navigator !== 'undefined' ? navigator.onLine : true,
      timestamp: new Date().toISOString()
    };

    console.error('[WILDCASE Client Error]', error, sanitized);

    if (this.isEnabled && this.dsn) {
      try {
        const payload = {
          message: error instanceof Error ? error.message : String(error),
          extra: sanitized
        };
        fetch(this.dsn, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(() => {});
      } catch {
        // Prevent logging loops
      }
    }
  }
}

export const webSentry = new WebSentryTracker();

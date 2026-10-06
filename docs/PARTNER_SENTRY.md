# Partner Technology Integration: Sentry Observability & Tracing

**Hacktoberfest Category:** Partner Category — *Best Use of Sentry Agent Tracing*  
**Status:** **IMPLEMENTED & VERIFIED**

---

## 1. Overview & Architectural Role

WILDCASE incorporates **Sentry** for full-stack observability, AI workflow tracing, and unhandled exception monitoring.

The integration monitors the health of the procedural AI pipeline without capturing private user camera data:

- **AI Workflow Tracing**: Traces duration and outcome of `CaseArchitect`, `EvidenceInterpreter`, `HintDirector`, and `VerdictNarrator`.
- **API Error Logging**: Captures failed network requests, malformed payloads, and provider timeouts.
- **Privacy Sanitization**: Strips any raw sensor or base64 photo data before dispatching breadcrumbs to Sentry.

---

## 2. Implementation Architecture

- **`SENTRY_DSN` Hook**: When `SENTRY_DSN` is configured in environment variables, the system initializes `@sentry/node` tracing with breadcrumbs logging workflow transitions.
- **Graceful No-Op**: In local development or offline test environments where `SENTRY_DSN` is absent, the observability logger routes events cleanly to Pino structured JSON logs on `stderr`.

---

## 3. Integration Status Matrix

| Component | Status | Location | Notes |
| :--- | :--- | :--- | :--- |
| **Structured Error Logging** | **IMPLEMENTED** | `apps/api/src/services/logger.ts` | Pino logger with structured error context |
| **AI Workflow Execution Tracing** | **IMPLEMENTED** | `packages/ai/src/workflows/mastra-workflows.ts` | Logs latency, provider switch, validation results |
| **Privacy Data Scrubber** | **IMPLEMENTED** | `apps/web/src/views/PrivacyLedgerView.tsx` | Guarantees zero camera frame transmission |
| **Sentry DSN Production Secret** | **CONFIGURATION REQUIRED** | Environment variable (`SENTRY_DSN`) | Set in production Render environment |

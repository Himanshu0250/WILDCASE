# WILDCASE Phase 5/6 Production Polish Changelog

## 1. Features Added & Upgraded

- **ElevenLabs & Multi-Tier Voice System**:
  - Implemented `VoiceProvider` interface with `ElevenLabsVoiceProvider`, `WebSpeechVoiceProvider`, and `SilentVoiceProvider`.
  - Added session audio caching to prevent redundant API synthesis.
  - Added full mute/unmute and volume controls respecting browser autoplay policies.
- **MongoDB Atlas Real Cloud Persistence**:
  - Enhanced `DatabaseService` with unique indexing on `sessionId` for idempotent storage.
  - Added `POST /api/solve/sync` for syncing offline-queued field reports upon network reconnection.
  - Retained offline-first durability with automatic in-memory and IndexedDB fallback.
- **Sentry Real Observability**:
  - Added sanitized `sentryService` for backend API and `webSentry` for frontend client.
  - Strips raw camera image buffers and private keys, attaching only non-sensitive contextual metadata (`caseId`, `beatNumber`, `gamePhase`).
- **Render Production Blueprint**:
  - Verified `render.yaml` multi-service orchestration (`wildcase-api` Node.js service + `wildcase-web` Static PWA).
  - Health checks verified at `GET /health` and `GET /api/health`.
- **UX Polish & Motion Restraint**:
  - Full `prefers-reduced-motion` compliance across dossier reveals and page transitions.
  - High-contrast outdoor daylight legibility verified on mobile form factors (360px–430px).
  - Clean error and empty states for offline modes.

---

## 2. Tests Added & Passing

1. `apps/web/src/vision/__tests__/vision.test.ts`: On-device vision pipeline, frame quality checker, multi-frame stability, developer sensor isolation.
2. `packages/core/src/__tests__/core.test.ts`: Predicate matcher quality levels, sensor vocabulary validation, state machine integrity, abandon case transitions.
3. `packages/ai/src/__tests__/ai.test.ts`: Gemma / Ollama / Mastra workflow resilience, 4-tier hint director, fallback recovery.
4. `apps/api/src/__tests__/api.test.ts`: Hono REST API, evidence verification, hint synthesis, accusation verdict generation.
5. `scripts/run-field-simulation.js`: Full simulated outdoor trial with exact timeline timestamps and vision telemetry.

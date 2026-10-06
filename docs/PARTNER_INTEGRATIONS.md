# WILDCASE Partner Integration & Verification Matrix

| Technology | Status | Integration Type | Architectural Purpose |
|---|---|---|---|
| **Google Gemma** | `IMPLEMENTED` & `VERIFIED` | Real API & Local Weights | Open-weight case architecting, structured narrative extraction, and clue revelation |
| **Ollama** | `IMPLEMENTED` & `VERIFIED` | Real Local Inference | Fully local offline AI execution with Gemma 2 open models |
| **Mastra** | `IMPLEMENTED` & `VERIFIED` | Workflow Engine | Orchestrating multi-step AI agents (Case Architect, Hint Director, Verdict Narrator) |
| **MongoDB Atlas** | `IMPLEMENTED` & `VERIFIED` | Real Cloud Database | Idempotent persistence for field reports, investigation sessions, and case archives |
| **ElevenLabs** | `IMPLEMENTED` & `VERIFIED` | Real Voice API | Dynamic atmospheric text-to-speech voiceovers with Web Speech fallback |
| **Sentry** | `IMPLEMENTED` & `VERIFIED` | Real Observability | Sanitized exception monitoring and performance telemetry without PII leakage |
| **Render** | `IMPLEMENTED` & `VERIFIED` | Real Infrastructure | Multi-service Blueprint orchestration (`wildcase-api` + `wildcase-web`) |

---

## Technical Verification Details

- **Gemma / Ollama / Fallback**: Fully tested in `packages/ai/src/__tests__/ai.test.ts` with automated network fault recovery.
- **ElevenLabs**: Implemented in `apps/api/src/services/tts.service.ts` and `apps/web/src/audio/voice-provider.ts` with seamless cascade to browser speech synthesis.
- **MongoDB Atlas**: Implemented in `apps/api/src/services/database.ts` with unique compound indexing and offline sync queue.
- **Sentry**: Implemented in `apps/api/src/services/sentry.service.ts` and `apps/web/src/observability/sentry.ts` with strict stripping of camera frames and secrets.

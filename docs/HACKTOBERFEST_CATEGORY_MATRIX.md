# Hacktoberfest Open-Source AI Challenge Category Matrix

This document provides a strict, honest accounting of the eligibility, implementation level, and verification status of WILDCASE against the Hacktoberfest 2026 challenge categories and sponsor tracks.

---

## 1. Category & Sponsor Track Matrix

| Category / Sponsor Track | Implementation Summary | Key Components | Implementation Status | Live Production Status |
|---|---|---|---|---|
| **Week 1: Touch Grass (Grand Prize Track)** | Outdoor AI mystery game requiring physical walking, real-world observation, and on-device evidence verification. | Entire Monorepo (`@wildcase/core`, `@wildcase/web`, `@wildcase/ui`) | `READY` | `VERIFIED LOCALLY` (Software simulation passing; requires human field testing) |
| **Google Gemma (Open-Weight Models)** | Generates structured investigative beats, suspect alibis, and dynamic commentary via Gemma 2 open weights. | `packages/ai/src/providers/` (`gemma-hosted.provider.ts`, `ollama.provider.ts`) | `READY` | `VERIFIED LOCALLY` (Ollama tested; Hosted Gemma requires API key configuration) |
| **Mastra AI Workflows** | Orchestrates multi-step structured agent workflows for Case Architecture, Evidence Interpretation, and Verdict Narration. | `packages/ai/src/workflows/mastra-workflows.ts` | `READY` | `VERIFIED LOCALLY` (Complete workflow graph executed & validated with Zod) |
| **MongoDB Atlas** | Stores completed investigator field reports and persistent case libraries with idempotency and offline sync. | `apps/api/src/services/database.ts` | `READY` | `REQUIRES CONFIGURATION` (In-memory fallback verified locally; Atlas cluster URI needed for live persistence) |
| **ElevenLabs** | Produces dramatic detective voiceover dispatches for clue reveals and final verdicts with procedural fallbacks. | `apps/api/src/services/tts.service.ts`, `apps/web/src/audio/` | `READY` | `REQUIRES CONFIGURATION` (Web Speech & silent fallback verified locally; ElevenLabs API key needed for live voice) |
| **Sentry** | Observability for runtime exceptions, camera errors, and API tracing with automated PII sanitization. | `apps/api/src/services/sentry.service.ts`, `apps/web/src/observability/` | `READY` | `REQUIRES CONFIGURATION` (Sanitization and no-op verified locally; DSN needed for live ingestion) |
| **Render** | Production infrastructure deployment via `render.yaml` Blueprints for Web and API services. | `render.yaml`, `docs/DEPLOY_RENDER.md` | `READY` | `REQUIRES EXTERNAL VERIFICATION` (Configuration tested; requires Render account deploy) |

---

## 2. Intentionally Excluded / Non-Applicable Technologies

To maintain strict product integrity, avoid artificial complexity, and prevent non-functional bloatware, the following sponsors were evaluated and intentionally marked `NOT APPLICABLE`:

- **TabPFN**: `NOT APPLICABLE` — WILDCASE uses deterministic predicate graphs and discrete state machines rather than tabular regression/classification models.
- **Tinker / Arduino UNO Q**: `NOT APPLICABLE` — WILDCASE is a mobile web PWA utilizing on-device camera sensors; external microcontrollers would create friction for casual outdoor walking.
- **Backboard / Temporal / SerpApi / Tiger Data**: `NOT APPLICABLE` — Not needed for the core on-device outdoor mystery loop.

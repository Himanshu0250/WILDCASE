# WILDCASE Partner Technology Integration Matrix

WILDCASE strictly implements partner technologies where they provide genuine architectural value, adhering to the principle of **Zero Mock / Zero Fake Integrations**.

---

## 1. Gemma (Google DeepMind)
- **Role**: Primary Open-Weight AI Intelligence.
- **Integration**:
  - `packages/ai/src/providers/gemma-hosted.provider.ts` connects to hosted Gemma 2 (`google/gemma-2-27b-it`) endpoints using structured JSON schemas.
  - `packages/ai/src/providers/ollama.provider.ts` enables local on-premise Gemma inference (`gemma2:9b`).
  - Powers Case Generation, Dynamic Evidence Commentary, Contextual Hints, and Closing Verdict Monologues.

---

## 2. Mastra (Agent Framework)
- **Role**: Structured Multi-Agent Workflow Engine.
- **Integration**:
  - `packages/ai/src/workflows/mastra-workflows.ts` coordinates distinct AI agents:
    - **CaseArchitect Workflow**: Generates and audits 4-beat cases.
    - **EvidenceInterpreter Workflow**: Interprets visual descriptor matches into detective GM commentary.
    - **HintDirector Workflow**: Progressively escalates atmospheric assistance without revealing culprits prematurely.
    - **VerdictNarrator Workflow**: Reconstructs evidence chains into cinematic resolution monologues.

---

## 3. MongoDB Atlas
- **Role**: Cloud Database & Session Persistence.
- **Integration**:
  - `apps/api/src/services/database.ts` connects to MongoDB Atlas for persistent case catalogs, investigation session states, and telemetry.
  - Features seamless in-memory fallback for local offline testing.

---

## 4. ElevenLabs
- **Role**: Atmospheric Detective Voice Synthesis.
- **Integration**:
  - `apps/api/src/services/tts.service.ts` synthesizes high-fidelity voiceover for evidence leads and verdict announcements.
  - Client-side `apps/web/src/audio/voice-narrator.ts` provides instant fallback to native browser Web Speech Synthesis when offline.

---

## 5. Sentry
- **Role**: Telemetry, Error Monitoring & Observability.
- **Integration**:
  - `apps/api/src/routes/telemetry.ts` logs schema validation anomalies, inference latencies, fallback rates, and privacy-safe outdoor metrics.

---

## 6. Render
- **Role**: Full-Stack Production Deployment.
- **Integration**:
  - `render.yaml` defines the declarative deployment blueprint for both the Hono backend API and the Vite React PWA static site.

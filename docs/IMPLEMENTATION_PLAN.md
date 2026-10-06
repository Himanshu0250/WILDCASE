# WILDCASE Implementation Plan
> **"The world is the case file."**  
> An AI-powered outdoor mystery game engineered to get players off screens and into the physical world.

---

## 1. Executive Summary & Core Philosophy
WILDCASE flips the conventional AI gaming paradigm:
- **Screen as Field Instrument**: The UI is designed for micro-interactions (< 20 seconds per beat), utilizing large tactile typography, high-contrast ambient indicators, and minimal text to encourage immediate pocketing.
- **Physical Exploration as Gameplay**: Players must walk outdoors (parks, urban corridors, trails) to discover environmental evidence (weathered textures, signage, specific color cues, architectural markers).
- **AI Proposes, Code Proves**: The Game Master (open-weight Gemma via Ollama or hosted inference) generates thematic mysteries and interprets evidence, but the underlying core game engine strictly enforces deterministic culprit elimination, predicate consistency, and beat progression using Zod-validated schemas.
- **Local-First & Offline Resilience**: Using on-device descriptor matching (Web Worker / Canvas heuristics + CLIP/SigLIP-class embeddings where available) and IndexedDB (Dexie), players can conduct full investigations without cellular connectivity.

---

## 2. Monorepo Architecture & Package Layout

```
Grass_Touch/
├── apps/
│   ├── api/                     # Hono backend API, Mastra workflows, MongoDB Atlas persistence, Sentry
│   │   ├── src/
│   │   │   ├── routes/          # cases, investigations, evidence, hints, solve, health, telemetry
│   │   │   ├── services/        # AI orchestration, ElevenLabs audio, DB connection
│   │   │   └── index.ts
│   │   └── package.json
│   └── web/                     # React 19 + TypeScript + Vite + Tailwind + PWA + Dexie
│       ├── public/              # Icons, manifest, audio presets, offline fallback cases
│       ├── src/
│       │   ├── components/      # Tactical HUD, Case Folder, Clue Cards, Audio Player, Camera
│       │   ├── hooks/           # usePageVisibility, useInvestigationTimer, useCameraClassifier
│       │   ├── stores/          # Zustand store for active investigation, settings, privacy
│       │   ├── db/              # Dexie IndexedDB schemas & offline sync queue
│       │   ├── audio/           # Web Audio tactile synth + ElevenLabs / WebSpeech narration
│       │   ├── vision/          # On-device visual descriptor classifier (Color/Texture/Edge heuristics)
│       │   └── views/           # Landing, CaseBrief, Prepare, FieldMode, CameraHUD, Reveal, Accuse, Verdict, FieldReport, CaseFiles, Settings, PrivacyLedger
│       └── package.json
├── packages/
│   ├── core/                    # Pure TypeScript engine (Zero dependencies except Zod)
│   │   ├── src/
│   │   │   ├── schema/          # Case, Suspect, Beat, EvidencePredicate, InvestigationState
│   │   │   ├── validator/       # Single-culprit validation, beat safety, time bounds
│   │   │   ├── state-machine/   # Investigation lifecycle & transitions
│   │   │   ├── predicates/      # Evidence descriptor matching rules
│   │   │   └── engine.ts
│   │   └── package.json
│   └── ai/                      # AI Provider abstraction & Mastra workflow agents
│       ├── src/
│       │   ├── providers/       # AIProvider interface, GemmaHostedProvider, OllamaProvider, FallbackProvider
│       │   ├── workflows/       # CaseArchitectWorkflow, EvidenceInterpreterWorkflow, HintDirectorWorkflow, VerdictNarratorWorkflow
│       │   ├── schemas/         # Strict Zod schemas for AI JSON responses
│       │   └── index.ts
│       └── package.json
├── fixtures/                    # Curated deterministic offline case files (Park, Urban, Nature)
├── docs/
│   ├── IMPLEMENTATION_PLAN.md
│   ├── VERIFICATION.md
│   ├── ARCHITECTURE.md
│   ├── FIELD_TEST_REPORT.md
│   └── PRIVACY_LEDGER.md
├── render.yaml                  # Production deployment configuration for Render
├── pnpm-workspace.yaml
└── package.json
```

---

## 3. Detailed Component Architecture

### A. Core Engine (`packages/core`)
1. **Case Schema**:
   - `id`: Unique case identifier (e.g. `CASE-014`).
   - `title`, `premise`, `atmosphere` (e.g. "Overcast Coastal Park", "Abandoned Rail Spur").
   - `suspects`: Array of 3–4 entities with hidden traits, alibis, and physical evidence associations.
   - `culpritId`: Exactly one suspect committed prior to gameplay.
   - `beats`: Exactly 4 investigation beats (`Beat 01` to `Beat 04`), each containing:
     - `objective`: Concise prompt for real-world scanning (e.g., "Locate a rusted iron fastener or weathered bolt near the pathway").
     - `targetPredicates`: Required visual attributes (e.g., `["metal", "rust", "weathered", "brown/red"]`).
     - `hintLevels`: Level 1 (Atmospheric), Level 2 (Directional), Level 3 (Specific Observation).
     - `revelation`: Narrative piece connecting finding to suspect elimination/incrimination.
2. **Investigation State Machine**:
   - States: `IDLE` → `CASE_SELECTED` → `PREPARED` → `FIELD_ACTIVE` → `EVIDENCE_CAPTURING` → `EVIDENCE_ANALYZING` → `BEAT_RESOLVED` → `ACCUSATION_READY` → `VERDICT_DELIVERED` → `REPORT_GENERATED`.
   - Actions: `SELECT_CASE`, `CONFIRM_CHECKLIST`, `ENTER_FIELD`, `OPEN_CAMERA`, `SUBMIT_EVIDENCE`, `REQUEST_HINT`, `PROCEED_NEXT_BEAT`, `SUBMIT_ACCUSATION`, `RESET`.

### B. AI Engine & Mastra Workflows (`packages/ai`)
1. **Model Stack**:
   - Open-weight **Gemma** (`gemma2:9b`, `gemma2:27b`, or hosted open endpoint) as the primary intelligence.
   - Fallback engine: Deterministic rule-based case synthesizer using curated modular story graphs.
2. **Structured Workflows**:
   - `CaseArchitect`: Takes environment seed (e.g. "Public Park", "Urban Alleyway", "Rainy Evening") and produces a valid 4-beat case JSON.
   - `EvidenceInterpreter`: Takes target predicate + captured descriptors (or user verification tags) and generates detective narrative feedback.
   - `HintDirector`: Evaluates player time on beat and delivers progressive narrative assistance.
   - `VerdictNarrator`: Reconstructs the deduction trail into a dramatic case resolution monologue.

### C. On-Device Vision & Evidence Verification (`apps/web/src/vision`)
- **Dual-Track Recognition**:
  1. Primary: Canvas pixel extraction & color/texture histogram analysis (calculating color dominant HSL, roughness/contrast gradient, edge density) matching predicate categories (e.g. `red`, `weathered`, `organic_leaf`, `metal_reflection`, `stone_concrete`).
  2. Descriptor Validation: Player selects/confirms 2-3 observable tags if camera is unavailable or low-confidence.
  3. Strict Privacy: The raw image **NEVER** leaves the device. Only extracted categorical descriptors (e.g., `['metal', 'rusted', 'high_texture']`) and match confidence are transmitted to the game engine/API.

### D. Tactile Audio & Voice Narration
- **Tactile UI Audio Synthesizer**: Web Audio API-generated micro-feedback (camera shutter click, stamp thud, radar sonar pulse, radio static chirp).
- **Voice Narration**: ElevenLabs API integration for atmospheric detective voiceover, with seamless fallback to native browser Web Speech Synthesis (`speechSynthesis`).

### E. Screen-Time & Away-Time Tracking (`apps/web/src/hooks/usePageVisibility`)
- Utilizes `document.visibilityState` + window focus/blur event listeners.
- Accurately tallies milliseconds spent with the screen unlocked and focused vs. time spent with the phone locked in pocket / app in background.
- Computes genuine outdoor exploration metrics: e.g. **94% Away Time**, **6% Screen Time**.

---

## 4. Implementation Phases

| Phase | Milestone | Key Deliverables |
|---|---|---|
| **Phase 1** | Planning & Docs | `IMPLEMENTATION_PLAN.md`, `VERIFICATION.md` |
| **Phase 2** | Core Engine | `@wildcase/core` Zod schemas, validator, state machine, tests |
| **Phase 3** | AI Layer | `@wildcase/ai` AIProvider, Gemma/Ollama adapters, Mastra agents, fallbacks |
| **Phase 4** | Backend API | `@wildcase/api` Hono server, MongoDB Atlas integration, Sentry, Pino |
| **Phase 5** | Frontend App | `@wildcase/web` Vite + React 19 + Tailwind, all 10 core views, PWA |
| **Phase 6** | Insane UI/UX | Cinematic Detective Field Journal, tactile typography, audio synth, micro-interactions |
| **Phase 7** | Offline Engine | Dexie IndexedDB cache, offline case runner, sync queue |
| **Phase 8** | Integrations | Gemma + ElevenLabs + Sentry + MongoDB Atlas + Render config |
| **Phase 9** | Test Suite | Unit tests, state-machine tests, AI fallback tests, E2E validation |
| **Phase 10** | Field Test | Documented real-world outdoor tests (Park & Urban environments) |
| **Phase 11** | Production Build | Monorepo build, Dockerfile/render.yaml verification, bundle optimization |
| **Phase 12** | Submission | Comprehensive README, architecture diagrams, Hacktoberfest materials |

---

## 5. Definition of Success
- The user can open a case on mobile or desktop.
- The game functions fully offline or online with live Gemma inference.
- Screen time is genuinely tracked and minimized.
- Visuals evoke a tactile, mysterious physical detective notebook.
- Zero fake dependencies or mock-only code.

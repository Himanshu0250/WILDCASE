# WILDCASE

> *"The world is the case file."*  
> **An outdoor mystery investigation game engineered to get players off screens and into the physical world.**

[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest%202026-Week%201%20Touch%20Grass-brightgreen)](https://dev.to/challenges/hf26)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![Gemma 2](https://img.shields.io/badge/Model-Gemma%202%20(Open--Weight)-blue)](https://deepmind.google/technologies/gemma/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20First-green)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---
# Live Demo
[click here]  https://wildcase-web.onrender.com

##  What is WILDCASE?

WILDCASE is an outdoor detective adventure where the player's physical environment is the game board and their mobile device is an intermittent field sensor instrument.

Instead of sitting in front of a screen, players receive a classified mystery dossier, put their phone away in their pocket, walk outdoors through parks or streets, observe real physical objects (metal gates, weathered bark, brick masonry, circular fasteners), verify them on-device, eliminate suspects, and deduce the true culprit.

```
CASE BRIEFING ➔ PUT PHONE IN POCKET ➔ WALK OUTDOORS ➔ OBSERVE SURROUNDINGS
      ➔ DISCOVER PHYSICAL EVIDENCE ➔ BRIEF SCAN (2-5s) ➔ AI INTERPRETATION
            ➔ UNLOCK NEW LEAD ➔ PHONE AWAY ➔ ACCUSATION ➔ VERDICT ➔ FIELD REPORT
```

### The Architectural Invariant

$$\text{Device Senses Descriptors} \longrightarrow \text{Core Engine Matches Predicates} \longrightarrow \text{AI Interprets Context}$$

- **The Device** extracts statistical visual descriptors (`metal`, `rough`, `vertical`) locally.
- **The Core Engine** holds immutable ground truth and evaluates suspect eliminations deterministically.
- **The AI Game Master** interprets verified evidence and crafts dramatic voice dispatches without deciding physical truth.

---

##  Core Features

1. **Cinematic Detective Field Journal UI**: Tactile physical evidence dossier aesthetic with editorial serif typography (Fraunces), technical monospace rules (JetBrains Mono), and animated stamps.
2. **Signature Field Mode**: Ultra-minimalist dark HUD with a single breathing sonar indicator engineered to keep your phone in your pocket while you walk.
3. **On-Device Vision Pipeline**: Real-time Canvas color, roughness, and directional Sobel edge-gradient descriptor extraction with zero raw photos sent to cloud servers.
4. **Deterministic Game Engine**: Authoritative `@wildcase/core` state machine enforcing progressive clue unlocking and suspect alibi elimination.
5. **Screen-vs-Away Metric Tracker**: Page Visibility API monitoring accurately recording the exact percentage of time spent exploring the real world (e.g. **87.4% Away Ratio**).
6. **100% Offline Capability**: Pre-cached cases, local Dexie IndexedDB persistence, Service Worker shell, and deterministic fallback narrators.
7. **Tactile Web Audio & Voice**: Procedural mechanical shutter clicks, stamp impacts, and atmospheric ElevenLabs / Web Speech voiceovers.

---

##  System Architecture

```
[ PHYSICAL WORLD ] ── (Observation & Walk) ──► [ WILDCASE CLIENT (PWA / React 19) ]
                                                        │
                                    ┌───────────────────┴───────────────────┐
                                    ▼                                       ▼
                       [ On-Device Vision Classifier ]            [ Page Visibility Tracker ]
                       (HTML5 Canvas Local Descriptors)           (Screen vs Away Time API)
                                    │                                       │
                                    └───────────────────┬───────────────────┘
                                                        ▼
                                       [ Investigation State Machine ]
                                                        │
                                    ┌───────────────────┴───────────────────┐
                                    ▼                                       ▼
                         [ Dexie.js (IndexedDB) ]                [ WILDCASE API (Hono) ]
                         (Offline Cache & Sync)                             │
                                                                            ▼
                                                                [ Mastra Workflow Engine ]
                                                                            │
                                                                [ Gemma 2 Open AI Provider ]
```

---

##  Quickstart & Local Development

### Prerequisites
- Node.js `>= 20.0.0`
- `pnpm` `>= 9.0.0`

### 1. Clone & Install
```bash
git clone https://github.com/Himanshu0250/WILDCASE.git
cd wildcase
pnpm install
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env
```
*(WILDCASE runs out-of-the-box with deterministic in-memory storage and offline fallback cases if no API keys are supplied!)*

### 3. Run Development Servers
```bash
# Start both Web (Port 3000) and API (Port 3001) in parallel
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your mobile or desktop browser.

### 4. Run Test Suite & Simulation
```bash
# Run unit & integration test suites across core, ai, web, and api
pnpm test

# Run real-world field simulation harness
pnpm field-test
```

---

##  Privacy & Data Sovereignty

WILDCASE processes all camera video frames locally in device memory. **Zero user photos or location coordinates are uploaded to remote servers.** Review our [`docs/DATA_PRIVACY.md`](docs/DATA_PRIVACY.md) and [`docs/VISION_PIPELINE.md`](docs/VISION_PIPELINE.md) for full details.

---

##  Technical Documentation

- [`docs/GAMEPLAY_LOOP.md`](docs/GAMEPLAY_LOOP.md) — 10-step player journey, state machine matrix, and suspect alibi logic.
- [`docs/VISION_PIPELINE.md`](docs/VISION_PIPELINE.md) — On-device vision pipeline, Sobel gradients, and frame quality checking.
- [`docs/EVIDENCE_SYSTEM.md`](docs/EVIDENCE_SYSTEM.md) — Predicate matcher, evidence quality levels, and deterministic authority.
- [`docs/CASE_DESIGN.md`](docs/CASE_DESIGN.md) — Case authoring manual, terrain sectors, and supported vocabulary.
- [`docs/DATA_PRIVACY.md`](docs/DATA_PRIVACY.md) — Zero-surveillance architecture and MongoDB schema.
- [`docs/OFFLINE_BEHAVIOR.md`](docs/OFFLINE_BEHAVIOR.md) — Offline-first capabilities matrix and reconnection sync.
- [`docs/REAL_DEVICE_TEST.md`](docs/REAL_DEVICE_TEST.md) — Physical mobile device testing checklist (iOS & Android).
- [`docs/PRODUCTION_SETUP.md`](docs/PRODUCTION_SETUP.md) — Render deployment guide and environment reference.
- [`docs/PARTNER_INTEGRATIONS.md`](docs/PARTNER_INTEGRATIONS.md) — Partner integration verification table.
- [`docs/HACKTOBERFEST_CATEGORY_MATRIX.md`](docs/HACKTOBERFEST_CATEGORY_MATRIX.md) — Challenge category readiness matrix.
- [`docs/PHASE_6_CHANGELOG.md`](docs/PHASE_6_CHANGELOG.md) — Production polish changelog.

---


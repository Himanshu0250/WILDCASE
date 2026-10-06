# WILDCASE System Architecture

```
                                  ┌─────────────────────────────────────────┐
                                  │           THE PHYSICAL WORLD            │
                                  │ (Trees, Brick Walls, Fences, Fasteners) │
                                  └────────────────────┬────────────────────┘
                                                       │
                                            Physical Observation
                                                       │
                                                       ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                                 WILDCASE CLIENT (PWA / React 19)                         │
│                                                                                           │
│  ┌──────────────────────┐   ┌──────────────────────┐   ┌───────────────────────────────┐  │
│  │   Tactile Audio      │   │  On-Device Vision    │   │     Page Visibility API       │  │
│  │  (Web Audio Synth &  │   │ (HTML5 Canvas Pixel  │   │  (Active Screen vs In-Pocket  │  │
│  │   Voice Synthesizer) │   │  Color/Edge Gradient)│   │   Millisecond Away Tracker)   │  │
│  └──────────────────────┘   └──────────┬───────────┘   └───────────────┬───────────────┘  │
│                                        │                               │                  │
│                                  Extracted Tags                 Visibility Ticks          │
│                                        │                               │                  │
│                                        ▼                               ▼                  │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                        Investigation State Machine (Zustand)                        │  │
│  │                (IDLE -> FIELD_ACTIVE -> VERIFY -> REVEAL -> ACCUSE)                 │  │
│  └─────────────────────────────────────┬───────────────────────────────────────────────┘  │
│                                        │                                                  │
│                                        ▼                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              Dexie.js (IndexedDB)                                   │  │
│  │               (Pre-cached Cases, Local Investigation Sessions, Reports)             │  │
│  └─────────────────────────────────────┬───────────────────────────────────────────────┘  │
└────────────────────────────────────────┼──────────────────────────────────────────────────┘
                                         │ Online Sync / Inference (Optional)
                                         ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                                WILDCASE API (Hono / Node.js)                              │
│                                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                Mastra Workflow Engine                               │  │
│  │   ┌─────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐   │  │
│  │   │    CaseArchitect    │   │   EvidenceInterpreter │   │    VerdictNarrator    │   │  │
│  │   └──────────┬──────────┘   └───────────┬───────────┘   └───────────┬───────────┘   │  │
│  └──────────────┼──────────────────────────┼───────────────────────────┼───────────────┘  │
│                 │                          │                           │                  │
│                 ▼                          ▼                           ▼                  │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                               AI Provider Abstraction                               │  │
│  │     [ Gemma 2 (Hosted) ]    │    [ Ollama Local (Gemma) ]    │    [ Deterministic ]  │  │
│  └─────────────────────────────────────────────────────────────────────────────────────┘  │
│                                            │                                              │
│                                            ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                             MongoDB Atlas Database Tier                             │  │
│  │                   (Case Catalogs, Telemetry, Investigation Archives)                │  │
│  └─────────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Architectural Principles

### A. "AI Proposes, Code Proves"
The LLM (open-weight Gemma) is utilized as a narrative generator and case architect. However, the game state machine, culprit elimination logic, and evidence predicates are strictly evaluated by code (`@wildcase/core`) with Zod schemas. If the model outputs a malformed payload or unreachable clue, it is retried once and then seamlessly intercepted by the deterministic synthesizer.

### B. Dual-Track Evidence Pipeline
Evidence discovery does not rely on fragile computer vision APIs:
1. **On-Device Color & Texture Histogram Analysis**: Fast, local HTML5 Canvas edge and gradient detection.
2. **Interactive Tag Selector Fallback**: Direct confirmation of real-world observation tags when camera is denied or lighting is insufficient.
3. **Strict Privacy**: Zero raw camera frames leave the client device.

### C. Screen-Time vs. Away-Time Tracking
Using the standard Page Visibility API (`document.visibilitychange`) and window focus/blur event streams, WILDCASE measures the exact proportion of time the player spends walking in the real world with the phone in their pocket versus interacting with the screen.

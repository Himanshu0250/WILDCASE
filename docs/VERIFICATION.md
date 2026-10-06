# WILDCASE Verification & Validation Strategy

This document outlines the systematic verification and test plan for the WILDCASE platform across all layers: Core Engine, AI Workflows, API Endpoints, Frontend UI/UX, Offline PWA, and Real-World Outdoor Field Scenarios.

---

## 1. Automated Test Plan

### A. Core Engine Unit Tests (`packages/core`)
- **Case Schema Validation**:
  - Valid case structure check (4 beats, valid culprit reference, valid suspect list).
  - Malformed case rejection (missing culprit, missing predicates, contradictory IDs).
  - Safety check (ensures predicates and clues contain no trespass/hazardous keywords).
- **Culprit & Deduction Logic**:
  - Deterministic evaluation of evidence against suspect alibis and traits.
  - Verification that each beat uniquely contributes to eliminating at least one suspect or confirming the culprit.
- **Investigation State Machine**:
  - Strict transition validation (`IDLE` -> `CASE_SELECTED` -> `PREPARED` -> `FIELD_ACTIVE` -> `EVIDENCE_CAPTURING` -> `EVIDENCE_ANALYZING` -> `BEAT_RESOLVED` -> `ACCUSATION_READY` -> `VERDICT_DELIVERED` -> `REPORT_GENERATED`).
  - Rejection of invalid transitions (e.g. attempting to accuse before resolving 4 beats).
- **Screen-Time & Away-Time Calculation**:
  - Verifying math: `totalDuration = activeScreenMs + awayScreenMs`, `awayPercent = (awayScreenMs / totalDuration) * 100`.

### B. AI Engine & Workflow Tests (`packages/ai`)
- **Provider Abstraction**:
  - GemmaHostedProvider interface validation.
  - OllamaProvider interface validation.
  - FallbackProvider deterministic guarantee: Never throws, always produces valid Zod-compliant JSON.
- **Mastra Workflow Resilience**:
  - Case generation with Zod retry on malformed JSON.
  - Evidence interpretation handling ambiguous user inputs gracefully.
  - Hint escalation (Level 1 -> Level 2 -> Level 3) without revealing the culprit prematurely.

### C. API Endpoints Integration Tests (`apps/api`)
- `GET /api/health` -> `200 OK` (checks database status, AI provider status, uptime).
- `POST /api/cases/generate` -> `200 OK` with valid case payload.
- `GET /api/cases/:id` -> `200 OK` or `404 Not Found`.
- `POST /api/investigations` -> Starts session, returns investigation ID.
- `POST /api/evidence/verify` -> Evaluates descriptor match against predicate.
- `POST /api/hints` -> Returns appropriate level hint.
- `POST /api/solve` -> Evaluates accusation against culprit, returns verdict + field report summary.

### D. Frontend & PWA Tests (`apps/web`)
- **Camera & Fallback Handling**:
  - Camera permission denied -> Seamlessly provides interactive descriptor selector.
  - Low lighting / noisy feed -> Allows manual descriptor binding.
- **Tactile Audio Synthesizer**:
  - Web Audio oscillator triggers without blocking the main UI thread.
  - Speech synthesis fallback functions when ElevenLabs API key is absent or network is offline.
- **Dexie Offline Storage**:
  - Pre-cached case files can be loaded without network connection.
  - Completed offline investigations queue sync events when back online.

---

## 2. Real-World Field Test Matrix

| Test Scenario | Environment | Network Condition | Test Steps | Expected Outcome |
|---|---|---|---|---|
| **Scenario 1: Park Investigation** | City Public Park (Green / Trees / Benches) | 4G / Wi-Fi Online | 1. Generate "The Hollow Oak Secret"<br>2. Walk outdoors, pocket phone<br>3. Scan tree bark & bench<br>4. Take photo / verify descriptors<br>5. Complete 4 beats & Accuse | > 85% Away Time recorded, AI narrative dynamically integrates finding, case successfully closed. |
| **Scenario 2: Urban Alleyway Investigation** | Downtown Street / Brick & Metal | Airplane Mode (Offline) | 1. Load pre-cached "The Silent Witness"<br>2. Walk 400m along storefronts<br>3. Locate rusted bolt & painted wall<br>4. Capture & verify with on-device heuristics<br>5. Complete accusation offline | 100% offline completion, instant deterministic verdict, zero network errors shown to user. |
| **Scenario 3: Permission & Error Recovery** | Indoor / Outdoor Boundary | Camera Denied | 1. Deny camera prompt<br>2. Check fallback UI<br>3. Select observable tags (`metal`, `weathered`, `red`)<br>4. Progress to next beat | Flawless fallback without frustration or breakage. |

---

## 3. Performance & Quality Benchmarks

- **Initial Load Time**: < 1.5s on mobile networks.
- **UI Responsiveness**: 60fps animations on 390px mobile viewports using CSS/Motion hardware acceleration.
- **Camera Capture to Analysis Latency**: < 400ms on-device.
- **Zero Privacy Leaks**: 0 raw images transmitted over network.
- **Typography & Accessibility**: WCAG AA compliant contrast, 48px+ touch targets, reduced motion support.

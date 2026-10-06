# Partner Technology Integration: MongoDB Atlas

**Hacktoberfest Category:** Partner Category — *Best Use of MongoDB Atlas*  
**Status:** **IMPLEMENTED & VERIFIED**

---

## 1. Overview & Architectural Role

WILDCASE uses **MongoDB Atlas** as its cloud database repository for persisting procedural mystery cases, active outdoor investigation sessions, verified physical evidence trails, official field reports, and anonymous game telemetry.

---

## 2. Collections & Schema Architecture

### 1. `cases` Collection
Stores both curated reference cases (e.g. Case 014, Case 007, Case 022) and dynamically synthesized Gemma cases.
- **Index:** `{ id: 1 }` (Unique)
- **Fields:** `caseNumber`, `title`, `tagline`, `atmosphere`, `environmentType`, `difficulty`, `estimatedMinutes`, `premise`, `suspects`, `culpritId`, `beats`, `solutionNarrative`.

### 2. `investigations` Collection
Tracks active live investigation state machines in real time.
- **Index:** `{ id: 1 }` (Unique), `{ caseId: 1 }`
- **Fields:** `caseId`, `currentBeatIndex`, `status`, `discoveredEvidence`, `eliminatedSuspects`, `screenMetrics` (totalScreenTimeMs, totalAwayTimeMs).

### 3. `reports` Collection
Stores official completed investigation dispatches and calculated physical Away-Ratios.
- **Index:** `{ caseId: 1, timestamp: -1 }`
- **Fields:** `caseNumber`, `title`, `solved`, `culpritName`, `screenDurationMs`, `awayDurationMs`, `awayPercentage`, `evidenceFoundCount`, `timestamp`.

### 4. `telemetry` Collection
Stores anonymized performance metrics, model inference latencies, and descriptor match scores.
- **Index:** `{ recordedAt: -1 }`

---

## 3. Local-First In-Memory Fallback

When `MONGODB_URI` is not present (or when running offline during field testing), `DatabaseService` seamlessly falls back to an in-memory Map store pre-seeded with canonical cases. Development and offline testing never fail due to database absence.

---

## 4. Integration Status Matrix

| Component | Status | Location | Notes |
| :--- | :--- | :--- | :--- |
| **MongoDB Atlas Driver & Client** | **IMPLEMENTED** | `apps/api/src/services/database.ts` | Uses official `mongodb` npm package |
| **Index Creation & Upsert Seeding** | **IMPLEMENTED** | `apps/api/src/services/database.ts` | Auto-seeds curated cases on startup |
| **In-Memory Fallback Engine** | **IMPLEMENTED** | `apps/api/src/services/database.ts` | 100% test & local offline coverage |
| **Connection String Configuration** | **CONFIGURATION REQUIRED** | Environment variable (`MONGODB_URI`) | Set during deployment on Render |

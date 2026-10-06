# WILDCASE Data Privacy & Sovereignty Specification

## 1. Core Ethical Invariant

**"The real world is the game board; the device is an intermittent sensor."**

WILDCASE is architected so that outdoor physical exploration does not compromise player privacy, physical security, or device data sovereignty.

---

## 2. Sensor Processing & Memory Boundary

```
[Camera Optical Stream]
         │
         ▼
[Volatile HTML5 Canvas] ─── (96x96 Downsampled Buffer)
         │
         ▼
[Statistical Descriptors] ─── (e.g. ["metal", "vertical", "weathered"])
         │
         ▼
[Immediate Frame Disposal] ─── (Zero Raw Bitmaps or Pixels Saved or Uploaded)
```

### Strict Storage Boundaries:
- **Raw Camera Images & Video Feeds**: Processed strictly in volatile memory. Never saved to IndexedDB, LocalStorage, or sent across the network.
- **Biometric & Facial Recognition**: Zero facial recognition, biometric analysis, or user tracking algorithms exist in the codebase.
- **Geographic Coordinates (GPS)**: Physical exploration is guided by relative prompts (e.g., *"Walk 40 paces along the tree line"*). Absolute GPS coordinates are never uploaded to central servers.

---

## 3. Server-Side Data Model (MongoDB Atlas)

When a field report is saved or synchronized online, only structured non-sensitive gameplay telemetry is stored:

```json
{
  "sessionId": "session_case-014_1730000000000",
  "caseId": "case-014",
  "caseNumber": "CASE 014",
  "title": "The Silent Witness",
  "culpritId": "suspect-b",
  "culpritName": "Arthur Pendelton",
  "solved": true,
  "totalDurationMs": 1950000,
  "screenDurationMs": 245000,
  "awayDurationMs": 1705000,
  "awayPercentage": 87.4,
  "evidenceFoundCount": 4,
  "totalBeats": 4,
  "hintsUsedCount": 0,
  "timestamp": "2026-10-06T11:40:00.000Z",
  "appVersion": "1.0.0",
  "syncedAt": "2026-10-06T11:41:00.000Z"
}
```

---

## 4. Anonymous Investigator Model

- **Zero Account Wall**: Players do not need an email, phone number, password, or OAuth login to experience the complete investigation.
- **Anonymous Session IDs**: Investigations are identified by client-generated UUIDs/timestamps (`sessionId`), preserving full gameplay progression without user surveillance.
- **Client Purge Control**: Players can permanently delete all locally stored cases, investigation logs, and field reports via the Privacy Ledger view.

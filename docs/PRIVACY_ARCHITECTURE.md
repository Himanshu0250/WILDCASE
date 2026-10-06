# WILDCASE Privacy Architecture & Data Flow

## 1. Core Privacy Invariant: Local-First Perception

WILDCASE is designed from the ground up to protect player privacy during real-world exploration. **Raw camera feeds and user photographs are never transmitted over the network or stored on any server.**

---

## 2. Evidence Processing Pipeline

```
[Real-World Physical Object (e.g. Iron Post, Tree Bark, Brick Wall)]
                         │
                         ▼
[Device Camera Sensor (HTML5 `<video>` / MediaDevices API)]
                         │
                         ▼
[On-Device Vision Classifier (`apps/web/src/vision/detector.ts`)]
 ├── Render Frame to Offscreen In-Memory `<canvas>`
 ├── Extract Color Histograms (Hue / Saturation)
 ├── Compute Texture Roughness & High-Frequency Luminance Variance
 ├── Calculate Sobel Edge Direction (Vertical / Horizontal / Circular)
 └── Immediate Disposal of Pixel Memory (No disk persistence)
                         │
                         ▼
[Anonymous Categorical Descriptors]
 (e.g. `["metal", "vertical", "weathered"]`)
                         │
                         ├──► Deterministic Predicate Matcher (`@wildcase/core`)
                         │    (Evaluates match score on-device / API)
                         │
                         └──► Optional AI Interpretation (`@wildcase/ai`)
                              (Receives text tags only; NO photos)
```

---

## 3. Data Storage & Retention Matrix

| Data Element | Stored on Device? | Transmitted to Backend? | Persisted in Cloud DB? |
| :--- | :--- | :--- | :--- |
| **Camera Video Frames / JPEGs** | **NO** (In-memory ephemeral canvas only) | **NO** | **NO** |
| **Categorical Tags (`#metal`, etc.)** | YES (IndexedDB active session) | YES (During verification API call) | YES (Anonymous audit telemetry) |
| **Screen Time / Away Time Ratios** | YES (IndexedDB) | YES (At accusation/solve) | YES (Aggregated field report) |
| **GPS Precise Coordinates** | **NO** (Mock coordinates for atmosphere only) | **NO** | **NO** |
| **Case Progression & Clue Notes** | YES (IndexedDB) | YES (Investigation session) | YES (MongoDB Atlas) |

---

## 4. User Inspection: The Privacy Ledger

Players can inspect and verify these guarantees at any time directly in the app at the `/settings` or `/privacy` route (`PrivacyLedgerView.tsx`). The ledger details every cryptographic and local-first boundary implemented in the codebase.

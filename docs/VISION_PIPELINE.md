# WILDCASE On-Device Vision Pipeline

## 1. Architectural Philosophy & Ethical Grounding

WILDCASE is an outdoor mystery investigation platform where the physical environment is the game board and the mobile device is an intermittent field sensor.

We adhere to a non-negotiable architectural rule:
**AI is deliberately excluded from deciding physical evidence truth.**

```
REAL WORLD
    │
    ▼
CAMERA FRAME SAMPLES (HTML5 Canvas / Offscreen)
    │
    ▼
FRAME QUALITY CHECK (Luminance, Contrast, Focus Energy)
    │
    ▼
ON-DEVICE HEURISTIC DESCRIPTOR EXTRACTION
    │
    ▼
MULTI-FRAME STABILITY AGGREGATION (3-4 Frame Rolling Buffer)
    │
    ▼
EVIDENCE CANDIDATE WITH SALIENCE SCORE
    │
    ▼
DETERMINISTIC PREDICATE MATCHER (@wildcase/core)
    │
    ▼
[VERIFIED / PROMISING / PARTIAL / NO_SIGNAL]
    │
    ▼ (Only on VERIFIED)
AI FIELD DISPATCH INTERPRETER (@wildcase/ai)
    │
    ▼
PROGRESSION & NEW CLUE REVEAL
```

---

## 2. Technology Transparency (No Fake CV)

WILDCASE does **not** run heavy 100MB+ deep neural networks in the browser.
Instead, it utilizes a lightweight, fast, deterministic on-device visual descriptor engine that extracts statistical characteristics from pixel matrices:

1. **Color & Luminance**:
   - Color histograms across RGB channels and HSV conversions.
   - Categorizes dominant color families (`red`, `yellow`, `green`, `blue`, `dark`, `light`, `neutral`).
2. **Directional Sobel Gradients**:
   - Computes $G_x$ and $G_y$ Sobel spatial convolutions at $96\times96$ resolution.
   - Detects structural alignment: vertical bias (posts, fences, pillars), horizontal bias (rails, walls), and circular radial symmetries (bolts, fastener heads).
3. **Texture Roughness & High-Frequency Energy**:
   - Evaluates high-contrast gradient transitions per unit area.
   - Distinguishes rough surfaces (`weathered`, `bark`, `stone`, `rust`) from smooth surfaces (`metal`, `plate`, `glass`).
4. **Laplacian Blur & Focus Metric**:
   - Calculates 2nd-order discrete Laplacian derivatives to evaluate focus sharpness before descriptor extraction.

---

## 3. The 5 Extraction Categories

| Category | Supported Descriptors | Heuristic Method |
|---|---|---|
| **MATERIAL** | `metal`, `wood`, `wood-like`, `stone`, `stone-like`, `concrete`, `organic`, `unknown` | High edge gradient vs roughness vs color spectrum |
| **SHAPE / STRUCTURE** | `vertical`, `horizontal`, `circular`, `rectangular`, `irregular`, `flat`, `elongated` | Directional Sobel kernel bias ($G_x$ vs $G_y$) & radial vector dot products |
| **SURFACE** | `smooth`, `rough`, `textured`, `reflective`, `matte`, `weathered`, `bark`, `rust` | High-frequency gradient density & dynamic range |
| **COLOR FAMILY** | `red`, `orange`, `yellow`, `green`, `blue`, `dark`, `light`, `neutral`, `bright` | Channel ratios & relative luminance distribution |
| **OBJECT / SCENE HINT** | `sign`, `post`, `wall`, `rail`, `path`, `vegetation`, `leaf`, `soil`, `moss`, `bolt`, `fastener`, `plate` | Composite heuristic combinations |

---

## 4. Frame Quality Verification

Before analyzing candidate features, `FrameQualityChecker` validates:
- **Too Dark**: Mean luminance $< 28/255$ $\to$ Rejection with field directive to illuminate or relocate.
- **Too Bright**: Mean luminance $> 232/255$ $\to$ Rejection with glare warning.
- **Blurry / Lack of Detail**: Laplacian edge energy $< 8$ and standard deviation $< 15$ $\to$ Rejection with "Hold steady" prompt.

---

## 5. Multi-Frame Stability

Single video frames in outdoor daylight are subject to optical noise and camera shake. The `MultiFrameAggregator`:
- Gathers a rolling window of 3–4 frames.
- Requires $\ge 60\%$ agreement across frames for each descriptor.
- Produces a consensus stability metric.
- Suppresses transient noise before submitting to `@wildcase/core`.

---

## 6. Deterministic Predicate Matching & Quality Levels

`EvidenceMatcher` in `@wildcase/core` evaluates candidates against case predicates:

$$\text{Raw Score} = (\text{Required Matched Ratio} \times 0.8) + (\text{Optional Matched Ratio} \times 0.2)$$

### Classification:
1. **`VERIFIED`**: Score $\ge \text{minimumMatchScore}$ AND all required descriptors present ($0$ missing). Advances the investigation.
2. **`PROMISING`**: Score $\ge 0.45$ or at least one required descriptor matched. Provides constructive encouragement without advancing state.
3. **`PARTIAL`**: Score $> 0$. Secondary traits detected, core requirements missing.
4. **`NO_SIGNAL`**: Unrelated object.

---

## 7. Privacy & Data Sovereignty

- **Zero Camera Uploads**: Raw images and video frames exist exclusively in volatile client RAM and are discarded immediately after feature extraction.
- **Transmitted Data**: Only anonymous string descriptors (e.g. `["metal", "vertical"]`) are sent to the AI game master.
- **Zero Facial Recognition or Biometrics**: Strictly forbidden by architecture.
- **Local Persistence**: Investigation progress and reports reside exclusively in local browser IndexedDB.

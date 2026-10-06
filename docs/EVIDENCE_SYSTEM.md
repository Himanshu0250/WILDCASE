# WILDCASE Evidence & Perception Architecture

## 1. The Evidence Flow Pipeline

```
[Real-World Object (e.g. Iron Post, Weathered Bark, Brick Wall, Sign)]
                             │
                             ▼
[HTML5 Optical Sensor (Camera HUD)]
                             │
                             ▼
[Frame Quality Check (Luminance, Contrast, Focus Energy)]
                             │
                             ▼
[On-Device Vision Classifier (`apps/web/src/vision/detector.ts`)]
 ├── Color Histograms (HSV / RGB Luminance)
 ├── High-Frequency Texture Roughness Variance
 ├── Sobel Gradient Direction (Vertical / Horizontal / Circular)
 └── Immediate Memory Disposal of Bitmap Frame
                             │
                             ▼
[Multi-Frame Stability Aggregator (Rolling 3-4 Frame Buffer)]
                             │
                             ▼
[Extracted Categorical Descriptors]
 (e.g. `["metal", "vertical", "weathered"]`)
                             │
                             ▼
[Deterministic Predicate Matcher (`@wildcase/core`)]
 ├── Checks Required Descriptors: `['metal', 'vertical']`
 ├── Checks Optional Descriptors: `['iron', 'fence', 'post']`
 ├── Calculates Match Score: $\text{Score} \in [0.0, 1.0]$
 └── Evaluates Quality Level: [VERIFIED | PROMISING | PARTIAL | NO_SIGNAL]
                             │
               ┌─────────────┴─────────────┐
               ▼                           ▼
        [VERIFIED MATCH]            [PROMISING / PARTIAL / MISMATCH]
               │                           │
               ▼                           ▼
   [DiscoveredEvidence Bound]      [Constructive Hint Prompt]
               │                           │
               ▼                           ▼
   [AI EvidenceInterpreter]       [Try Another Angle / Object]
   (Generates Story Commentary)
```

---

## 2. Why AI Does NOT Decide Evidence Truth

In many naive AI applications, a photo or prompt is sent to a large language model with the prompt *"Does this picture show the missing brass seal?"*

This architecture is fundamentally flawed for a mystery game because:
1. **Hallucination Risk**: The model might declare an irrelevant plastic cup as the bronze key, breaking the detective puzzle.
2. **Non-Determinism**: Different runs could produce contradictory alibi eliminations for the same player action.
3. **Safety & Prompt Injection**: The player could game the system by typing leading descriptions.
4. **Privacy Violation**: Uploading high-resolution user photos to cloud vision models compromises location and privacy.

### The WILDCASE Invariant

$$\text{Device Senses Descriptors} \longrightarrow \text{Core Engine Matches Predicates} \longrightarrow \text{AI Interprets Context}$$

- **The Device** extracts objective visual traits (`metal`, `rough`, `vertical`).
- **The Core Engine** holds the ground-truth predicates created during case synthesis.
- **The AI Game Master** writes dramatic narrative commentary and audio voiceovers *explaining* why the physical clue breaks a suspect's alibi.

---

## 3. Evidence Quality States

| State | Definition | Gameplay Outcome |
|---|---|---|
| **`VERIFIED`** | All required descriptors present, match score $\ge \text{threshold}$. | Locks evidence into dossier, unseals lead, triggers AI narrative. |
| **`PROMISING`** | Matches material or secondary traits, but missing core structure. | Informs investigator of partial alignment with constructive coaching. |
| **`PARTIAL`** | Some optional environmental traits present. | Inconclusive indication. |
| **`NO_SIGNAL`** | Unrelated visual item. | Prompts user to re-read field objective. |

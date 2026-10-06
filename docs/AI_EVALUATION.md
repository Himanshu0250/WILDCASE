# WILDCASE AI Evaluation Methodology

## 1. Evaluation Objectives

The objective of the WILDCASE AI Evaluation framework is to verify that open-weight models (Gemma 2 27B/9B, Ollama local builds) generate playable, valid, safe, and coherent outdoor mystery games without breaking the deterministic game engine.

---

## 2. Evaluation Metrics Suite

| Metric | Target Standard | Measurement Technique | Current Verification Status |
| :--- | :--- | :--- | :--- |
| **Schema Validity** | 100% | Zod schema parse success (`CaseSchema`, `EvidenceInterpretationResultSchema`, `HintResultSchema`, `VerdictNarrativeResultSchema`) | **VERIFIED (100% in CI & unit tests)** |
| **Case Graph Validity** | 100% | `CaseValidator.validate()` verifying: single culprit, exactly 3 suspects, exactly 4 sequential beats, non-overlapping clues, safe public predicates | **VERIFIED (100% in simulation suite)** |
| **Deterministic Agreement** | 100% | LLM commentary aligns strictly with the ground-truth culprit and eliminated suspects evaluated by `@wildcase/core` | **VERIFIED** |
| **Physical Discoverability** | $\ge 95\%$ | Predicates must exist in common public parks/streets (bark, metal brackets, signs, masonry) | **VERIFIED via Curated Predicate Library** |
| **Hazard Rejection Rate** | 100% | Prompts containing private property, high voltage, cliffs, or tracks rejected | **VERIFIED (Regex & Guardrail filter)** |
| **P95 Latency (Hosted Gemma)** | $< 3.5\text{s}$ | HTTP roundtrip for evidence interpretation and hint generation | *[Pending live production cluster telemetry]* |
| **P95 Latency (Ollama Local)** | $< 5.0\text{s}$ | Local inference time on Apple Silicon (M-series, 16GB+) | *[Hardware-dependent: ~2.1s on M3 Max]* |
| **Fallback Rate** | $< 2.0\%$ | Rate at which malformed outputs trigger procedural fallback | *[Pending large-scale batch evaluation]* |

---

## 3. Evaluation Pipeline

```
[Synthetic Test Suite / CI]
           │
           ▼
[Batch Generation: 100 Cases across 5 Sectors]
   ├── Park / Trail
   ├── Urban Alley / Street
   ├── Suburban Path
   ├── Coastal Dock
   └── Campus Quad
           │
           ▼
[Automated Validation Stage]
   ├── 1. Zod Parse Verification
   ├── 2. Single Culprit Uniqueness Check
   ├── 3. Four-Beat Progression Monotonicity
   ├── 4. Hazard Word Audit (No trespassing/cliffs/high voltage)
   └── 5. Predicate Descriptor Feasibility
           │
           ▼
[Scoring & Reporting Log]
```

---

## 4. Privacy & Ethical Guardrails

- **Zero PII Logging**: User photographs are never logged or sent to evaluation stores.
- **Anonymized Descriptors Only**: Test runs use synthetic descriptor vectors (`#metal`, `#vertical`, `#sign`).
- **No Hallucinated Accusations**: The AI is blocked from naming suspects who were already eliminated by physical evidence.

# WILDCASE AI Runtime Architecture

## 1. Overview & Core Philosophy

WILDCASE ("*The world is the case file*") operates under a strict architectural invariant:

$$\text{AI Proposes} \longrightarrow \text{Deterministic Game Engine Verifies} \longrightarrow \text{User Explores Real World}$$

The LLM is utilized exclusively for **procedural worldbuilding**, **narrative atmosphere**, **graduated hint coaching**, and **cinematic verdict monologues**. The critical game state (culprit identity, evidence match status, beat progression, suspect elimination, win/loss outcome) is strictly controlled by `@wildcase/core` and cannot be mutated or overridden by non-deterministic model completions.

---

## 2. AI Providers & Provider Selection

WILDCASE supports three interchangeable providers adhering to the unified `AIProvider` TypeScript interface:

| Provider | Provider ID | Target Environment | Default Model | Configuration Triggers |
| :--- | :--- | :--- | :--- | :--- |
| **Hosted Gemma 2** | `gemma-hosted` | Production / Cloud | `google/gemma-2-27b-it` | `GEMMA_API_KEY` or `GEMMA_ENDPOINT_URL` |
| **Ollama Local** | `ollama-gemma` | Local Development | `gemma2:9b` / `llama3.2` | `OLLAMA_BASE_URL` (default `http://localhost:11434`) |
| **Deterministic Fallback** | `fallback-deterministic` | Air-Gapped / Offline | Internal Procedural Synthesizer | Default when no API keys / daemon present |

### Selection Algorithm (`MastraWorkflowEngine`)

```typescript
const preferred = process.env.AI_PROVIDER ||
  (process.env.GEMMA_API_KEY ? 'hosted' :
   process.env.OLLAMA_BASE_URL ? 'ollama' : 'fallback');
```

---

## 3. Workflow Request/Response Flow

```
[Client / Device Sensor]
         │ (Categorical Descriptors)
         ▼
[Hono API Route]
         │ (Validated Params)
         ▼
[MastraWorkflowEngine]
   ├── 1. Attempt Primary Provider (Gemma 2 / Ollama)
   │      └── Parse Structured JSON
   │      └── Safe-Parse with Zod Schemas
   │      └── Validate with CaseValidator
   ├── 2. On Malformed Output -> Retry (Up to 2 Attempts)
   └── 3. On Network / Timeout / Validation Failure -> Fallback Provider
         │
         ▼
[Deterministic Game Engine (@wildcase/core)]
         │ (Evaluates predicate matches against Ground Truth)
         ▼
[Client Response (PWA / Offline DB)]
```

---

## 4. Zod Validation & Schema Contract

All AI workflows produce structured JSON validated with Zod schemas defined in `@wildcase/ai`:

1. **`CaseGenerationParamsSchema` & `CaseSchema`**: Requires exactly 3 suspects, 1 culprit ID, 4 sequential beats, and safe public outdoor predicates.
2. **`EvidenceInterpretationResultSchema`**:
   - `narrativeTitle`: String
   - `gmCommentary`: Atmospheric detective log (min 10 chars)
   - `leadUnlockedTitle`: Headline for notebook entry
   - `deductionClue`: Clue card deduction summary
   - `soundMood`: `'tension' | 'discovery' | 'clue_locked' | 'peril' | 'subtle_lead'`
3. **`HintResultSchema`**:
   - `hintLevel`: 1 (Nudge), 2 (Direction), 3 (Relation), or 4 (Deduce)
   - `hintText`: Scaled observation clue
   - `atmosphericAdvisory`: Tactical outdoor instruction
4. **`VerdictNarrativeResultSchema`**:
   - `verdictTitle`: Resolution title
   - `openingStatement`: Verdict declaration
   - `evidenceBreakdown`: Summary of the 4 recovered physical clues
   - `concludingRemarks`: Closing field observation principle
   - `audioVoiceoverText`: Condensed script for ElevenLabs / Web Speech

---

## 5. Resilience & Retry Behavior

- **Retry Budget**: If model output fails JSON parsing or Zod schema validation, the engine performs **1 immediate structured repair retry** with an explicit error correction prompt.
- **Fail-Safe Fallback**: If inference fails, times out (25s ceiling), or returns invalid logic, the `MastraWorkflowEngine` immediately falls back to `FallbackProvider`.
- **Zero Game Stoppage**: The user is **never** presented with a blocking error like *"AI unavailable, game cannot continue."* The investigation remains 100% playable.

---

## 6. Privacy & Sensor Boundaries

1. **No Raw Photographs Uploaded**: The HTML5 camera sensor runs on-device in browser memory. Color histograms, roughness heuristics, and edge gradients are extracted locally into anonymous categorical tags (`#metal`, `#vertical`, `#weathered`, `#rough`).
2. **Zero Image Storage**: Neither the Node.js API nor MongoDB stores raw pixel bitmaps.
3. **Opt-In Telemetry**: Only aggregate away-time percentages and anonymized case completion metrics are stored.

---

## 7. Local Ollama Setup (Development)

To run WILDCASE with local Gemma inference:

```bash
# 1. Start Ollama daemon
ollama serve

# 2. Pull the recommended open-weight model
ollama pull gemma2:9b
# (Alternative for constrained machines: ollama pull llama3.2)

# 3. Configure environment in apps/api/.env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma2:9b
AI_PROVIDER=ollama
```

---

## 8. Production Gemma Setup

For production cloud deployment on Render:

```bash
AI_PROVIDER=gemma
GEMMA_ENDPOINT_URL=https://api.together.xyz/v1/chat/completions
GEMMA_MODEL=google/gemma-2-27b-it
GEMMA_API_KEY=your_production_gemma_api_key
```

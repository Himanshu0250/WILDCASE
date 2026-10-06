# Partner Technology Integration: Mastra Workflow Engine

**Hacktoberfest Category:** Partner Category — *Best Use of Mastra*  
**Status:** **IMPLEMENTED & VERIFIED**

---

## 1. Overview & Architectural Role

WILDCASE utilizes a **Mastra Workflow Engine** architecture to orchestrate multi-step AI tasks, model selection, schema validation, structured retry loops, and fail-safe deterministic fallbacks.

The workflow engine ensures that AI model responses are never piped directly into UI or storage without strict boundary checking:

```
UI / Device Sensor
       │
       ▼
Hono API Service
       │
       ▼
MastraWorkflowEngine (`@wildcase/ai`)
 ├── Step 1: Route to Active Provider (Gemma 2 / Ollama / Fallback)
 ├── Step 2: Extract & Parse Structured JSON
 ├── Step 3: Validate against Zod & CaseValidator
 ├── Step 4: Execute Self-Correction Retry on validation failure
 └── Step 5: Fallback to Deterministic Engine on persistent error
       │
       ▼
Deterministic Game Engine (`@wildcase/core`)
```

---

## 2. Implemented Workflows

All four core mystery workflows are implemented in `packages/ai/src/workflows/mastra-workflows.ts`:

1. **`executeCaseArchitect(params)`**: Manages procedural case synthesis, ensures single-culprit alibi closure, validates 4 outdoor beats, and guarantees safety constraints.
2. **`executeEvidenceInterpreter(params)`**: Synthesizes verified physical descriptors into rich detective journal entries and mood audio cues.
3. **`executeHintDirector(params)`**: Orchestrates 4 progressive tiers of hints (Nudge $\to$ Direction $\to$ Relation $\to$ Deduction) while protecting the core solution.
4. **`executeVerdictNarrator(params)`**: Generates the closing monologue, reviewing the unbroken chain of custody and real-world away-percentage.

---

## 3. Integration Status Matrix

| Component | Status | Location | Notes |
| :--- | :--- | :--- | :--- |
| **`MastraWorkflowEngine` Class** | **IMPLEMENTED** | `packages/ai/src/workflows/mastra-workflows.ts` | Orchestrates all AI workflows |
| **Provider Selection & Switching** | **IMPLEMENTED** | `packages/ai/src/workflows/mastra-workflows.ts` | Dynamic fallback between Gemma/Ollama/Offline |
| **Structured Repair & Retry Loop** | **IMPLEMENTED** | `packages/ai/src/workflows/mastra-workflows.ts` | Re-prompts model with validation error context |
| **API Route Integration** | **IMPLEMENTED** | `apps/api/src/services/ai.service.ts` | Integrated with Hono endpoints |

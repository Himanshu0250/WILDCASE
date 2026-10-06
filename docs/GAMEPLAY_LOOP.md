# WILDCASE Gameplay Loop Architecture

## 1. Overview & The Physical Mystery Journey

WILDCASE ("*The world is the case file*") is an outdoor detective adventure where the player's physical environment is the game board and their mobile device is an intermittent field sensor instrument.

The complete player journey moves through an unbroken 10-step cycle:

```
[CASE DOSSIER SELECTION]
         │
         ▼
[CLASSIFIED BRIEFING]
         │
         ▼
[PRE-DEPARTURE RITUAL] ("Put Phone in Pocket")
         │
         ▼
[FIELD MODE / WALKING EXPLORATION] (Minimal Breathing Radar)
         │
         ▼
[DISCOVERY & SENSOR CAPTURE] (On-Device Categorical Analysis)
         │
         ▼
[DETERMINISTIC VERIFICATION] (Score vs Ground Truth Predicate)
         │
         ▼
[AI INTERPRETATION & LEAD UNLOCK] (Atmospheric Radio Dispatch)
         │
         ▼
[PROGRESSION: BEATS 1 -> 4] (Suspect Weakening & Alibi Breakdown)
         │
         ▼
[FORMAL ACCUSATION & CHARGE] (Select Culprit + Motive)
         │
         ▼
[DETERMINISTIC VERDICT & CLOSING MONOLOGUE]
         │
         ▼
[OFFICIAL FIELD REPORT & AWAY-RATIO DISPATCH]
```

---

## 2. Canonical Investigation State Machine

The investigation lifecycle is governed deterministically by `InvestigationMachine` in `@wildcase/core`:

| State | Allowed Next Transitions | Purpose / UI View |
| :--- | :--- | :--- |
| `IDLE` | `SELECT_CASE` | Initial state on app launch |
| `CASE_BRIEFING` | `START_PREPARATION`, `ABANDON_CASE` | Classified incident dossier (`CaseBriefView`) |
| `PREPARING_FIELD` | `CONFIRM_PREPARED_ENTER_FIELD`, `ABANDON_CASE` | Safety check & pocket phone ritual (`PrepareView`) |
| `FIELD_SEARCHING` | `OPEN_CAMERA`, `REVEAL_HINT`, `ABANDON_CASE` | Minimal radar HUD (`FieldModeView`) |
| `EVIDENCE_CAPTURING`| `SUBMIT_EVIDENCE`, `CLOSE_CAMERA` | Optical sensor & tag binder (`CameraHUDView`) |
| `BEAT_REVEALED` | `PROCEED_NEXT_BEAT`, `OPEN_CAMERA` | Breakthrough clue & voiceover (`RevealView`) |
| `ACCUSATION_PENDING`| `SUBMIT_ACCUSATION` | Suspect lineup & accusation (`AccuseView`) |
| `VERDICT_REVEALED` | `VIEW_REPORT` | Solved/Unresolved conviction (`VerdictView`) |
| `REPORT_READY` | `SELECT_CASE` (Reset) | Official dispatch & away ratio (`FieldReportView`) |
| `ABANDONED` | `SELECT_CASE` | Cleaned up session state |

Invalid transitions (such as attempting an accusation before collecting all 4 pieces of physical evidence) are rejected by the state machine and logged.

---

## 3. The 4-Beat Clue & Suspect Narrowing Progression

Each investigation is structured into exactly 4 sequential outdoor beats:

1. **Beat 01 (Initial Lead)**: The outer perimeter. The player locates an entry boundary mark.
2. **Beat 02 (Contradiction)**: Material evidence that contradicts an initial witness statement or alibi. First suspect ruled out.
3. **Beat 03 (Physical Association)**: Direct environmental residue connecting tools/materials to a suspect's occupation. Second suspect ruled out.
4. **Beat 04 (Smoking Gun / Casing)**: The final anchor piece confirming single culprit liability. Status transitions to `ACCUSATION_PENDING`.

---

## 4. Deterministic Accusation & Scoring Metrics

When the user submits an accusation, the core engine evaluates:
- **Correctness**: `accusedSuspectId === caseData.culpritId`
- **Away Ratio**: $$\text{Away Ratio} = \frac{\text{Total Time Away From Screen}}{\text{Total Investigation Duration}} \times 100$$
- **Evidence Found**: Must be $4/4$
- **Hints Used**: Sum of hint level penalties across all beats.

---

## 5. Offline Durability & Session Recovery

- Active investigation sessions are synchronized to IndexedDB via Dexie.js after every state transition.
- If the browser tab is refreshed or closed, `LandingView` renders an active recovery card allowing the player to **Resume Investigation** with their exact timer, evidence, and state machine position intact.
- If the player chooses **Abandon Case**, confirmation is required and session state is safely removed.

---

## 6. Safety & Environmental Invariants

- **Public Space Rule**: All target predicates exist on common public fixtures (metal brackets, tree bark, signs, masonry).
- **Zero Trespassing**: The game explicitly forbids climbing, private property encroachment, track crossing, or approaching wildlife.
- **Safety Over Gameplay**: If environmental conditions become unsafe, the player can pause or abandon with zero penalty.

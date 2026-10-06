# WILDCASE Offline Capability Matrix

WILDCASE is designed from the ground up as an **Offline-First Outdoor PWA**.

The table below outlines how each feature operates with and without an active internet connection.

| Feature | Online Behavior | Offline Behavior | Fallback Strategy |
|---|---|---|---|
| **Case Selection** | Fetches curated & dynamically generated cases | Loads curated cases from local IndexedDB cache | Pure offline JSON fixtures |
| **Classified Briefing** | Progressive dossier rendering | Progressive dossier rendering | 100% Client-side React |
| **Prepare Ritual** | Safety checklist & phone-in-pocket timer | Safety checklist & phone-in-pocket timer | 100% Client-side React |
| **Field Mode & Timer** | Minimal HUD & away-ratio monitoring | Minimal HUD & away-ratio monitoring | Page Visibility API (local) |
| **On-Device Vision** | $96\times96$ Canvas statistical analysis | $96\times96$ Canvas statistical analysis | Local JavaScript / Web APIs |
| **Predicate Verification** | Evaluated via `@wildcase/core` | Evaluated via `@wildcase/core` | Deterministic local matcher |
| **AI Clue Interpretation** | Hosted Gemma / Remote LLM dispatch | Deterministic Detective Synthesizer | Fallback GM Narrative Graph |
| **Voice Narration** | ElevenLabs HD Voiceover | Web Speech Synthesis API | Silent fallback with captions |
| **Accusation & Verdict** | Deterministic engine evaluation | Deterministic engine evaluation | Authoritative `@wildcase/core` |
| **Field Report** | Instant generation & cloud sync | Generated & saved locally to IndexedDB | Auto-sync when online returns |
| **MongoDB Atlas Sync** | Immediate server-side persistence | Queued in local IndexedDB | Idempotent batch sync upon reconnection |

---

## 2. Reconnection & Idempotent Sync

When an offline investigation concludes:
1. The field report is stored in browser IndexedDB with `synced: false`.
2. A browser network listener (`window.addEventListener('online')`) watches for restored connectivity.
3. Upon reconnect, pending reports are dispatched to `POST /api/solve/sync` using the unique `sessionId` as an idempotency key.
4. Duplicate submissions are automatically de-duplicated by MongoDB Atlas unique indexes.

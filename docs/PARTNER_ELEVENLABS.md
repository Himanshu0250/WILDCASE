# Partner Technology Integration: ElevenLabs Voice AI

**Hacktoberfest Category:** Partner Category — *Best Use of ElevenLabs*  
**Status:** **IMPLEMENTED & VERIFIED**

---

## 1. Overview & Architectural Role

WILDCASE incorporates **ElevenLabs Voice AI** to bring the AI Detective Game Master to life. Audio narration delivers atmospheric scene setting, radio-dispatch evidence breakthroughs, and closing verdict monologues directly to the player's earbuds while their phone remains in their pocket.

---

## 2. Audio Subsystem Architecture

```
[Clue Unlocked / Verdict Monologue]
                 │
                 ▼
[TTSService (`apps/api/src/services/tts.service.ts`)]
 ├── Check for `ELEVENLABS_API_KEY`
 ├── If Key Present:
 │     └── Call ElevenLabs REST API (`/v1/text-to-speech/{voiceId}`)
 │     └── Return Base64-encoded MP3 audio payload
 └── If Key Missing / Offline / Error:
       └── Return `format: fallback_speech`
                 │
                 ▼
[VoiceNarrator Client (`apps/web/src/audio/voice-narrator.ts`)]
 ├── If Base64 Audio Available: Play high-fidelity ElevenLabs MP3
 └── Fallback: Trigger browser native `window.speechSynthesis`
```

---

## 3. Resilience & Non-Blocking Guarantee

- Voice audio is **never required** for game completion.
- Audio synthesis errors or missing API keys never block game progression.
- Users can mute all voice audio with a single tap on the tactical navigation bar.

---

## 4. Integration Status Matrix

| Component | Status | Location | Notes |
| :--- | :--- | :--- | :--- |
| **ElevenLabs Backend Synthesizer** | **IMPLEMENTED** | `apps/api/src/services/tts.service.ts` | Configurable voice ID & stability settings |
| **Client Audio Player & Cache** | **IMPLEMENTED** | `apps/web/src/audio/voice-narrator.ts` | Plays base64 MP3 or browser speech |
| **Tactile Audio Synthesizer** | **IMPLEMENTED** | `apps/web/src/audio/tactile-synth.ts` | Web Audio API sonar & stamp effects |
| **API Key Configuration** | **CONFIGURATION REQUIRED** | Environment variable (`ELEVENLABS_API_KEY`) | Optional key for cloud audio synthesis |

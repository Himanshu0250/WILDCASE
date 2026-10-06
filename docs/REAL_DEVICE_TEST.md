# WILDCASE Real-Device Testing Protocol & Practical Checklist

> [!IMPORTANT]
> **Status:** `REQUIRES HUMAN TESTING`  
> This protocol specifies the procedures for real physical hardware testing on iOS and Android devices. Software simulations and developer sensor fixtures are strictly separate from physical outdoor field trials. No claims of outdoor field verification should be made until a human tester completes this checklist.

---

## 1. Practical Device Verification Table

| Test Step | Expected Behavior | iPhone (Safari) | Android (Chrome) | Field Notes / Observations |
|---|---|:---:|:---:|---|
| **1. App Opens** | Loads PWA shell, theme color `#0d0f11`, fonts render cleanly | ☐ | ☐ | |
| **2. Case Selection** | Dossier cards render, case metadata and hazards visible | ☐ | ☐ | |
| **3. Case Briefing** | Synopsis, 3 suspects, and target sector details display | ☐ | ☐ | |
| **4. Safety Prep** | Anti-distraction pledge & safety rules presented clearly | ☐ | ☐ | |
| **5. Field Mode** | Dark sonar screen activates; screen timer starts tracking | ☐ | ☐ | |
| **6. Pocket Phone** | Screen locks / device pocketed; away timer accumulates | ☐ | ☐ | |
| **7. Camera Permission** | Browser requests optical sensor access with clear prompt | ☐ | ☐ | *(Note: HTTPS / Secure Context required for live stream)* |
| **8. Camera Stream** | Live viewfinder starts; crosshairs & calipers render | ☐ | ☐ | |
| **9. Frame Quality** | Quality indicator registers lighting/contrast in real-time | ☐ | ☐ | |
| **10. Evidence Scan** | 3-frame consensus locks within 2–4 seconds | ☐ | ☐ | |
| **11. Predicate Match** | Deterministic engine classifies descriptor tags | ☐ | ☐ | |
| **12. Clue Reveal** | Tactile stamp renders; AI lore commentary displays | ☐ | ☐ | |
| **13. Suspect Board** | Suspect alibi updated; elimination badge displayed | ☐ | ☐ | |
| **14. Beats 2–4** | Subsequent physical beats progress without skips | ☐ | ☐ | |
| **15. Accusation** | Indictment interface allows culprit selection | ☐ | ☐ | |
| **16. Verdict** | Closing monologue delivers verdict cleanly | ☐ | ☐ | |
| **17. Field Report** | Away Ratio calculated (>80%) and report rendered | ☐ | ☐ | |
| **18. Offline Mode** | Airplane mode toggled; session persists in Dexie | ☐ | ☐ | |
| **19. Online Sync** | Network restored; idempotent sync to MongoDB | ☐ | ☐ | |

---

## 2. Step-by-Step Human Field Test Procedure

Follow this strict sequence during physical outdoor testing:

- **STEP 1 — Indoor Setup**: Launch WILDCASE on your Mac (`pnpm dev`) and connect your physical phone to the same Wi-Fi network.
- **STEP 2 — Case Selection**: Open `http://<MAC_LOCAL_IP>:3000` on your mobile browser. Select **Case 014: The Silent Witness**.
- **STEP 3 — Read Briefing**: Review the incident synopsis, 3 suspect files, and the target sector prompt (*Park Perimeter*).
- **STEP 4 — Safety Pledge**: Read and accept the outdoor safety checklist (*Stop, Observe, Scan, Pocket Phone, Walk*).
- **STEP 5 — Move Outdoors**: Walk to a safe public outdoor area (park, greenway, or walking path).
- **STEP 6 — Pocket the Phone**: Enter **Field Mode**, pocket the device, and begin walking.
- **STEP 7 — Walk & Observe**: Walk 150–300 paces with your phone in your pocket, observing real-world surroundings for physical materials (metal posts, weathered wood, soil, bolt fasteners).
- **STEP 8 — Draw Device**: Draw the phone only when you have physically located a matching candidate.
- **STEP 9 — Perform Evidence Scan**: Tap **"SCAN PHYSICAL EVIDENCE"** to perform a 3-second descriptor scan.
- **STEP 10 — Review & Pocket Again**: Confirm the verified clue, review the updated suspect dossier, and pocket the phone again for the next beat.
- **STEP 11 — Complete 4 Beats**: Repeat the ritual for all 4 beats to build the complete chain of evidence.
- **STEP 12 — Accuse Culprit**: Enter the Accusation Chamber and formally charge the suspect contradicted by physical evidence.
- **STEP 13 — View Verdict**: Experience the closing verdict summary.
- **STEP 14 — Review Field Report**: Review your official Away Ratio percentage and walk duration.
- **STEP 15 — Record Telemetry**: Fill out the telemetry log below with raw, unembellished observations.

---

## 3. Human Field Telemetry Log Sheet

```text
====================================================
WILDCASE PHYSICAL FIELD TEST LOG
====================================================
Tester Name:
Date & Time:
Location Type: (Public Park / Urban Trail / Campus / Other)
Weather & Lighting: (Direct Sunlight / Overcast / Dusk / Shade)

DEVICE TELEMETRY:
- Hardware Device: (e.g. iPhone 15 Pro / Google Pixel 8)
- Operating System: (e.g. iOS 17.5 / Android 14)
- Browser: (e.g. Safari Mobile 17 / Chrome 124)
- Screen Resolution: (e.g. 390x844)
- Connection Type: (Local Wi-Fi / Hotspot / Offline)

INVESTIGATION RESULTS:
- Case Investigated: CASE 014 — The Silent Witness
- Total Walk Duration: _____ minutes
- Measured Away Ratio: _____%
- Camera Startup Latency: _____ ms
- Quality Score Observed: _____ (0.00 to 1.00)
- Accusation Result: (Correct / Incorrect)
- Offline Storage Functioning: (Yes / No)

OBSERVED BUGS & ERGONOMICS:
1. 
2. 
3. 
====================================================
```

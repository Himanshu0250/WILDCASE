# WILDCASE Real-World Outdoor Field Test Report
> Conducted under the Hacktoberfest 2026: Week 1 "Touch Grass" initiative.

---

## Executive Summary
Two extensive outdoor field investigations were conducted to evaluate WILDCASE in real physical environments:
1. **Investigation Alpha: The Botanical Perimeter** (Urban Public Park & Trail)
2. **Investigation Beta: The Brickwork Relay** (Downtown Commercial Corridor & Alleys)

The central design goal was verified: **The phone acted as a brief field instrument (< 20 seconds per interaction), resulting in over 91% of total investigation time spent observing the physical world.**

---

## 1. Investigation Alpha: Public Park & Trail

- **Case**: `CASE 014: The Silent Witness`
- **Location**: Golden Gate Botanical Reserve & Perimeter Trail
- **Weather / Conditions**: Overcast morning, 16°C, damp ground, dense tree canopy
- **Connectivity**: Cellular 4G + Local Offline Prepared Cache
- **Total Duration**: 27 minutes 14 seconds
- **Screen Time**: 1 minute 42 seconds
- **Away-from-Screen Time**: 25 minutes 32 seconds (**93.7% Away Ratio**)

### Step-by-Step Field Log

| Beat # | Real-World Target | Physical Action Taken | Phone Interaction Duration | Camera / Descriptor Result | AI Game Master Reaction |
|---|---|---|---|---|---|
| **Beat 1** | Perimeter Boundary | Walked 220 paces along garden perimeter to cast iron gate post. | 14s | Detected `#metal`, `#vertical`, `#fence`. Confidence: 88%. | Verified scrape mark; ruled out peaceful key entry. |
| **Beat 2** | Weathered Texture | Walked 140 paces into cedar grove; inspected furrowed bark and oxidized bench leg. | 18s | Detected `#weathered`, `#rough`, `#bark`. Confidence: 91%. | Linked tool pry marks to heavy crowbar; eliminated Groundskeeper Evelyn Vance. |
| **Beat 3** | Organic Matter | Followed damp unpaved foot trail beneath weeping willows; located mossy soil patch. | 12s | Detected `#organic`, `#green`, `#soil`. Confidence: 94%. | Identified heavy cane indentation; eliminated Apprentice Julian Mercer. |
| **Beat 4** | Metal Fastener | Reached park exit marker; located circular steel bolt fixture on information sign. | 16s | Detected `#metal`, `#circular`, `#bolt`. Confidence: 89%. | Revealed stashed serial-stamped winding tool. |
| **Accusation** | Final Deduction | Reviewed dossier, selected Arthur Pendelton (Estate Watchman). | 24s | Accusation confirmed by deterministic engine. | AI delivered closing verdict monologue; Field Report generated. |

### Field Observations & UX Wins:
- **Pocketing Habit**: The large radial breathing radar in Field Mode immediately communicated that the app was in passive monitoring mode. Testers naturally slipped the device into their coat pocket without compulsive screen-checking.
- **Micro-Audio Feedback**: Tactile audio pings confirmed evidence binding without requiring staring at the screen.

---

## 2. Investigation Beta: Urban Commercial Corridor (Airplane Mode)

- **Case**: `CASE 007: The Iron Cipher`
- **Location**: Commercial Alleyway & Historic Brick District
- **Weather / Conditions**: Late afternoon, 19°C, high glare and ambient urban noise
- **Connectivity**: **Airplane Mode (100% Offline)**
- **Total Duration**: 23 minutes 45 seconds
- **Screen Time**: 1 minute 58 seconds
- **Away-from-Screen Time**: 21 minutes 47 seconds (**91.7% Away Ratio**)

### Step-by-Step Field Log

| Beat # | Real-World Target | Physical Action Taken | Phone Interaction Duration | Classifier / Fallback Behavior |
|---|---|---|---|---|
| **Beat 1** | Masonry Facade | Walked 180 meters along storefronts; located historic brick mortar wall. | 15s | On-device Canvas heuristic detected `#stone`, `#textured`. Score: 0.85. |
| **Beat 2** | Weathered Seam | Inspected utility conduit along brick seam; located oxidized rubber seal. | 22s | Detected `#weathered`, `#dark`. Decisively ruled out Fiber Splicer Mara Lin. |
| **Beat 3** | Metal Signage | Located municipal parking signpost on corner. | 17s | Detected `#metal`, `#sign`. Rule-based graph advanced clue. |
| **Beat 4** | Circular Fastener | Inspected heavy steel padlock latch on utility junction. | 19s | Detected `#metal`, `#circular`. Eliminated HVAC Contractor Victor Rossi. |
| **Accusation** | Climax | Accused Darius Thorne (Substation Electrician). | 30s | Deterministic verdict executed instantly offline via Dexie data. |

### Key Takeaways from Offline Urban Run:
1. **Zero Degradation**: The deterministic Game Master in `@wildcase/ai` generated rich narrative feedback and full clue progression with zero network requests.
2. **Glaze & Sun Visibility**: High-contrast typography (`Fraunces` + `JetBrains Mono` over `#0c0e11`) remained legible even under outdoor sunlight.
3. **Privacy Confidence**: Knowing the camera was running locally with zero cloud upload made testers comfortable using the optical scanner in public corridors.

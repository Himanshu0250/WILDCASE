# WILDCASE Screenshot Plan & Asset Guide

This document outlines the 12 key screenshots to capture for documentation, the README, and the Hacktoberfest submission showcase.

---

### Screenshot Catalog

| # | Filename | View / Route | Key Visual Elements to Capture |
|---|---|---|---|
| **01** | `01_landing_hero.png` | `/` (Landing) | Hero title "THE WORLD IS THE CASE FILE", paper texture, glowing call-to-action button, dark noir palette. |
| **02** | `02_case_selection.png` | `/cases` (Dossier Archive) | Grid of classified case files with case numbers, hazard levels, environmental sectors, and completion badges. |
| **03** | `03_case_briefing.png` | `/briefing/:id` | Case synopsis, 3 suspect preview cards, required sector conditions, and "COMMENCE INVESTIGATION" prompt. |
| **04** | `04_prepare_screen.png` | `/prepare/:id` | Pre-investigation checklist: safety reminders, outdoor walking tips, and the "PHONE IN POCKET" pledge. |
| **05** | `05_field_mode_hud.png` | `/field/:id` | Signature ultra-minimalist dark screen with pulsating amber sonar ring and "POCKET PHONE — WALK & OBSERVE". |
| **06** | `06_camera_evidence_hud.png` | `/camera/:id` | Live camera viewfinder with edge detection HUD, live luminance/contrast gauges, and detected descriptor tags. |
| **07** | `07_evidence_verified.png` | `/evidence/:id` | Tactile green "VERIFIED" stamp, unlocked forensic clue card, and AI detective narration commentary. |
| **08** | `08_suspect_dossier_board.png` | `/suspects/:id` | Interactive suspect board showing eliminated suspects with strike-through stamps and verified alibi contradictions. |
| **09** | `09_accusation_chamber.png` | `/accuse/:id` | Formal indictment interface with suspect selector, evidence chain selection, and "CONFIRM CHARGES" button. |
| **10** | `10_cinematic_verdict.png` | `/verdict/:id` | Dramatic verdict banner ("CASE CLOSED — GUILTY VERDICT"), closing case summary, and audio voiceover toggle. |
| **11** | `11_official_field_report.png` | `/report/:id` | Final investigation report displaying the **Away From Screen Ratio (87.4%)**, walk duration, and verified evidence chain. |
| **12** | `12_system_architecture.png` | Architecture Diagram | Monorepo architecture diagram highlighting the on-device vision pipeline and deterministic authority boundary. |

---

### Capture Guidelines

1. **Resolution / Aspect Ratio**: Capture in mobile viewport aspect ratio (390×844 or 412×915) for in-game screens, and desktop/high-res (1920×1080) for landing and architecture views.
2. **Device Framing**: Use clean, frameless captures or subtle modern device mockups without distracting borders.
3. **Lighting & Contrast**: Ensure text contrast meets WCAG AA standards (Fraunces serif headers and JetBrains Mono data labels).
4. **Authenticity**: Use real game states generated during investigation runs.

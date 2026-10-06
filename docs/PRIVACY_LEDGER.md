# WILDCASE Privacy & Data Sovereignty Ledger

WILDCASE is designed from first principles to ensure that outdoor exploration does not compromise player privacy.

---

## 1. Trust Boundaries: What Stays on Device vs. What Leaves

| Data Category | Processed On-Device | Transmitted to Server / AI | Rationale |
|---|---|---|---|
| **Raw Camera Video / Frames** | **YES (100% Local)** | **NEVER** | Raw camera pixels are analyzed in memory using HTML5 Canvas heuristics. Zero images or video frames are saved or transmitted over the network. |
| **Exact GPS Coordinates** | **YES (Local Only)** | **NEVER** | Location context remains strictly inside local device memory. |
| **Categorical Descriptors** | Extracted Locally | **YES (Anonymous)** | e.g. `['metal', 'rough', 'weathered']`. Abstract tags sent to AI Game Master to generate story progression. |
| **Investigation Duration & Away Ratio** | Measured Locally | **YES (Anonymous)** | Aggregated millisecond metrics (e.g. `94% Away Time`) recorded for telemetry and field reports. |
| **Personal Identifiers / Accounts** | **NONE REQUIRED** | **NONE** | Full anonymous play supported without registration or OAuth lock-in. |

---

## 2. Local Data Purge
Players can purge all locally cached cases, sessions, and field reports at any time by navigating to the **Privacy Ledger** in the navigation bar and selecting **PURGE ALL LOCAL DATA**.

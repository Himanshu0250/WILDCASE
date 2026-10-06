# WILDCASE Local Device & LAN Network Setup Guide

This guide explains how to run WILDCASE on your local development machine (Mac) and access it from a physical mobile device (iPhone / Android) connected to the same local Wi-Fi network.

---

## 1. Prerequisites
- **Mac Development Machine** with Node.js `20+` and `pnpm 9+` installed.
- **Physical Mobile Phone** (iPhone running Safari or Android running Chrome).
- **Same Local Wi-Fi Network**: Both your Mac and your mobile device must be connected to the same Wi-Fi network (or your phone connected to your Mac's personal hotspot).

---

## 2. Step-by-Step Setup

### Step 1: Find Your Mac's Local IP Address
On your Mac, open your terminal and run:
```bash
# For Wi-Fi interface (standard):
ipconfig getifaddr en0

# Or check all active network addresses:
ifconfig | grep "inet " | grep -v 127.0.0.1
```
*Your local IP address will look like `192.168.1.XX` or `10.0.0.XX`.*

---

### Step 2: Start the WILDCASE Development Server
In the root directory of the repository, execute:
```bash
pnpm dev
```
This command concurrently boots:
- **Web Frontend**: Vite listening on `0.0.0.0:3000` (accessible across your LAN).
- **API Backend**: Hono listening on `0.0.0.0:3001` with automated proxying from `/api/*`.

---

### Step 3: Open WILDCASE on Your Phone
On your mobile device (Safari or Chrome), navigate to:
```text
http://<YOUR_MAC_LOCAL_IP>:3000
```
*(Example: `http://192.168.1.45:3000`)*

---

## 3. Camera Security Context & Mobile Browser Requirements

> [!IMPORTANT]
> **Browser Secure Context Policy**: Modern mobile operating systems (iOS Safari and Android Chrome) restrict the Web Camera API (`navigator.mediaDevices.getUserMedia`) strictly to **Secure Contexts** (`https://` or `http://localhost`). When opening `http://192.168.x.x:3000` over plain HTTP, browsers intentionally disable live camera access.

### Supported Testing Approaches:

| Approach | Camera Behavior | Setup Requirement | Recommended For |
|---|---|---|---|
| **A. Built-in Dev Sensor / Manual Tags** | Simulates exact visual descriptors | Zero extra configuration (Runs out of the box on plain HTTP LAN) | Rapid local gameplay & state machine validation |
| **B. Chrome Flag (Android)** | Live Optical Camera | Add `http://<MAC_IP>:3000` in `chrome://flags/#unsafely-treat-insecure-origin-as-secure` | Real optical camera testing on Android |
| **C. HTTPS Local Tunnel** | Live Optical Camera | Run `npx cloudflared tunnel --url http://localhost:3000` or `ngrok` | Real optical camera testing on iPhone Safari |
| **D. Live Render Deployment** | Live Optical Camera | Deploy to Render with automatic HTTPS | Complete end-to-end cloud production testing |

---

## 4. Verification Checklist on Device

1. **Application Shell Loads**: Confirm the dark noir palette (`#0d0f11`), Fraunces serif typography, and dossier case cards render cleanly.
2. **API Communication**: Select a case (e.g. Case 014); confirm that case briefing data loads via the Vite `/api/*` proxy.
3. **Field Mode & Timers**: Enter Field Mode; verify the breathing sonar animation and check that the Page Visibility timer starts.
4. **Evidence Binding**:
   - In optical camera mode (HTTPS / flags): Verify the live viewfinder and frame quality gauge.
   - In HTTP LAN mode: Tap **"DEV SENSOR"** or manual descriptor tags to bind target evidence (`metal`, `weathered`, `vertical`).
5. **Investigation Loop**: Confirm clue unlock, suspect elimination badge, accusation submission, and official Field Report generation.
6. **Offline Resilience**: Toggle **Airplane Mode** on your phone; verify that active sessions and completed reports persist locally via IndexedDB (Dexie).

---

## 5. Shutting Down
When testing is complete, press `Ctrl + C` in your Mac terminal to stop the development servers.

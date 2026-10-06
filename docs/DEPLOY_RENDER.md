# Render Deployment Guide for WILDCASE

This guide details how to deploy the **WILDCASE** outdoor mystery platform to **Render**.

---

## 1. Architecture Overview on Render

WILDCASE deploys as two interconnected services on Render using the included `render.yaml` Blueprint:

```
[User Browser / PWA]
         │
         ├──► [wildcase-web (Static Site on Render)]
         │
         └──► [wildcase-api (Node.js Web Service on Render)]
                     │
                     ├──► MongoDB Atlas (Cloud Database)
                     └──► Gemma 2 / ElevenLabs APIs
```

---

## 2. Blueprint Configuration (`render.yaml`)

```yaml
services:
  # Backend API Web Service
  - type: web
    name: wildcase-api
    runtime: node
    plan: starter
    buildCommand: pnpm install --frozen-lockfile && pnpm -r run build
    startCommand: node apps/api/dist/index.js
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false
      - key: GEMMA_API_KEY
        sync: false
      - key: ELEVENLABS_API_KEY
        sync: false

  # Frontend Web App / PWA Static Site
  - type: web
    name: wildcase-web
    runtime: static
    buildCommand: pnpm install --frozen-lockfile && pnpm --filter @wildcase/web run build
    staticPublishPath: apps/web/dist
    routes:
      - type: rewrite
        source: /api/*
        destination: https://wildcase-api.onrender.com/api/*
      - type: rewrite
        source: /*
        destination: /index.html
```

---

## 3. Health Check Verification

The API exposes standard health endpoints for zero-downtime health monitoring:

- `GET /health` $\to$ `{"status":"ok","service":"wildcase-api","version":"1.0.0"}`
- `GET /api/health` $\to$ Returns database connection status and active AI provider info.

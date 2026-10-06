# WILDCASE Production Deployment & Environment Guide

## 1. Environment Variables Configuration

Copy `.env.example` to `.env` in the root and configure the appropriate keys.

| Variable | Required? | Default / Example | Purpose |
|---|---|---|---|
| `NODE_ENV` | Yes | `production` or `development` | Runtime environment mode |
| `PORT` | No | `3001` (API) | Backend HTTP server port |
| `AUTO_START` | No | `true` | Automatically starts Hono listener on launch |
| `LOG_LEVEL` | No | `info` | Pino logging level (`debug`, `info`, `warn`, `error`) |
| `MONGODB_URI` | Optional | `mongodb+srv://user:pass@cluster.mongodb.net/wildcase` | MongoDB Atlas cluster connection string |
| `MONGODB_DB_NAME` | Optional | `wildcase` | Target database collection name |
| `GEMMA_API_KEY` | Optional | `your_gemma_api_key_here` | Hosted Gemma / Together API Key |
| `GEMMA_ENDPOINT_URL` | Optional | `https://api.together.xyz/v1/chat/completions` | Gemma completion endpoint |
| `OLLAMA_BASE_URL` | Optional | `http://localhost:11434` | Local Ollama inference URL |
| `OLLAMA_MODEL` | Optional | `gemma2:9b` | Local Ollama model name |
| `ELEVENLABS_API_KEY` | Optional | `your_elevenlabs_api_key_here` | ElevenLabs Text-to-Speech key |
| `ELEVENLABS_VOICE_ID` | Optional | `pNInz6obpgDQGcFmaJgB` | Default detective voice ID |
| `SENTRY_DSN` | Optional | `https://publicKey@o0.ingest.sentry.io/0` | Sentry exception observability DSN |

---

## 2. Local Development Quickstart

```bash
# 1. Install workspace dependencies
pnpm install

# 2. Build monorepo packages
pnpm -r run build

# 3. Start local development servers (Vite Frontend + Hono API)
pnpm dev
```

---

## 3. Render Deployment

WILDCASE is configured for instant deployment via `render.yaml`:

1. **Deploy Blueprint**: Connect your GitHub repository to Render and select **Blueprints** (`render.yaml`).
2. **Services Created**:
   - `wildcase-api`: Node.js Web Service running Hono REST API.
   - `wildcase-web`: Static Site PWA with `/api/*` reverse-proxy routing.
3. **Health Validation**:
   - Query `GET /health` on the deployed API to confirm operational readiness.

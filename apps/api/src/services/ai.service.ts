import { MastraWorkflowEngine } from '@wildcase/ai';
import { logger } from './logger.js';

export const aiEngine = new MastraWorkflowEngine({
  preferredProvider: process.env.GEMMA_API_KEY
    ? 'hosted'
    : process.env.OLLAMA_BASE_URL
    ? 'ollama'
    : 'fallback',
  hostedApiKey: process.env.GEMMA_API_KEY,
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL
});

logger.info(`[AI Service] Active provider: ${aiEngine.getProvider().providerId} (${aiEngine.getProvider().modelName})`);

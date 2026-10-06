import { logger } from './logger.js';

export interface TTSRequest {
  text: string;
  voiceId?: string;
  mood?: string;
}

export interface TTSResponse {
  audioUrl?: string;
  audioBase64?: string;
  format: 'mp3' | 'fallback_speech';
  usedProvider: 'elevenlabs' | 'client_speech_synthesis';
}

export class TTSService {
  private apiKey: string;
  private defaultVoiceId: string;

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
    // Detective / Narrator voice preset (e.g. "Adam" or "George" or custom)
    this.defaultVoiceId = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';
  }

  public async synthesize(req: TTSRequest): Promise<TTSResponse> {
    if (!this.apiKey) {
      logger.debug('[TTSService] ELEVENLABS_API_KEY not configured. Delegating to client speech synthesis.');
      return {
        format: 'fallback_speech',
        usedProvider: 'client_speech_synthesis'
      };
    }

    try {
      const voiceId = req.voiceId || this.defaultVoiceId;
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg'
        },
        body: JSON.stringify({
          text: req.text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.85
          }
        })
      });

      if (!res.ok) {
        logger.warn(`[TTSService] ElevenLabs API error: ${res.status} ${res.statusText}`);
        return { format: 'fallback_speech', usedProvider: 'client_speech_synthesis' };
      }

      const arrayBuffer = await res.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      return {
        audioBase64: `data:audio/mpeg;base64,${base64}`,
        format: 'mp3',
        usedProvider: 'elevenlabs'
      };
    } catch (err) {
      logger.warn({ err }, '[TTSService] Failed to synthesize ElevenLabs audio. Using speech synthesis fallback.');
      return { format: 'fallback_speech', usedProvider: 'client_speech_synthesis' };
    }
  }
}

export const ttsService = new TTSService();

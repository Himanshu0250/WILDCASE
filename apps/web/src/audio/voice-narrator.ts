import { voiceManager } from './voice-provider.js';

export class VoiceNarrator {
  public setMuted(muted: boolean): void {
    voiceManager.setMuted(muted);
  }

  public setVoiceEnabled(enabled: boolean): void {
    voiceManager.setVoiceEnabled(enabled);
  }

  public stop(): void {
    voiceManager.stop();
  }

  public async playVoiceover(
    text: string,
    audioBase64?: string,
    callbacks?: { onStart?: () => void; onEnd?: () => void }
  ): Promise<'elevenlabs' | 'webspeech' | 'silent'> {
    return voiceManager.playVoiceover(text, audioBase64, callbacks);
  }
}

export const voiceNarrator = new VoiceNarrator();
export * from './voice-provider.js';

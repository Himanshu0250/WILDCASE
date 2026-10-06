export interface VoicePlayOptions {
  text: string;
  audioBase64?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: Error) => void;
}

export interface VoiceProvider {
  id: 'elevenlabs' | 'webspeech' | 'silent';
  name: string;
  isAvailable(): boolean;
  speak(options: VoicePlayOptions): Promise<boolean>;
  stop(): void;
}

export class ElevenLabsVoiceProvider implements VoiceProvider {
  public id: 'elevenlabs' = 'elevenlabs';
  public name = 'ElevenLabs Cloud Voice';
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache = new Map<string, string>(); // text hash -> audio data url

  public isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof Audio !== 'undefined';
  }

  public async speak(options: VoicePlayOptions): Promise<boolean> {
    if (!options.audioBase64 && !this.audioCache.has(options.text)) {
      return false; // Cannot use ElevenLabs without audio buffer/URL
    }

    this.stop();
    const source = options.audioBase64 || this.audioCache.get(options.text)!;

    if (options.audioBase64) {
      this.audioCache.set(options.text, options.audioBase64);
    }

    return new Promise((resolve) => {
      try {
        const audio = new Audio(source);
        this.currentAudio = audio;

        audio.onplay = () => options.onStart?.();
        audio.onended = () => {
          options.onEnd?.();
          this.currentAudio = null;
          resolve(true);
        };
        audio.onerror = () => {
          this.currentAudio = null;
          resolve(false);
        };

        audio.play().catch((err) => {
          console.warn('[ElevenLabsVoiceProvider] Autoplay blocked or error:', err);
          this.currentAudio = null;
          resolve(false);
        });
      } catch (err) {
        this.currentAudio = null;
        resolve(false);
      }
    });
  }

  public stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }
}

export class WebSpeechVoiceProvider implements VoiceProvider {
  public id: 'webspeech' = 'webspeech';
  public name = 'Browser Web Speech Synthesis';

  public isAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public async speak(options: VoicePlayOptions): Promise<boolean> {
    if (!this.isAvailable() || !options.text) return false;

    this.stop();

    return new Promise((resolve) => {
      try {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(options.text);
        utterance.rate = options.rate || 0.95;
        utterance.pitch = options.pitch || 0.92;

        const voices = synth.getVoices();
        const preferred = voices.find(
          (v) =>
            (v.name.includes('Natural') ||
              v.name.includes('Male') ||
              v.name.includes('English') ||
              v.name.includes('UK') ||
              v.name.includes('US')) &&
            v.lang.startsWith('en')
        );
        if (preferred) {
          utterance.voice = preferred;
        }

        utterance.onstart = () => options.onStart?.();
        utterance.onend = () => {
          options.onEnd?.();
          resolve(true);
        };
        utterance.onerror = (e) => {
          options.onError?.(new Error(`SpeechSynthesis error: ${e.error}`));
          resolve(false);
        };

        synth.speak(utterance);
      } catch (err) {
        console.warn('[WebSpeechVoiceProvider] Speech synthesis error:', err);
        resolve(false);
      }
    });
  }

  public stop(): void {
    if (this.isAvailable()) {
      window.speechSynthesis.cancel();
    }
  }
}

export class SilentVoiceProvider implements VoiceProvider {
  public id: 'silent' = 'silent';
  public name = 'Silent Mode';

  public isAvailable(): boolean {
    return true;
  }

  public async speak(options: VoicePlayOptions): Promise<boolean> {
    options.onStart?.();
    options.onEnd?.();
    return true;
  }

  public stop(): void {}
}

export class CompositeVoiceManager {
  private providers: VoiceProvider[];
  private isMuted: boolean = false;
  private voiceEnabled: boolean = true;

  constructor() {
    this.providers = [
      new ElevenLabsVoiceProvider(),
      new WebSpeechVoiceProvider(),
      new SilentVoiceProvider()
    ];
  }

  public setVoiceEnabled(enabled: boolean): void {
    this.voiceEnabled = enabled;
    if (!enabled) this.stop();
  }

  public isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) this.stop();
  }

  public isVoiceMuted(): boolean {
    return this.isMuted;
  }

  public stop(): void {
    for (const p of this.providers) {
      p.stop();
    }
  }

  /**
   * Cascade priority: ElevenLabs -> Web Speech -> Silent Fallback
   */
  public async playVoiceover(
    text: string,
    audioBase64?: string,
    callbacks?: { onStart?: () => void; onEnd?: () => void }
  ): Promise<'elevenlabs' | 'webspeech' | 'silent'> {
    if (this.isMuted || !this.voiceEnabled || !text) {
      return 'silent';
    }

    const options: VoicePlayOptions = {
      text,
      audioBase64,
      onStart: callbacks?.onStart,
      onEnd: callbacks?.onEnd
    };

    // 1. Try ElevenLabs
    const elevenLabs = this.providers[0];
    if (audioBase64 && elevenLabs.isAvailable()) {
      const ok = await elevenLabs.speak(options);
      if (ok) return 'elevenlabs';
    }

    // 2. Try Web Speech Synthesis
    const webSpeech = this.providers[1];
    if (webSpeech.isAvailable()) {
      const ok = await webSpeech.speak(options);
      if (ok) return 'webspeech';
    }

    // 3. Fallback to Silent
    await this.providers[2].speak(options);
    return 'silent';
  }
}

export const voiceManager = new CompositeVoiceManager();

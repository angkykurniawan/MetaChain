/**
 * Web Speech API Controller for Speech-to-Text (STT) and Text-to-Speech (TTS)
 * 100% Free, runs natively in WebXR and standard browsers.
 */

interface SpeakOptions {
  text: string;
  pitch?: number;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class SpeechController {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }

    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'id-ID'; // Indonesian
      }
    }
  }

  public isVoiceInputSupported(): boolean {
    return Boolean(this.recognition);
  }

  public speak(options: SpeakOptions): void {
    if (!this.synth) {
      options.onEnd?.();
      return;
    }

    this.synth.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(options.text);
    utterance.pitch = options.pitch ?? 1.0;
    utterance.rate = options.rate ?? 1.0;
    utterance.lang = 'id-ID';

    // Pick best voice if available
    const voices = this.synth.getVoices();
    const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.startsWith('ID'));
    if (idVoice) {
      utterance.voice = idVoice;
    }

    utterance.onstart = () => options.onStart?.();
    utterance.onend = () => options.onEnd?.();
    utterance.onerror = (e) => {
      console.warn('Speech synthesis error or canceled:', e);
      options.onEnd?.();
    };

    this.synth.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public startListening(
    onResult: (transcript: string) => void,
    onStatusChange?: (listening: boolean) => void,
    onError?: (error: string) => void
  ): void {
    if (!this.recognition) {
      onError?.('Speech Recognition tidak didukung di browser ini.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
      return;
    }

    this.recognition.onstart = () => {
      this.isListening = true;
      onStatusChange?.(true);
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.warn('STT Error:', event.error);
      this.isListening = false;
      onStatusChange?.(false);
      onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onStatusChange?.(false);
    };

    try {
      this.recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      this.isListening = false;
      onStatusChange?.(false);
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Recognition stop error:', err);
      }
      this.isListening = false;
    }
  }
}

export const speechEngine = new SpeechController();


/**
 * High-Clarity Web Speech API Controller
 * Supports strictly Indonesian ('id') and English ('en').
 * Includes automatic markdown stripping so voice audio is crisp, natural, and clear.
 */

export type VoiceLang = 'id' | 'en';

interface SpeakOptions {
  text: string;
  lang?: VoiceLang;
  pitch?: number;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Sanitizes markdown, asterisks, URLs, and code blocks before speaking
 * so the synthetic voice sounds completely natural, clear, and fluent.
 */
export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return '';
  return rawText
    // Remove markdown headers
    .replace(/^#+\s+/gm, '')
    // Remove bold/italic asterisks or underscores
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    // Remove code blocks and inline code
    .replace(/```[\s\S]*?```/g, 'kode program')
    .replace(/`([^`]+)`/g, '$1')
    // Convert markdown links [title](url) to title
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove bullet point symbols
    .replace(/^[\s*-•>]+\s*/gm, '')
    // Remove emojis or special tech symbols that may cause stutter
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    // Normalize extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

class SpeechController {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isListening: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }

    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'id-ID';
      }
    }
  }

  private loadVoices(): void {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }

  public isVoiceInputSupported(): boolean {
    return Boolean(this.recognition);
  }

  /**
   * Selects the highest quality natural voice for the target language (Indonesian or English)
   */
  private getBestVoice(lang: VoiceLang): SpeechSynthesisVoice | null {
    if (this.voices.length === 0 && this.synth) {
      this.voices = this.synth.getVoices();
    }

    if (lang === 'id') {
      // Prioritize natural Indonesian voices
      const idVoices = this.voices.filter(v => v.lang.toLowerCase().startsWith('id'));
      // Prefer Google or Microsoft Natural voices if present
      const preferred = idVoices.find(v => 
        v.name.includes('Google') || 
        v.name.includes('Natural') || 
        v.name.includes('Gadis') || 
        v.name.includes('Ardi')
      );
      return preferred || idVoices[0] || null;
    } else {
      // Prioritize natural US/UK English voices
      const enVoices = this.voices.filter(v => 
        v.lang.toLowerCase().startsWith('en-us') || 
        v.lang.toLowerCase().startsWith('en-gb') ||
        v.lang.toLowerCase().startsWith('en')
      );
      const preferred = enVoices.find(v => 
        v.name.includes('Natural') || 
        v.name.includes('Google US English') || 
        v.name.includes('Samantha') || 
        v.name.includes('Aria') ||
        v.name.includes('Jenny')
      );
      return preferred || enVoices[0] || null;
    }
  }

  public speak(options: SpeakOptions): void {
    if (!this.synth) {
      options.onEnd?.();
      return;
    }

    this.synth.cancel(); // Stop any pending speech

    const cleanText = cleanTextForSpeech(options.text);
    if (!cleanText) {
      options.onEnd?.();
      return;
    }

    const targetLang: VoiceLang = options.lang === 'en' ? 'en' : 'id';
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Optimized pitch and rate for crisp human clarity
    utterance.pitch = options.pitch ?? 1.0;
    utterance.rate = options.rate ?? 1.0;
    utterance.lang = targetLang === 'en' ? 'en-US' : 'id-ID';

    const bestVoice = this.getBestVoice(targetLang);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => options.onStart?.();
    utterance.onend = () => options.onEnd?.();
    utterance.onerror = (e) => {
      console.warn('Speech error or interrupted:', e);
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
    onError?: (error: string) => void,
    lang: VoiceLang = 'id'
  ): void {
    if (!this.recognition) {
      onError?.(lang === 'en' ? 'Speech recognition not supported in this browser.' : 'Speech Recognition tidak didukung di browser ini.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
      return;
    }

    // Set recognition language strictly to id-ID or en-US
    this.recognition.lang = lang === 'en' ? 'en-US' : 'id-ID';

    this.recognition.onstart = () => {
      this.isListening = true;
      onStatusChange?.(true);
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech-to-text error:', event.error);
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
        console.warn('Stop listening error:', err);
      }
      this.isListening = false;
    }
  }
}

export const speechEngine = new SpeechController();

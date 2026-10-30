/**
 * High-Clarity Web Speech API Controller (Bahasa Indonesia)
 * Mendukung sintesis suara (TTS) dan pengenalan suara (STT) bahasa Indonesia ('id-ID').
 * Dilengkapi pembersihan markdown dan pemotongan kalimat otomatis (sentence chunking)
 * agar pembacaan teks panjang (kurikulum / jawaban AI) tidak terpotong oleh limit browser.
 */

export type VoiceLang = 'id';

interface SpeakOptions {
  text: string;
  lang?: string;
  pitch?: number;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Membersihkan format markdown, karakter khusus, URL, dan blok kode sebelum dibacakan
 * agar suara sintetis terdengar sangat jelas, alami, dan lancar.
 */
export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return '';
  return rawText
    // Hapus markdown header (#, ##, ###)
    .replace(/^#+\s+/gm, '')
    // Ganti kata bold/italic dengan kata aslinya
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    // Ganti blok kode dengan sebutan ramah suara
    .replace(/```[\s\S]*?```/g, 'kode program')
    .replace(/`([^`]+)`/g, '$1')
    // Ubah markdown link [judul](url) menjadi judul
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Hapus simbol bullet point, strip, dan nomor urut di awal baris
    .replace(/^[\s*•>–—-]+\s*/gm, '')
    // Konversi simbol & menjadi kata 'dan'
    .replace(/&/g, ' dan ')
    // Hapus emoji dan simbol teknis yang menyebabkan stutter
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    // Hapus karakter markdown sisa
    .replace(/[#*~`]/g, '')
    // Normalisasi spasi dan baris baru
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Membagi teks panjang menjadi beberapa potongan kalimat pendek (maks ~160 karakter)
 * untuk menghindari bug Web Speech API pada Chrome/Edge di mana pembacaan terputus setelah 15 detik.
 */
export function splitTextIntoSpeechChunks(text: string, maxChunkLength: number = 160): string[] {
  const clean = cleanTextForSpeech(text);
  if (!clean) return [];

  // Pisahkan berdasarkan tanda baca akhir kalimat (. ! ? atau newline)
  const sentences = clean.match(/[^.!?\n]+[.!?\n]*/g) || [clean];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (current && (current.length + trimmed.length + 1) > maxChunkLength) {
      chunks.push(current.trim());
      current = trimmed;
    } else {
      current = current ? `${current} ${trimmed}` : trimmed;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.length > 0 ? chunks : [clean];
}

class SpeechController {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isListening: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private activeChunks: string[] = [];
  private currentChunkIndex: number = 0;
  private isSpeakingActive: boolean = false;
  private currentPitch: number = 1.0;
  private currentRate: number = 1.0;
  private onStartCb?: () => void;
  private onEndCb?: () => void;
  private onErrorCb?: (err: any) => void;

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

  public isSpeaking(): boolean {
    return this.isSpeakingActive || Boolean(this.synth?.speaking);
  }

  /**
   * Memilih suara sintesis terbaik untuk Bahasa Indonesia
   */
  private getBestVoice(): SpeechSynthesisVoice | null {
    if (this.voices.length === 0 && this.synth) {
      this.voices = this.synth.getVoices();
    }

    // Cari suara Bahasa Indonesia ('id' atau 'id-ID')
    const idVoices = this.voices.filter((v) => v.lang.toLowerCase().startsWith('id'));
    const preferred = idVoices.find(
      (v) =>
        v.name.includes('Google') ||
        v.name.includes('Natural') ||
        v.name.includes('Gadis') ||
        v.name.includes('Ardi') ||
        v.name.includes('Indonesia')
    );

    return preferred || idVoices[0] || this.voices[0] || null;
  }

  private cleanupCallbacks(): void {
    this.onStartCb = undefined;
    this.onEndCb = undefined;
    this.onErrorCb = undefined;
  }

  private playNextChunk(): void {
    if (!this.synth || !this.isSpeakingActive) {
      return;
    }

    if (this.currentChunkIndex >= this.activeChunks.length) {
      this.isSpeakingActive = false;
      const endCallback = this.onEndCb;
      this.cleanupCallbacks();
      endCallback?.();
      return;
    }

    const chunkText = this.activeChunks[this.currentChunkIndex];
    const utterance = new SpeechSynthesisUtterance(chunkText);

    utterance.pitch = this.currentPitch;
    utterance.rate = this.currentRate;
    utterance.lang = 'id-ID';

    const voice = this.getBestVoice();
    if (voice) {
      utterance.voice = voice;
    }

    // Cegah garbage collection di browser
    this.currentUtterance = utterance;
    (window as any).__metachain_active_utterance = utterance;

    utterance.onend = () => {
      if (!this.isSpeakingActive) return;
      this.currentChunkIndex++;
      this.playNextChunk();
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') {
        return;
      }
      console.warn('Speech synthesis chunk error:', e);
      if (!this.isSpeakingActive) return;
      this.currentChunkIndex++;
      this.playNextChunk();
    };

    // Unpause jika macet
    if (this.synth.paused) {
      this.synth.resume();
    }

    this.synth.speak(utterance);
  }

  public speak(options: SpeakOptions): void {
    if (!this.synth) {
      options.onEnd?.();
      return;
    }

    // Hentikan suara yang sedang berjalan sebelumnya
    this.stopSpeaking();

    const chunks = splitTextIntoSpeechChunks(options.text);
    if (chunks.length === 0) {
      options.onEnd?.();
      return;
    }

    this.activeChunks = chunks;
    this.currentChunkIndex = 0;
    this.currentPitch = options.pitch ?? 1.0;
    this.currentRate = options.rate ?? 1.0;
    this.onStartCb = options.onStart;
    this.onEndCb = options.onEnd;
    this.onErrorCb = options.onError;
    this.isSpeakingActive = true;

    // Trigger onStart callback
    this.onStartCb?.();

    // Jalankan pemutaran potongan kalimat
    this.playNextChunk();
  }

  public stopSpeaking(): void {
    this.isSpeakingActive = false;
    this.activeChunks = [];
    this.currentChunkIndex = 0;

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (err) {
        console.warn('Synth cancel error:', err);
      }
    }

    this.currentUtterance = null;
    (window as any).__metachain_active_utterance = null;

    const endCallback = this.onEndCb;
    this.cleanupCallbacks();
    endCallback?.();
  }

  public startListening(
    onResult: (transcript: string) => void,
    onStatusChange?: (listening: boolean) => void,
    onError?: (error: string) => void,
    _lang: string = 'id'
  ): void {
    if (!this.recognition) {
      onError?.('Fitur pengenalan suara (Speech Recognition) tidak didukung di browser ini.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
      return;
    }

    this.recognition.lang = 'id-ID';

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

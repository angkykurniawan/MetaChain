import React, { useState, useEffect } from 'react';
import { speechEngine } from '../../lib/speechEngine';
import { useLanguage } from '../../lib/i18n';
import { Mic, Send, Sparkles, Square, AlertCircle, X } from 'lucide-react';

interface VoiceChatBarProps {
  topicTitle: string;
  isMentorSpeaking: boolean;
  onSendMessage: (text: string) => void;
  onStopVoice?: () => void;
}

export const VoiceChatBar: React.FC<VoiceChatBarProps> = ({
  topicTitle,
  isMentorSpeaking,
  onSendMessage,
  onStopVoice
}) => {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Otomatis bersihkan pesan error setelah 8 detik
  useEffect(() => {
    if (speechError) {
      const timer = setTimeout(() => {
        setSpeechError(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [speechError]);

  const getFriendlySpeechError = (err: string): { title: string; solution: string } | null => {
    const isBrave = typeof navigator !== 'undefined' && Boolean((navigator as any).brave);

    switch (err) {
      case 'network':
        if (isBrave) {
          return {
            title: 'Layanan Suara Dinonaktifkan di Browser Brave',
            solution: 'Buka pengaturan Brave di brave://settings/privacy lalu aktifkan "Gunakan layanan Google untuk pengenalan ucapan", lalu muat ulang halaman.'
          };
        }
        return {
          title: 'Koneksi Pengenalan Suara Terputus',
          solution: 'Koneksi internet untuk fitur suara terhalang atau sedang tidak stabil. Pastikan internet Anda aktif dan matikan VPN jika ada, atau silakan ketik langsung di kolom teks.'
        };
      case 'not-allowed':
      case 'service-not-allowed':
        return {
          title: 'Izin Akses Mikrofon Ditolak',
          solution: 'Klik ikon gembok / slider di sebelah kiri URL browser (address bar), lalu ubah izin Mikrofon menjadi "Izinkan" (Allow).'
        };
      case 'audio-capture':
        return {
          title: 'Mikrofon Tidak Ditemukan',
          solution: 'Perangkat mikrofon tidak terdeteksi atau sedang dikunci oleh aplikasi lain (seperti Zoom/Meet).'
        };
      case 'no-speech':
        return {
          title: 'Tidak Ada Suara Terdeteksi',
          solution: 'Waktu bicara habis tanpa suara terdeteksi. Silakan klik mikrofon kembali dan mulailah berbicara.'
        };
      case 'not-supported':
        return {
          title: 'Peramban Tidak Mendukung Input Suara',
          solution: 'Gunakan Google Chrome atau Microsoft Edge versi terbaru, atau gunakan kolom input teks.'
        };
      case 'aborted':
        return null;
      default:
        return {
          title: `Pengenalan Suara Mengalami Kendala (${err})`,
          solution: 'Silakan gunakan kolom teks di samping atau pilih salah satu tombol saran cepat di atas.'
        };
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      speechEngine.stopListening();
      setIsListening(false);
    } else {
      setSpeechError(null);
      speechEngine.startListening(
        (transcript) => {
          if (transcript.trim()) {
            onSendMessage(transcript);
          }
        },
        (listening) => setIsListening(listening),
        (error) => {
          if (error !== 'aborted') {
            setSpeechError(error);
          }
        },
        'id'
      );
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickPrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  const quickPrompts = [
    `Apa itu ${topicTitle}?`,
    `Bagaimana cara kerjanya?`,
    `Apa manfaat terbesarnya?`,
    `Roadmap untuk pemula?`
  ];

  const friendlyError = speechError ? getFriendlySpeechError(speechError) : null;

  return (
    <div className="space-y-2">
      {/* Quick Prompts Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickPrompt(p)}
            className="py-1 px-2.5 rounded-full bg-slate-900/90 border border-slate-700 hover:border-cyan-400 hover:bg-cyan-950/40 text-[11px] font-medium text-slate-300 hover:text-cyan-200 transition-all shrink-0 cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSend} className="flex items-center gap-2">
        {/* Voice Input Button */}
        <button
          type="button"
          onClick={handleToggleMic}
          className={`relative p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
            isListening
              ? 'bg-red-500/20 border-red-500 text-red-400 shadow-lg shadow-red-500/30 animate-pulse'
              : 'bg-slate-900/80 border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400'
          }`}
          title={
            isListening
              ? 'Berhenti mendengarkan'
              : 'Bicara lewat Mikrofon (Input Suara)'
          }
        >
          {isListening ? <Mic className="w-5 h-5 text-red-400" /> : <Mic className="w-5 h-5" />}
          {isListening && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          )}
        </button>

        {/* Dedicated Stop Speaking Voice Button (Active when mentor is speaking) */}
        {isMentorSpeaking && onStopVoice && (
          <button
            type="button"
            onClick={onStopVoice}
            className="px-3 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/60 text-rose-300 flex items-center gap-1.5 text-xs font-bold transition-all shadow-lg shadow-rose-950/40 cursor-pointer animate-pulse shrink-0"
            title="Hentikan Suara yang Menjawab"
          >
            <Square className="w-3.5 h-3.5 fill-current text-rose-400" />
            <span className="hidden xs:inline">Hentikan Suara</span>
          </button>
        )}

        {/* Text Input Field */}
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? t.listeningStatus
                : isMentorSpeaking
                ? t.mentorSpeakingStatus
                : `Tanyakan sesuatu seputar ${topicTitle}...`
            }
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:outline-none text-slate-100 text-xs placeholder:text-slate-500"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer shrink-0"
          title="Kirim pertanyaan teks"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Friendly Status banner */}
      {friendlyError && (
        <div className="text-[11px] text-amber-200 bg-amber-950/80 border border-amber-500/50 rounded-xl p-3 flex items-start justify-between gap-2 shadow-lg backdrop-blur-md">
          <div className="flex items-start gap-2 flex-1">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-amber-300">{friendlyError.title}</p>
              <p className="text-[10px] text-amber-200/90 leading-relaxed">{friendlyError.solution}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSpeechError(null)}
            className="p-1 rounded-lg text-amber-400 hover:text-white hover:bg-amber-900/60 transition-colors cursor-pointer shrink-0"
            title="Tutup pesan"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

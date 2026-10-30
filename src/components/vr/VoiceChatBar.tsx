import React, { useState } from 'react';
import { speechEngine } from '../../lib/speechEngine';
import { useLanguage } from '../../lib/i18n';
import { Mic, Send, Sparkles, Square, VolumeX } from 'lucide-react';

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
  const { lang, t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const handleToggleMic = () => {
    if (isListening) {
      speechEngine.stopListening();
      setIsListening(false);
    } else {
      setSpeechError(null);
      // Strictly pass the active language ('id' or 'en') for voice recognition
      speechEngine.startListening(
        (transcript) => {
          if (transcript.trim()) {
            onSendMessage(transcript);
          }
        },
        (listening) => setIsListening(listening),
        (error) => setSpeechError(error),
        lang
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

  const quickPrompts = lang === 'en' ? [
    `What is ${topicTitle}?`,
    `How does it work?`,
    `What are the key benefits?`,
    `Beginner roadmap?`
  ] : [
    `Apa itu ${topicTitle}?`,
    `Bagaimana cara kerjanya?`,
    `Apa manfaat terbesarnya?`,
    `Roadmap untuk pemula?`
  ];

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
              ? (lang === 'en' ? 'Stop listening' : 'Berhenti mendengarkan')
              : (lang === 'en' ? 'Speak with Microphone (Voice Input)' : 'Bicara lewat Mikrofon (Input Suara)')
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
            title={lang === 'en' ? 'Stop Speaking Voice' : 'Hentikan Suara yang Menjawab'}
          >
            <Square className="w-3.5 h-3.5 fill-current text-rose-400" />
            <span className="hidden xs:inline">{lang === 'en' ? 'Stop Voice' : 'Hentikan Suara'}</span>
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
                : (lang === 'en' ? `Ask anything about ${topicTitle}...` : `Tanyakan sesuatu seputar ${topicTitle}...`)
            }
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:outline-none text-slate-100 text-xs placeholder:text-slate-500"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer shrink-0"
          title={lang === 'en' ? 'Send text question' : 'Kirim pertanyaan teks'}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Status banner */}
      {speechError && (
        <div className="text-[10px] text-red-400 px-2">
          Mic status: {speechError} ({lang === 'en' ? 'Please use text input' : 'Gunakan input teks di samping'}).
        </div>
      )}
    </div>
  );
};

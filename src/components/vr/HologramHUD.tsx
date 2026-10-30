import React, { useState } from 'react';
import { Topic, EphemeralChatMessage } from '../../types';
import { generateAIFallbackCurriculum } from '../../lib/characterGen';
import { getActiveAIConfig, PROVIDER_PRESETS } from '../../lib/aiProvider';
import { VoiceChatBar } from './VoiceChatBar';
import { 
  BookOpen, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  FileText, 
  Lock,
  Cpu
} from 'lucide-react';

interface HologramHUDProps {
  currentTopic: Topic;
  allTopics: Topic[];
  onSelectTopic: (topic: Topic) => void;
  messages: EphemeralChatMessage[];
  isMentorSpeaking: boolean;
  onSendMessage: (text: string) => void;
  onStopVoice: () => void;
}

export const HologramHUD: React.FC<HologramHUDProps> = ({
  currentTopic,
  allTopics,
  onSelectTopic,
  messages,
  isMentorSpeaking,
  onSendMessage,
  onStopVoice
}) => {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'chat'>('curriculum');
  const [showTopicSelector, setShowTopicSelector] = useState(false);

  const hasAdminGuide = Boolean(currentTopic.guide_content || currentTopic.guide_file_url);
  const guideText = hasAdminGuide
    ? currentTopic.guide_content || 'Silakan unduh dokumen panduan terlampir di bawah ini.'
    : generateAIFallbackCurriculum(currentTopic.title);

  return (
    <div className="w-full max-w-xl bg-slate-950/85 backdrop-blur-xl border border-cyan-500/40 rounded-3xl p-5 shadow-2xl shadow-cyan-950/70 flex flex-col max-h-[82vh] text-slate-100 relative overflow-hidden font-sans">
      {/* Background cyber grid effect */}
      <div className="absolute -top-20 -right-20 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header: Topic Switcher & Mentor Badge */}
      <div className="pb-3 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="relative">
          <button
            onClick={() => setShowTopicSelector(!showTopicSelector)}
            className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-left transition-all cursor-pointer"
          >
            <span className="text-[10px] font-mono font-bold text-cyan-400">
              #{currentTopic.order_index}
            </span>
            <span className="text-xs font-bold text-slate-100 truncate max-w-[170px]">
              {currentTopic.title}
            </span>
            <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showTopicSelector ? 'rotate-90' : ''}`} />
          </button>

          {/* Floating Dropdown of 11 Topics */}
          {showTopicSelector && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-2 shadow-2xl z-50 max-h-60 overflow-y-auto">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
                Pilih Modul Pembelajaran (11 Topik)
              </div>
              {allTopics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTopic(t);
                    setShowTopicSelector(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    t.id === currentTopic.id
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span className="truncate">
                    <span className="text-[10px] font-mono text-slate-500 mr-1.5">#{t.order_index}</span>
                    {t.title}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full shrink-0 ml-1"
                    style={{ backgroundColor: t.character_primary_color }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dedicated 3D Mentor Pill & Audio Pulse */}
        <div className="flex items-center gap-2">
          {isMentorSpeaking ? (
            <button
              onClick={onStopVoice}
              className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-cyan-950/80 border border-cyan-400 text-[11px] font-bold text-cyan-300 animate-pulse cursor-pointer"
              title="Hentikan Suara Mentor"
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bicara...</span>
              <VolumeX className="w-3 h-3 text-slate-400 ml-1 hover:text-red-400" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentTopic.character_primary_color }}
              />
              <span>{currentTopic.character_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Switcher: Kurikulum vs Tanya Jawab */}
      <div className="flex border-b border-slate-800 my-3 gap-2">
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`pb-2 px-3 text-xs font-bold flex items-center gap-1.5 transition-colors relative cursor-pointer ${
            activeTab === 'curriculum' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Panduan Materi</span>
          {activeTab === 'curriculum' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-2 px-3 text-xs font-bold flex items-center gap-1.5 transition-colors relative cursor-pointer ${
            activeTab === 'chat' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Tanya Jawab Suara</span>
          {messages.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          )}
          {activeTab === 'chat' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
          )}
        </button>
      </div>

      {/* Tab Content Display */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 mb-3 min-h-[220px]">
        {activeTab === 'curriculum' ? (
          <div className="space-y-3">
            {/* Guide Origin Pill */}
            <div className="flex items-center justify-between text-[11px]">
              {hasAdminGuide ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Kurikulum Resmi dari Admin</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-blue-400 font-semibold">
                  <Bot className="w-3.5 h-3.5" />
                  <span>Mode Otomatis: Kurikulum dari AI Mentor</span>
                </span>
              )}

              {currentTopic.guide_file_url && (
                <a
                  href={currentTopic.guide_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Unduh Dokumen PDF</span>
                </a>
              )}
            </div>

            {/* Guide Content Box */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 whitespace-pre-line leading-relaxed font-mono">
              {guideText}
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Active Provider & Zero Retention Badges */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
              <div className="py-1 px-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-cyan-400" />
                <span>Privasi Terjamin (RAM-Only)</span>
              </div>
              <div className="py-1 px-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-semibold flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>Otak AI: {PROVIDER_PRESETS[getActiveAIConfig().provider]?.name || 'Auto AI'}</span>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Mulai percakapan dengan menekan tombol mic di bawah atau pilih pertanyaan cepat.
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-cyan-500 text-slate-950 font-medium rounded-br-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Mandatory Disclaimer Box (Requirement #3) */}
      <div className="p-2.5 mb-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300/90 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span className="leading-snug">
          <strong>Pemberitahuan:</strong> Seluruh materi, penjelasan, dan panduan yang disajikan di platform ini merupakan perspektif dan tanggapan pribadi, bukan standar baku industri atau saran finansial mutlak.
        </span>
      </div>

      {/* Bottom Voice / Text Chat Input Bar */}
      <VoiceChatBar
        topicTitle={currentTopic.title}
        isMentorSpeaking={isMentorSpeaking}
        onSendMessage={onSendMessage}
      />
    </div>
  );
};


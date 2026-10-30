import React, { useState, useEffect, useRef } from 'react';
import { Topic, EphemeralChatMessage } from '../../types';
import { generateAIFallbackCurriculum } from '../../lib/characterGen';
import { getActiveAIConfig, PROVIDER_PRESETS } from '../../lib/aiProvider';
import { useLanguage } from '../../lib/i18n';
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
  ChevronDown,
  ChevronUp,
  FileText, 
  Lock,
  Cpu,
  User,
  Sparkles
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
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'curriculum' | 'chat'>('curriculum');
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const activeConfig = getActiveAIConfig();
  const isCloudConfigured = Boolean(activeConfig.apiKey && activeConfig.apiKey.trim().length > 0);

  // Automatically switch to chat tab, expand HUD, and scroll to bottom when a new response arrives
  useEffect(() => {
    if (messages.length > 0) {
      setIsMinimized(false);
      setActiveTab('chat');
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 80);
    }
  }, [messages.length]);

  const hasAdminGuide = Boolean(currentTopic.guide_content || currentTopic.guide_file_url);
  const guideText = hasAdminGuide
    ? (currentTopic.guide_content || (lang === 'en' ? 'Please download the attached guide document below.' : 'Silakan unduh dokumen panduan terlampir di bawah ini.'))
    : generateAIFallbackCurriculum(currentTopic.title, lang);

  if (isMinimized) {
    return (
      <div className="w-full max-w-sm sm:max-w-md bg-slate-950/90 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 text-slate-100 font-sans">
        <div className="flex items-center gap-2 truncate">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: currentTopic.character_primary_color }}
          />
          <span className="text-[10px] font-mono font-bold text-cyan-400">#{currentTopic.order_index}</span>
          <span className="text-xs font-bold text-slate-100 truncate">{currentTopic.title}</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline font-mono">({currentTopic.character_name})</span>
        </div>

        <button
          onClick={() => setIsMinimized(false)}
          className="py-1 px-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0"
          title="Buka Hologram HUD"
        >
          <span>HUD</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl bg-slate-950/85 backdrop-blur-xl border border-cyan-500/40 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl shadow-cyan-950/70 flex flex-col max-h-[72vh] sm:max-h-[82vh] text-slate-100 relative overflow-hidden font-sans">
      {/* Background cyber grid effect */}
      <div className="absolute -top-20 -right-20 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header: Topic Switcher & Mentor Badge & Minimize Button */}
      <div className="pb-3 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="relative">
          <button
            onClick={() => setShowTopicSelector(!showTopicSelector)}
            className="flex items-center gap-1.5 sm:gap-2 py-1 px-2 sm:px-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-left transition-all cursor-pointer"
          >
            <span className="text-[10px] font-mono font-bold text-cyan-400">
              #{currentTopic.order_index}
            </span>
            <span className="text-xs font-bold text-slate-100 truncate max-w-[130px] sm:max-w-[180px]">
              {currentTopic.title}
            </span>
            <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showTopicSelector ? 'rotate-90' : ''}`} />
          </button>

          {/* Floating Dropdown of 11 Topics */}
          {showTopicSelector && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-2 shadow-2xl z-50 max-h-56 overflow-y-auto">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
                {lang === 'en' ? 'Select Module (11 Topics)' : 'Pilih Modul Pembelajaran (11 Topik)'}
              </div>
              {allTopics.map((tItem) => (
                <button
                  key={tItem.id}
                  onClick={() => {
                    onSelectTopic(tItem);
                    setShowTopicSelector(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    tItem.id === currentTopic.id
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span className="truncate">
                    <span className="text-[10px] font-mono text-slate-500 mr-1.5">#{tItem.order_index}</span>
                    {tItem.title}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full shrink-0 ml-1"
                    style={{ backgroundColor: tItem.character_primary_color }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Header: Dedicated 3D Mentor Pill & Minimize Icon */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isMentorSpeaking ? (
            <button
              onClick={onStopVoice}
              className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-cyan-950/80 border border-cyan-400 text-[11px] font-bold text-cyan-300 animate-pulse cursor-pointer"
              title={lang === 'en' ? 'Stop mentor voice' : 'Hentikan Suara Mentor'}
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.speakingBtn}</span>
              <VolumeX className="w-3 h-3 text-slate-400 ml-1 hover:text-red-400" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentTopic.character_primary_color }}
              />
              <span className="text-slate-200 font-semibold truncate max-w-[100px] sm:max-w-none">{currentTopic.character_name}</span>
            </div>
          )}

          {/* Minimize HUD button */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Kecilkan HUD (Tampilan 3D Penuh)"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Switcher: Kurikulum vs Tanya Jawab (Teks & Suara) */}
      <div className="flex border-b border-slate-800 my-2.5 sm:my-3 gap-2">
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`pb-2 px-2.5 sm:px-3 text-xs font-bold flex items-center gap-1.5 transition-colors relative cursor-pointer ${
            activeTab === 'curriculum' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t.curriculumTab}</span>
          {activeTab === 'curriculum' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-2 px-2.5 sm:px-3 text-xs font-bold flex items-center gap-1.5 transition-colors relative cursor-pointer ${
            activeTab === 'chat' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{t.chatTab}</span>
          {messages.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          )}
          {activeTab === 'chat' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
          )}
        </button>
      </div>

      {/* Tab Content Display */}
      <div 
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto pr-1 space-y-3 mb-2.5 min-h-[180px] max-h-[300px]"
      >
        {activeTab === 'curriculum' ? (
          <div className="space-y-3">
            {/* Guide Origin Pill */}
            <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
              {hasAdminGuide ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t.curriculumFromAdmin}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-blue-400 font-semibold truncate">
                  <Bot className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t.curriculumFromAI}</span>
                </span>
              )}

              {currentTopic.guide_file_url && (
                <a
                  href={currentTopic.guide_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">{t.downloadPdf}</span>
                  <span className="xs:hidden">PDF</span>
                </a>
              )}
            </div>

            {/* Guide Content Box */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 whitespace-pre-line leading-relaxed font-mono">
              {guideText}
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Active Provider & Zero Retention Badges */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
              <div className="py-1 px-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>{lang === 'en' ? 'RAM-Only' : 'RAM-Only (Privasi)'}</span>
              </div>
              {isCloudConfigured ? (
                <div className="py-1 px-2 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">AI Cloud: {PROVIDER_PRESETS[activeConfig.provider]?.name.split(' ')[0]} ({activeConfig.model})</span>
                </div>
              ) : (
                <div className="py-1 px-2 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300 font-semibold flex items-center gap-1.5 shadow-sm">
                  <Cpu className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">{lang === 'en' ? 'Rule-Based Engine (Offline)' : 'Mode: Rule-Based (Offline)'}</span>
                </div>
              )}
            </div>

            {messages.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                {t.noChatPrompt}
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                    {m.sender === 'user' ? (
                      <>
                        <span>{lang === 'en' ? 'You' : 'Anda'}</span>
                        <User className="w-3 h-3 text-cyan-400" />
                      </>
                    ) : (
                      <>
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: currentTopic.character_primary_color }}
                        />
                        <span className="font-bold text-cyan-300">{currentTopic.character_name}</span>

                        {/* Engine Indicator Badge: AI vs Rule-Based */}
                        {m.engine === 'ai' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-semibold tracking-wide shadow-sm">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                            <span>AI ({m.aiModel || 'Cloud LLM'})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-semibold tracking-wide shadow-sm">
                            <Cpu className="w-2.5 h-2.5 text-amber-400" />
                            <span>Rule-Based (Offline)</span>
                          </span>
                        )}

                        <span className="text-slate-500 hidden xs:inline">({lang === 'en' ? 'Voice & Text' : 'Suara & Teks'})</span>
                      </>
                    )}
                  </div>

                  {/* Bubble Content */}
                  <div
                    className={`max-w-[92%] sm:max-w-[88%] rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs leading-relaxed shadow-md ${
                      m.sender === 'user'
                        ? 'bg-cyan-500 text-slate-950 font-medium rounded-br-none'
                        : 'bg-slate-900/90 border border-slate-700/80 text-slate-100 rounded-bl-none shadow-cyan-950/40'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-2 sm:p-2.5 mb-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10px] sm:text-[11px] text-amber-300/90 flex items-start gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <span className="leading-snug">
          {t.disclaimerText}
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

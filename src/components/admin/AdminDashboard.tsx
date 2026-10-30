import React, { useState } from 'react';
import { Profile } from '../../types';
import { isLiveSupabase } from '../../lib/supabase';
import { useLanguage } from '../../lib/i18n';
import { LanguageToggle } from '../common/LanguageToggle';
import { ThemeToggle } from '../common/ThemeToggle';
import { 
  getActiveAIConfig, 
  saveActiveAIConfig, 
  fetchLiveAvailableModels,
  PROVIDER_PRESETS, 
  AIProviderType, 
  AIProviderConfig 
} from '../../lib/aiProvider';
import { TopicManagement } from './TopicManagement';
import { UserManagement } from './UserManagement';
import { 
  Cpu, 
  Layers, 
  Users, 
  LogOut, 
  Database, 
  ShieldCheck, 
  ExternalLink,
  Key,
  Sparkles,
  Check,
  X,
  Bot,
  Lock,
  Unlock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface AdminDashboardProps {
  currentAdmin: Profile;
  onLogout: () => void;
  onEnterVRPreview: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentAdmin,
  onLogout,
  onEnterVRPreview
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'topics' | 'users' | 'ai'>('topics');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIProviderConfig>(getActiveAIConfig());
  const [keySaved, setKeySaved] = useState(false);
  
  // Dynamic live models state fetched directly from provider API
  const [dynamicModels, setDynamicModels] = useState<string[]>(() => {
    const cfg = getActiveAIConfig();
    return cfg.availableModels && cfg.availableModels.length > 0 
      ? cfg.availableModels 
      : (PROVIDER_PRESETS[cfg.provider]?.models || []);
  });
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelFetchError, setModelFetchError] = useState<string | null>(null);
  const [modelFetchSuccess, setModelFetchSuccess] = useState<string | null>(null);

  const handleFetchLiveModels = async (provider: AIProviderType, key: string) => {
    if (!key.trim()) {
      setDynamicModels(PROVIDER_PRESETS[provider]?.models || []);
      setModelFetchError(null);
      setModelFetchSuccess(null);
      return;
    }

    setIsLoadingModels(true);
    setModelFetchError(null);
    setModelFetchSuccess(null);

    try {
      const models = await fetchLiveAvailableModels(provider, key);
      if (models.length > 0) {
        setDynamicModels(models);
        setModelFetchSuccess(`Berhasil! Ditemukan ${models.length} model resmi langsung dari API ${PROVIDER_PRESETS[provider].name}.`);
        setAiConfig((prev) => {
          const nextModel = models.includes(prev.model) ? prev.model : models[0];
          return {
            ...prev,
            model: nextModel,
            availableModels: models
          };
        });
      } else {
        setDynamicModels(PROVIDER_PRESETS[provider]?.models || []);
      }
    } catch (err: any) {
      console.warn('Live model fetch error:', err);
      setModelFetchError(err.message || 'Gagal memuat model dari API Key ini.');
      setDynamicModels(PROVIDER_PRESETS[provider]?.models || []);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleProviderChange = (provider: AIProviderType) => {
    setAiConfig((prev) => ({
      ...prev,
      provider,
      model: PROVIDER_PRESETS[provider]?.defaultModel || ''
    }));
    setModelFetchError(null);
    setModelFetchSuccess(null);
    if (aiConfig.apiKey.trim()) {
      handleFetchLiveModels(provider, aiConfig.apiKey);
    } else {
      setDynamicModels(PROVIDER_PRESETS[provider]?.models || []);
    }
  };

  const handleSaveAIConfig = (e?: React.FormEvent) => {
    e?.preventDefault();
    saveActiveAIConfig(aiConfig);
    setKeySaved(true);
    setTimeout(() => {
      setKeySaved(false);
      setShowApiKeyModal(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-16 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20 shrink-0">
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">MetaChain</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                  Admin
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 hidden xs:block">Curriculum & 3D Character Management</p>
            </div>
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Supabase Status Pill */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs py-1 px-3 rounded-full border bg-slate-800/80 border-slate-700">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              {isLiveSupabase ? (
                <span className="text-emerald-400 font-medium">Supabase Cloud</span>
              ) : (
                <span className="text-amber-400 font-medium">Local Storage Mode</span>
              )}
            </div>

            {/* Multi-Provider AI Settings Button */}
            <button
              onClick={() => {
                const current = getActiveAIConfig();
                setAiConfig(current);
                if (current.availableModels && current.availableModels.length > 0) {
                  setDynamicModels(current.availableModels);
                } else if (current.apiKey.trim()) {
                  handleFetchLiveModels(current.provider, current.apiKey);
                } else {
                  setDynamicModels(PROVIDER_PRESETS[current.provider]?.models || []);
                }
                setShowApiKeyModal(true);
              }}
              className="py-1.5 px-2.5 sm:px-3 rounded-xl border border-slate-700 hover:border-cyan-400 bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Pilih & Atur Provider AI (OpenAI, Gemini, Anthropic, DeepSeek)"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden sm:inline">Otak AI: </span>
              <span className="max-w-[100px] truncate">{PROVIDER_PRESETS[aiConfig.provider]?.name.split(' ')[0] || 'AI'}</span>
              {aiConfig.apiKey ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="API Key Terpasang" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" title="Offline Mode" />
              )}
            </button>

            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle />

            {/* Language Switcher (Strictly ID / EN) */}
            <LanguageToggle />

            {/* Preview VR button for Admin */}
            <button
              onClick={onEnterVRPreview}
              className="py-1.5 px-2.5 sm:px-3 rounded-xl border border-cyan-500/40 hover:bg-cyan-950/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title={t.vrPreviewBtn}
            >
              <span className="hidden sm:inline">{t.vrPreviewBtn}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Admin Avatar & Logout */}
            <div className="flex items-center gap-2 pl-1.5 border-l border-slate-800">
              <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-slate-200">{currentAdmin.full_name}</div>
                <div className="text-[10px] text-slate-500 font-mono">@{currentAdmin.username}</div>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Keluar dari Akun"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Navigation Tabs (Mobile Horizontally Scrollable) */}
        <div className="flex border-b border-slate-800 gap-2 sm:gap-4 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setActiveTab('topics')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative cursor-pointer ${
              activeTab === 'topics' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t.tabCurriculum}</span>
            {activeTab === 'topics' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-sm shadow-cyan-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative cursor-pointer ${
              activeTab === 'users' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.tabStudents}</span>
            {activeTab === 'users' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-sm shadow-cyan-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative cursor-pointer ${
              activeTab === 'ai' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>{t.tabAI} ({PROVIDER_PRESETS[aiConfig.provider].name})</span>
            {activeTab === 'ai' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-sm shadow-cyan-400" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'topics' && <TopicManagement />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                Pusat Pengaturan Model AI (Multi-LLM)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tentukan provider dan model AI yang digunakan oleh seluruh Karakter 3D AI Mentor untuk menjawab obrolan suara dan teks di ruang VR.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Provider Selection Cards */}
              <div className="lg:col-span-1 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Pilih Provider AI
                </label>
                {(Object.keys(PROVIDER_PRESETS) as AIProviderType[]).map((prov) => {
                  const isSelected = aiConfig.provider === prov;
                  const item = PROVIDER_PRESETS[prov];
                  return (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => handleProviderChange(prov)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-950/60 to-slate-900 border-cyan-400 text-cyan-200 shadow-xl shadow-cyan-950/40'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-100">{item.name}</span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">
                            Aktif
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Model Standar: {item.defaultModel}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Model & API Key Form */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">
                      Konfigurasi {PROVIDER_PRESETS[aiConfig.provider].name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Pengaturan ini berlaku instan ke seluruh Karakter AI di ruang VR.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveAIConfig} className="space-y-4">
                  {/* Step 1: Input API Key */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-cyan-400" />
                        Langkah 1: Masukkan API Key {PROVIDER_PRESETS[aiConfig.provider].name}
                      </span>
                      {aiConfig.apiKey.trim() ? (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Kunci Terpasang
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-medium">Wajib Diisi</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder={`Masukkan API Key untuk ${PROVIDER_PRESETS[aiConfig.provider].name}...`}
                        value={aiConfig.apiKey}
                        onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                        onBlur={() => {
                          if (aiConfig.apiKey.trim()) {
                            handleFetchLiveModels(aiConfig.provider, aiConfig.apiKey);
                          }
                        }}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-cyan-400 focus:outline-none font-mono"
                      />
                      <Key className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                    </div>

                    {/* Button to dynamically fetch models from API Key */}
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        disabled={!aiConfig.apiKey.trim() || isLoadingModels}
                        onClick={() => handleFetchLiveModels(aiConfig.provider, aiConfig.apiKey)}
                        className="py-1.5 px-3 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all active:scale-95"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingModels ? 'animate-spin' : ''}`} />
                        <span>{isLoadingModels ? 'Mengambil Model dari API...' : 'Muat Pilihan Model Resmi dari API Key'}</span>
                      </button>

                      {modelFetchSuccess && (
                        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>{modelFetchSuccess}</span>
                        </span>
                      )}
                    </div>

                    {modelFetchError && (
                      <div className="mt-2 p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{modelFetchError}</span>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Model Selection (Determined dynamically from the entered API Key) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        {aiConfig.apiKey.trim() ? (
                          <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>Langkah 2: Model yang Tersedia di API ({dynamicModels.length} Model Ditemukan)</span>
                      </label>
                      {aiConfig.apiKey.trim() ? (
                        <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" /> Terbuka ({dynamicModels.length} Model)
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Terkunci
                        </span>
                      )}
                    </div>

                    <select
                      disabled={!aiConfig.apiKey.trim() || isLoadingModels}
                      value={aiConfig.model}
                      onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono transition-all ${
                        aiConfig.apiKey.trim()
                          ? 'bg-slate-950 border border-cyan-500/50 text-slate-100 focus:border-cyan-400 focus:outline-none cursor-pointer'
                          : 'bg-slate-950/40 border border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                      }`}
                    >
                      {dynamicModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>

                    {isLoadingModels && (
                      <p className="text-[11px] text-cyan-400 mt-1.5 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menghubungi API {PROVIDER_PRESETS[aiConfig.provider].name} untuk mengambil model yang aktif...</span>
                      </p>
                    )}

                    {!aiConfig.apiKey.trim() && (
                      <p className="text-[11px] text-amber-400/90 mt-1.5 flex items-center gap-1">
                        <Lock className="w-3 h-3 shrink-0" />
                        <span>Masukkan API Key pada langkah 1 untuk memuat model yang tersedia.</span>
                      </p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-300">
                      🔑 Cara Dapatkan API Key {PROVIDER_PRESETS[aiConfig.provider].name}:
                    </p>
                    <p>
                      Kunjungi konsol resmi:{' '}
                      <a
                        href={PROVIDER_PRESETS[aiConfig.provider].docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 underline font-mono text-[11px]"
                      >
                        {PROVIDER_PRESETS[aiConfig.provider].docsUrl}
                      </a>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      *Jika dikosongkan, AI Mentor tetap aktif menjawab menggunakan offline intelligence bawaan.
                    </p>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-800">
                    <button
                      type="submit"
                      className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
                    >
                      {keySaved ? (
                        <>
                          <Check className="w-4 h-4" /> Konfigurasi Berhasil Disimpan!
                        </>
                      ) : (
                        'Simpan & Terapkan AI'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-4 bg-slate-950 text-center text-xs text-slate-500">
        <p>MetaChain WebXR Architecture • Zero-Retention Privacy Policy Enforced</p>
      </footer>

      {/* Multi-Provider AI Configuration Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">Pilih & Atur Provider AI Pembelajaran</h3>
              </div>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Pilih kecerdasan buatan (LLM) yang akan menjadi otak utama seluruh Karakter 3D AI Mentor dalam menjawab percakapan edukasi di ruang VR.
            </p>

            <form onSubmit={handleSaveAIConfig} className="space-y-4">
              {/* Provider Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Provider AI
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(PROVIDER_PRESETS) as AIProviderType[]).map((prov) => {
                    const isSelected = aiConfig.provider === prov;
                    return (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => handleProviderChange(prov)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <span>{PROVIDER_PRESETS[prov].name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 1: API Key Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-cyan-400" />
                    Langkah 1: Masukkan API Key {PROVIDER_PRESETS[aiConfig.provider].name}
                  </span>
                  {aiConfig.apiKey.trim() ? (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Terisi
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-medium">Wajib Diisi</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder={`Masukkan API Key ${PROVIDER_PRESETS[aiConfig.provider].name}...`}
                    value={aiConfig.apiKey}
                    onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                    onBlur={() => {
                      if (aiConfig.apiKey.trim()) {
                        handleFetchLiveModels(aiConfig.provider, aiConfig.apiKey);
                      }
                    }}
                    className="w-full pl-3.5 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-cyan-400 focus:outline-none font-mono"
                  />
                  <Key className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                </div>

                {/* Button to fetch models dynamically from API */}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={!aiConfig.apiKey.trim() || isLoadingModels}
                    onClick={() => handleFetchLiveModels(aiConfig.provider, aiConfig.apiKey)}
                    className="py-1 px-2.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all active:scale-95"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingModels ? 'animate-spin' : ''}`} />
                    <span>{isLoadingModels ? 'Mengambil Model...' : 'Muat Pilihan Model dari API Key'}</span>
                  </button>

                  {modelFetchSuccess && (
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3 shrink-0" />
                      <span>{modelFetchSuccess}</span>
                    </span>
                  )}
                </div>

                {modelFetchError && (
                  <div className="mt-2 p-2 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{modelFetchError}</span>
                  </div>
                )}
              </div>

              {/* Step 2: Model Selection (Determined dynamically from the entered API Key) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    {aiConfig.apiKey.trim() ? (
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>Langkah 2: Model yang Tersedia ({dynamicModels.length} Model Ditemukan)</span>
                  </label>
                  {aiConfig.apiKey.trim() ? (
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> Terbuka ({dynamicModels.length} Model)
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Terkunci
                    </span>
                  )}
                </div>

                <select
                  disabled={!aiConfig.apiKey.trim() || isLoadingModels}
                  value={aiConfig.model}
                  onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all ${
                    aiConfig.apiKey.trim()
                      ? 'bg-slate-950 border border-cyan-500/50 text-slate-100 focus:border-cyan-400 focus:outline-none cursor-pointer'
                      : 'bg-slate-950/40 border border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                  }`}
                >
                  {dynamicModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                {isLoadingModels && (
                  <p className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Menghubungi API {PROVIDER_PRESETS[aiConfig.provider].name} untuk mengambil model...</span>
                  </p>
                )}

                {!aiConfig.apiKey.trim() && (
                  <p className="text-[10px] text-amber-400/90 mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 shrink-0" />
                    <span>Masukkan API Key pada langkah 1 untuk memuat model yang tersedia.</span>
                  </p>
                )}
              </div>

              {/* Helper Links */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">💡 Dapatkan API Key {PROVIDER_PRESETS[aiConfig.provider].name}:</p>
                <p>
                  Kunjungi:{' '}
                  <a
                    href={PROVIDER_PRESETS[aiConfig.provider].docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 underline"
                  >
                    {PROVIDER_PRESETS[aiConfig.provider].docsUrl}
                  </a>
                </p>
                <p className="text-[10px] text-slate-500">
                  *Jika API Key dikosongkan, sistem tetap berjalan menggunakan engine offline lokal bawaan.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="py-2 px-4 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  {keySaved ? (
                    <>
                      <Check className="w-4 h-4" /> Provider Tersimpan!
                    </>
                  ) : (
                    'Terapkan Provider AI'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


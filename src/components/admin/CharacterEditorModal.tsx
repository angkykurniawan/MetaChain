import React, { useState } from 'react';
import { CharacterConfig, AvatarModelType } from '../../types';
import { speechEngine } from '../../lib/speechEngine';
import { X, Volume2, Sparkles, Check, Bot, Globe, Shield, User } from 'lucide-react';

interface CharacterEditorModalProps {
  initialConfig: CharacterConfig;
  topicTitle: string;
  onSave: (config: CharacterConfig) => void;
  onClose: () => void;
}

const AVATAR_OPTIONS: { type: AvatarModelType; label: string; icon: any; desc: string }[] = [
  { type: 'cyber_humanoid', label: 'Cyber Humanoid', icon: User, desc: 'Bentuk android proporsional dengan aura siber' },
  { type: 'floating_orb', label: 'Floating Quantum Orb', icon: Globe, desc: 'Bola energi melayang dengan cincin partikel' },
  { type: 'mech_guard', label: 'Heavy Mech Guard', icon: Shield, desc: 'Robot pelindung taktis berlapis pelat baja' },
  { type: 'holo_sage', label: 'Holographic Sage', icon: Bot, desc: 'Entitas hologram transparan bercahaya lembut' }
];

const PRESET_COLORS = [
  '#06b6d4', '#3b82f6', '#10b981', '#8b5cf6', 
  '#f59e0b', '#ec4899', '#ef4444', '#14b8a6'
];

export const CharacterEditorModal: React.FC<CharacterEditorModalProps> = ({
  initialConfig,
  topicTitle,
  onSave,
  onClose
}) => {
  const [config, setConfig] = useState<CharacterConfig>({ ...initialConfig });
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const handleTestVoice = () => {
    setIsPlayingVoice(true);
    speechEngine.speak({
      text: config.character_greeting || `Halo, saya ${config.character_name}.`,
      pitch: config.character_voice_pitch,
      rate: config.character_voice_rate,
      onEnd: () => setIsPlayingVoice(false),
      onError: () => setIsPlayingVoice(false)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: config.character_primary_color, color: '#020617' }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Kustomisasi Karakter 3D AI Mentor</h2>
              <p className="text-xs text-slate-400">Untuk Materi: <span className="text-cyan-400 font-semibold">{topicTitle}</span></p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Character Name & Avatar Model Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Nama Karakter
              </label>
              <input
                type="text"
                value={config.character_name}
                onChange={(e) => setConfig({ ...config, character_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Tipe Model 3D Avatar
              </label>
              <select
                value={config.character_avatar_type}
                onChange={(e) => setConfig({ ...config, character_avatar_type: e.target.value as AvatarModelType })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-cyan-400 focus:outline-none"
              >
                {AVATAR_OPTIONS.map((opt) => (
                  <option key={opt.type} value={opt.type}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Model Visual Showcase Cards */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Pilih Gaya Visual 3D
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {AVATAR_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = config.character_avatar_type === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setConfig({ ...config, character_avatar_type: opt.type })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-md shadow-cyan-950'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-2 text-cyan-400" />
                    <div className="text-xs font-bold text-slate-100">{opt.label}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Warna Neon Utama
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={config.character_primary_color}
                  onChange={(e) => setConfig({ ...config, character_primary_color: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono text-slate-300 uppercase">{config.character_primary_color}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setConfig({ ...config, character_primary_color: c })}
                    className="w-5 h-5 rounded-full border border-slate-600 transition-transform hover:scale-125"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Warna Sekunder / Aksen
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={config.character_secondary_color}
                  onChange={(e) => setConfig({ ...config, character_secondary_color: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono text-slate-300 uppercase">{config.character_secondary_color}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setConfig({ ...config, character_secondary_color: c })}
                    className="w-5 h-5 rounded-full border border-slate-600 transition-transform hover:scale-125"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Persona & Bio */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Persona & Gaya Komunikasi
            </label>
            <textarea
              rows={2}
              value={config.character_persona}
              onChange={(e) => setConfig({ ...config, character_persona: e.target.value })}
              placeholder="Contoh: Instruktur analitis, ramah, gemar memberi contoh analogi praktis..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {/* Greeting Line */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Pesan Sambutan Awal (Voice Greeting)
            </label>
            <textarea
              rows={2}
              value={config.character_greeting}
              onChange={(e) => setConfig({ ...config, character_greeting: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {/* Voice Pitch and Rate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Nada Suara (Pitch)</span>
                <span className="font-mono text-cyan-400">{config.character_voice_pitch}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={config.character_voice_pitch}
                onChange={(e) => setConfig({ ...config, character_voice_pitch: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Kecepatan Bicara (Rate)</span>
                <span className="font-mono text-cyan-400">{config.character_voice_rate}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={config.character_voice_rate}
                onChange={(e) => setConfig({ ...config, character_voice_rate: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Voice Preview Button */}
          <button
            type="button"
            onClick={handleTestVoice}
            disabled={isPlayingVoice}
            className="w-full py-2.5 px-4 rounded-xl border border-cyan-500/50 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Volume2 className={`w-4 h-4 ${isPlayingVoice ? 'animate-pulse text-cyan-400' : ''}`} />
            {isPlayingVoice ? 'Memutar Suara Karakter...' : 'Uji Coba Suara Sambutan Karakter'}
          </button>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onSave(config)}
            className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Check className="w-4 h-4" /> Simpan Konfigurasi Karakter
          </button>
        </div>
      </div>
    </div>
  );
};


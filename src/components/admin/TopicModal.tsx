import React, { useState } from 'react';
import { Topic, CharacterConfig } from '../../types';
import { generateCharacterForTopic } from '../../lib/characterGen';
import { CharacterEditorModal } from './CharacterEditorModal';
import { dbService } from '../../lib/supabase';
import { X, Sparkles, Upload, FileText, Check, Bot, AlertCircle } from 'lucide-react';

interface TopicModalProps {
  initialTopic?: Topic | null;
  onSave: (topic: Partial<Topic>) => Promise<void>;
  onClose: () => void;
}

export const TopicModal: React.FC<TopicModalProps> = ({
  initialTopic,
  onSave,
  onClose
}) => {
  const isEditing = Boolean(initialTopic);

  const [title, setTitle] = useState(initialTopic?.title || '');
  const [slug, setSlug] = useState(initialTopic?.slug || '');
  const [description, setDescription] = useState(initialTopic?.description || '');
  const [orderIndex, setOrderIndex] = useState(initialTopic?.order_index ?? 1);
  const [guideContent, setGuideContent] = useState(initialTopic?.guide_content || '');
  const [fileUrl, setFileUrl] = useState(initialTopic?.guide_file_url || null);
  const [fileName, setFileName] = useState(initialTopic?.guide_file_name || null);

  // Character config
  const [characterConfig, setCharacterConfig] = useState<CharacterConfig>({
    character_name: initialTopic?.character_name || 'AI Mentor',
    character_persona: initialTopic?.character_persona || '',
    character_avatar_type: initialTopic?.character_avatar_type || 'cyber_humanoid',
    character_primary_color: initialTopic?.character_primary_color || '#06b6d4',
    character_secondary_color: initialTopic?.character_secondary_color || '#3b82f6',
    character_greeting: initialTopic?.character_greeting || '',
    character_voice_pitch: initialTopic?.character_voice_pitch ?? 1.0,
    character_voice_rate: initialTopic?.character_voice_rate ?? 1.0
  });

  const [showCharModal, setShowCharModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate character based on title
  const handleAutoGenerateCharacter = () => {
    if (!title.trim()) {
      setError('Masukkan Judul Materi terlebih dahulu untuk mengenerate karakter.');
      return;
    }
    setError(null);
    const generated = generateCharacterForTopic(title, description);
    setCharacterConfig(generated);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await dbService.uploadGuideFile(file);
      setFileUrl(res.url);
      setFileName(res.name);
    } catch (err: any) {
      setError('Gagal mengunggah file: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul materi wajib diisi.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({
        ...(initialTopic?.id ? { id: initialTopic.id } : {}),
        title,
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        order_index: orderIndex,
        guide_content: guideContent.trim() ? guideContent : null,
        guide_file_url: fileUrl,
        guide_file_name: fileName,
        ...characterConfig
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan topik.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl relative my-8">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {isEditing ? 'Edit Materi Pembelajaran' : 'Tambah Materi Baru'}
              </h2>
              <p className="text-xs text-slate-400">Atur kurikulum dan karakter 3D AI Mentor pendamping.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 max-h-[72vh] overflow-y-auto pr-1">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Judul Materi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Quantum Computing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Urutan Belajar
                </label>
                <input
                  type="number"
                  min="1"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Deskripsi Ringkas
              </label>
              <textarea
                rows={2}
                placeholder="Penjelasan singkat fokus materi..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Dedicated Character Generation Section */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30 border border-cyan-500/30 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow"
                    style={{ backgroundColor: characterConfig.character_primary_color }}
                  />
                  <h3 className="text-sm font-bold text-slate-100">Karakter 3D AI Mentor Khusus</h3>
                </div>

                {/* The "Generate Karakter" Button requested by user! */}
                <button
                  type="button"
                  onClick={handleAutoGenerateCharacter}
                  className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Karakter</span>
                </button>
              </div>

              {/* Character Details Pill */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <span>{characterConfig.character_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 uppercase font-mono">
                      {characterConfig.character_avatar_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {characterConfig.character_persona || 'Belum ada persona yang diatur.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCharModal(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4 ml-4 shrink-0 cursor-pointer"
                >
                  Edit Karakter
                </button>
              </div>
            </div>

            {/* Learning Guide / Curriculum Section */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Panduan Belajar (Silabus Admin)
                </label>
                <span className="text-[11px] text-slate-400">Opsional (Markdown)</span>
              </div>

              <textarea
                rows={4}
                value={guideContent}
                onChange={(e) => setGuideContent(e.target.value)}
                placeholder="Tulis silabus, konsep kunci, atau panduan materi di sini..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono focus:border-cyan-400 focus:outline-none"
              />

              {/* File Upload to Supabase Storage */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  {fileName ? (
                    <span className="text-slate-200 font-medium truncate max-w-[200px]">{fileName}</span>
                  ) : (
                    <span>Upload dokumen/PDF panduan (Supabase Storage)</span>
                  )}
                </div>

                <label className="py-1.5 px-3 rounded-lg border border-slate-700 hover:border-cyan-500 bg-slate-900 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? 'Mengunggah...' : 'Pilih File'}</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* AI Fallback Notice */}
              <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
                <Bot className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Logika AI Fallback:</strong> Jika teks panduan dan file dokumen dikosongkan, AI Mentor di VR akan secara otomatis mengambil kurikulum langsung dari otak AI.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Simpan Materi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sub-modal: Character Detailed Editor */}
      {showCharModal && (
        <CharacterEditorModal
          initialConfig={characterConfig}
          topicTitle={title || 'Materi Baru'}
          onSave={(updated) => {
            setCharacterConfig(updated);
            setShowCharModal(false);
          }}
          onClose={() => setShowCharModal(false)}
        />
      )}
    </>
  );
};


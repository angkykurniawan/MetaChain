import React, { useState, useEffect } from 'react';
import { Topic } from '../../types';
import { dbService } from '../../lib/supabase';
import { TopicModal } from './TopicModal';
import { Plus, Edit2, Trash2, Bot, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export const TopicManagement: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<Topic | 'new' | null>(null);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const data = await dbService.getTopics();
      setTopics(data);
    } catch (err) {
      console.error('Failed to fetch topics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleSaveTopic = async (payload: Partial<Topic>) => {
    if (payload.id) {
      await dbService.updateTopic(payload.id, payload);
    } else {
      await dbService.createTopic(payload);
    }
    fetchTopics();
  };

  const handleDeleteTopic = async (id: string, title: string) => {
    if (!confirm(`Hapus materi "${title}" beserta karakter AI pendampingnya?`)) return;
    try {
      await dbService.deleteTopic(id);
      fetchTopics();
    } catch (err) {
      console.error('Failed to delete topic:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Kurikulum & Karakter 3D AI Mentor
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Setiap materi dilengkapi 1 Karakter 3D khusus. Jika panduan belajar dikosongkan, AI Mentor otomatis mengenerate materi di VR.
          </p>
        </div>

        <button
          onClick={() => setActiveModal('new')}
          className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Materi Baru</span>
        </button>
      </div>

      {/* Grid of Topics */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          Memuat daftar kurikulum...
        </div>
      ) : topics.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          Belum ada topik pembelajaran. Tambahkan topik baru dengan tombol di atas.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((t) => {
            const hasCustomGuide = Boolean(t.guide_content || t.guide_file_url);

            return (
              <div
                key={t.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg hover:shadow-cyan-950/20 relative group"
              >
                <div>
                  {/* Top Header: Order index + Actions */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
                      MODUL #{t.order_index}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveModal(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                        title="Edit Materi & Karakter"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(t.id, t.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                        title="Hapus Materi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {t.description || 'Tidak ada deskripsi singkat.'}
                  </p>

                  {/* Dedicated AI Character Badge */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                        Karakter Mentor Khusus
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shadow-sm"
                          style={{ backgroundColor: t.character_primary_color }}
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full shadow-sm"
                          style={{ backgroundColor: t.character_secondary_color }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">
                        {t.character_name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-cyan-400 font-mono">
                        {t.character_avatar_type.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 italic">
                      "{t.character_persona || 'Belum diatur'}"
                    </p>
                  </div>
                </div>

                {/* Bottom Guide Status Pill */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  {hasCustomGuide ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Panduan Admin Terpasang</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-400">
                      <Bot className="w-3.5 h-3.5" />
                      <span>Mode AI Fallback Otomatis</span>
                    </span>
                  )}

                  {t.guide_file_url && (
                    <a
                      href={t.guide_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 underline"
                    >
                      <FileText className="w-3 h-3" />
                      <span>PDF</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Topic Modal */}
      {activeModal && (
        <TopicModal
          initialTopic={activeModal === 'new' ? null : activeModal}
          onSave={handleSaveTopic}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};


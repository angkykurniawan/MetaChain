import React, { useState, useEffect, useMemo } from 'react';
import { Topic, AvatarModelType } from '../../types';
import { dbService } from '../../lib/supabase';
import { useLanguage } from '../../lib/i18n';
import { TopicModal } from './TopicModal';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Bot, 
  Sparkles, 
  FileText, 
  CheckCircle2,
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  BookOpen
} from 'lucide-react';

export const TopicManagement: React.FC = () => {
  const { lang } = useLanguage();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<Topic | 'new' | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [guideFilter, setGuideFilter] = useState<'all' | 'custom' | 'ai'>('all');
  const [avatarFilter, setAvatarFilter] = useState<'all' | AvatarModelType>('all');
  const [sortBy, setSortBy] = useState<'order-asc' | 'order-desc' | 'title-asc' | 'title-desc'>('order-asc');

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

  const handleResetFilters = () => {
    setSearchQuery('');
    setGuideFilter('all');
    setAvatarFilter('all');
    setSortBy('order-asc');
  };

  const hasActiveFilter = searchQuery.trim() !== '' || guideFilter !== 'all' || avatarFilter !== 'all' || sortBy !== 'order-asc';

  // Filtered and sorted topics
  const filteredTopics = useMemo(() => {
    return topics
      .filter((t) => {
        // Text search matching across all relevant fields
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = (t.description || '').toLowerCase().includes(q);
          const matchCharName = (t.character_name || '').toLowerCase().includes(q);
          const matchPersona = (t.character_persona || '').toLowerCase().includes(q);
          const matchAvatar = (t.character_avatar_type || '').toLowerCase().replace(/_/g, ' ').includes(q);
          const matchModule = `modul #${t.order_index}`.toLowerCase().includes(q) || `#${t.order_index}`.includes(q) || String(t.order_index) === q;

          if (!matchTitle && !matchDesc && !matchCharName && !matchPersona && !matchAvatar && !matchModule) {
            return false;
          }
        }

        // Guide status filter
        const hasCustomGuide = Boolean(t.guide_content || t.guide_file_url);
        if (guideFilter === 'custom' && !hasCustomGuide) return false;
        if (guideFilter === 'ai' && hasCustomGuide) return false;

        // Avatar type filter
        if (avatarFilter !== 'all' && t.character_avatar_type !== avatarFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'order-asc') return a.order_index - b.order_index;
        if (sortBy === 'order-desc') return b.order_index - a.order_index;
        if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
        if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
        return 0;
      });
  }, [topics, searchQuery, guideFilter, avatarFilter, sortBy]);

  return (
    <div className="space-y-5">
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
          className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Materi Baru</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'Search module title, description, mentor, avatar...'
                  : 'Cari judul materi, deskripsi, nama mentor, tipe avatar...'
              }
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title={lang === 'en' ? 'Clear search' : 'Hapus pencarian'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters (Grid on mobile, flex on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 lg:flex lg:items-center">
            {/* Guide Type Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={guideFilter}
                onChange={(e) => setGuideFilter(e.target.value as any)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer w-full"
              >
                <option value="all" className="bg-slate-900 text-slate-200">
                  {lang === 'en' ? 'All Silabus' : 'Semua Silabus'}
                </option>
                <option value="custom" className="bg-slate-900 text-slate-200">
                  {lang === 'en' ? 'Admin Guide' : 'Panduan Admin'}
                </option>
                <option value="ai" className="bg-slate-900 text-slate-200">
                  {lang === 'en' ? 'AI Fallback' : 'AI Otomatis'}
                </option>
              </select>
            </div>

            {/* Avatar Model Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={avatarFilter}
                onChange={(e) => setAvatarFilter(e.target.value as any)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer w-full"
              >
                <option value="all" className="bg-slate-900 text-slate-200">
                  {lang === 'en' ? 'All Avatars' : 'Semua Avatar'}
                </option>
                <option value="cyber_humanoid" className="bg-slate-900 text-slate-200">
                  Cyber Humanoid
                </option>
                <option value="floating_orb" className="bg-slate-900 text-slate-200">
                  Floating Orb
                </option>
                <option value="mech_guard" className="bg-slate-900 text-slate-200">
                  Mech Guard
                </option>
                <option value="holo_sage" className="bg-slate-900 text-slate-200">
                  Holo Sage
                </option>
              </select>
            </div>

            {/* Sort Order Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer w-full"
              >
                <option value="order-asc" className="bg-slate-900 text-slate-200">
                  {lang === 'en' ? 'Module # (Asc)' : 'Modul # (Terkecil)'}
                </option>
                <option value="order-desc" className="bg-slate-900 text-slate-200">
                  {lang === 'en' ? 'Module # (Desc)' : 'Modul # (Terbesar)'}
                </option>
                <option value="title-asc" className="bg-slate-900 text-slate-200">
                  {lang === 'en' ? 'Title (A-Z)' : 'Judul (A - Z)'}
                </option>
                <option value="title-desc" className="bg-slate-900 text-slate-200">
                  {lang === 'en' ? 'Title (Z-A)' : 'Judul (Z - A)'}
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Counter & Active Filter Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              {hasActiveFilter
                ? lang === 'en'
                  ? `Showing ${filteredTopics.length} of ${topics.length} learning modules`
                  : `Menampilkan ${filteredTopics.length} dari ${topics.length} materi pembelajaran`
                : lang === 'en'
                ? `Total ${topics.length} learning modules`
                : `Total ${topics.length} materi pembelajaran`}
            </span>
          </div>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{lang === 'en' ? 'Reset All Filters' : 'Reset Semua Filter'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Topics or Empty States */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          Memuat daftar kurikulum...
        </div>
      ) : topics.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          Belum ada topik pembelajaran. Tambahkan topik baru dengan tombol di atas.
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-8">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3">
            <Search className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">
            {lang === 'en' ? 'No matching learning topics found' : 'Tidak ada materi yang sesuai pencarian'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4 leading-relaxed">
            {searchQuery
              ? lang === 'en'
                ? `No topics match "${searchQuery}". Try using different keywords or reset the filters.`
                : `Tidak ada materi yang cocok dengan "${searchQuery}". Coba gunakan kata kunci lain atau reset filter.`
              : lang === 'en'
              ? 'No topics match the selected filters.'
              : 'Tidak ada materi yang sesuai dengan kombinasi filter yang dipilih.'}
          </p>
          <button
            onClick={handleResetFilters}
            className="py-1.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Reset Filters' : 'Reset Filter Pencarian'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((t) => {
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

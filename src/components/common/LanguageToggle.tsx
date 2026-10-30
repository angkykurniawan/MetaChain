import React from 'react';
import { useLanguage, Language } from '../../lib/i18n';
import { Globe } from 'lucide-react';

export const LanguageToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`inline-flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-md ${className}`}>
      <Globe className="w-3.5 h-3.5 text-cyan-400 ml-1.5 mr-1 shrink-0" />
      <button
        type="button"
        onClick={() => setLang('id')}
        className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
          lang === 'id'
            ? 'bg-cyan-500 text-slate-950 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`}
        title="Beralih ke Bahasa Indonesia"
      >
        <span>🇮🇩</span>
        <span>ID</span>
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
          lang === 'en'
            ? 'bg-cyan-500 text-slate-950 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`}
        title="Switch to English"
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
};

import React from 'react';
import { useTheme } from '../../lib/theme';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-700/80 text-amber-400 hover:text-amber-300 hover:border-amber-400/50 shadow-md'
          : 'bg-white border-slate-300 text-blue-600 hover:text-blue-700 hover:border-blue-400 shadow-md'
      } ${className}`}
      title={theme === 'dark' ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
};


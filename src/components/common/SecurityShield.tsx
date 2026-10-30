import React, { useState, useEffect } from 'react';
import { Profile } from '../../types';
import { ShieldAlert, Lock, AlertTriangle, EyeOff, X } from 'lucide-react';

interface SecurityShieldProps {
  currentUser?: Profile | null;
  children: React.ReactNode;
}

export const SecurityShield: React.FC<SecurityShieldProps> = ({ currentUser, children }) => {
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Detect PrintScreen
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        e.stopPropagation();
        try {
          navigator.clipboard?.writeText('');
        } catch {}
        setSecurityNotice('Tombol PrintScreen (Tangkapan Layar) diblokir oleh sistem.');
        setSecurityModalOpen(true);
        return false;
      }

      // 2. Detect Windows Snipping Tool (Win + Shift + S / Ctrl + Shift + S)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        try {
          navigator.clipboard?.writeText('');
        } catch {}
        setSecurityNotice('Kombinasi tombol Snipping Tool / Screenshot diblokir.');
        setSecurityModalOpen(true);
        return false;
      }

      // 3. Detect Print to PDF / Hardcopy (Ctrl + P)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        setToastMessage('⚠️ Mencetak dokumen kurikulum diblokir oleh sistem keamanan.');
        return false;
      }

      // 4. Detect Save Page (Ctrl + S)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S') && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        setToastMessage('⚠️ Menyimpan halaman dilarang.');
        return false;
      }

      // 5. Detect View Source (Ctrl + U)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // 6. Detect Developer Tools (F12, Ctrl + Shift + I/J/C)
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        setToastMessage('⚠️ Fitur inspeksi kode (DevTools) dinonaktifkan.');
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setToastMessage('⚠️ Klik kanan dinonaktifkan untuk melindungi hak cipta konten.');
      return false;
    };

    const handleWindowBlur = () => {
      // Layar disamarkan saat jendela kehilangan fokus (misal saat membuka snipping tool/screen recorder)
      setIsWindowBlurred(true);
    };

    const handleWindowFocus = () => {
      setIsWindowBlurred(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsWindowBlurred(true);
      } else {
        setIsWindowBlurred(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* Konten Utama */}
      <div className={`w-full h-full transition-all duration-200 ${isWindowBlurred ? 'filter blur-2xl opacity-20' : ''}`}>
        {children}
      </div>

      {/* Watermark Spasial Dinamis (Mencegah Foto Eksternal / Kamera HP) */}
      <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden flex flex-wrap gap-20 p-8 opacity-[0.035] select-none text-white font-mono text-xs font-bold rotate-[-15deg] items-center justify-around">
        {[...Array(24)].map((_, idx) => (
          <div key={idx} className="whitespace-nowrap tracking-widest uppercase">
            METACHAIN SECURE • {currentUser?.username || 'STUDENT'} • ID:{currentUser?.id?.slice(0, 8) || 'VERIFIED'}
          </div>
        ))}
      </div>

      {/* Toast Peringatan Keamanan Ringan */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 py-2 px-4 rounded-xl bg-rose-950/90 border border-rose-500/60 text-rose-200 text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Overlay Penyamar Layar Saat Jendela Tidak Aktif (Anti-Recording Tool) */}
      {isWindowBlurred && (
        <div 
          onClick={() => setIsWindowBlurred(false)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4 animate-pulse">
            <EyeOff className="w-8 h-8" />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-white max-w-md">
            ⚠️ KONTEN DILINDUNGI SISTEM KEAMANAN (ANTI-SCREENSHOT & RECORDING)
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
            Layar disembunyikan sementara saat jendela tidak aktif untuk melindungi hak cipta dan mencegah perekaman layar.
          </p>
          <button
            type="button"
            onClick={() => setIsWindowBlurred(false)}
            className="mt-6 py-2 px-5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-rose-500/20 cursor-pointer"
          >
            Klik untuk Melanjutkan Pembelajaran
          </button>
        </div>
      )}

      {/* Modal Dialog Pelanggaran Screenshot */}
      {securityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-500/50 p-6 sm:p-7 shadow-2xl shadow-rose-950/60 relative text-left">
            <button
              onClick={() => setSecurityModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <span>⚠️ KONTEN DILINDUNGI SISTEM KEAMANAN</span>
            </h3>
            <p className="text-xs font-bold text-rose-400 font-mono mt-0.5 tracking-wider uppercase">
              (ANTI-SCREENSHOT & RECORDING)
            </p>

            <div className="mt-3.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
              <p className="font-semibold text-rose-300">
                {securityNotice || 'Aktivitas tangkapan layar (screenshot) terdeteksi dan diblokir.'}
              </p>
              <p className="text-slate-400 text-[11px]">
                Materi pembelajaran, transkrip tanya jawab, dan avatar 3D di platform ini dilindungi oleh hak kekayaan intelektual. Seluruh aktivitas tangkapan layar atau perekaman layar dilarang oleh institusi.
              </p>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSecurityModalOpen(false)}
                className="py-2 px-5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Saya Mengerti & Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


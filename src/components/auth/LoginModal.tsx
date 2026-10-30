import React, { useState } from 'react';
import { dbService, isLiveSupabase } from '../../lib/supabase';
import { Profile } from '../../types';
import { Shield, Sparkles, LogIn, UserCheck, AlertCircle, Cpu, Database } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (user: Profile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Harap isi username dan password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await dbService.login(username, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Gagal login. Periksa username dan password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin');
    } else {
      setUsername('student1');
      setPassword('user123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-radial from-slate-900 via-slate-950 to-black relative overflow-hidden">
      {/* Background glowing cyber rings */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 shadow-2xl shadow-cyan-950/50 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/30 mb-4 animate-float">
            <Cpu className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
            MetaChain
          </h1>
          <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold mt-1">
            WebXR Tech Academy & 3D AI Mentors
          </p>
        </div>

        {/* Database Status Pill */}
        <div className="mb-6 flex items-center justify-center gap-2 text-xs py-1.5 px-3 rounded-full border bg-slate-800/60 border-slate-700">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">Database:</span>
          {isLiveSupabase ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Supabase Cloud Live
            </span>
          ) : (
            <span className="text-amber-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Local Storage Mode
            </span>
          )}
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder:text-slate-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder:text-slate-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 active:scale-[0.99] transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Masuk ke Platform
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Chips */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-3 font-medium">Uji Coba Cepat (One-Click Credentials):</p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="py-2 px-3 rounded-xl border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/80 bg-slate-800/40 text-xs font-medium text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Admin Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('user')}
              className="py-2 px-3 rounded-xl border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/80 bg-slate-800/40 text-xs font-medium text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Siswa Demo (VR)</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
            *Akun siswa wajib didaftarkan oleh Administrator melalui Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};


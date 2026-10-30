import React, { useState } from 'react';
import { useLanguage } from '../../lib/i18n';
import { ThemeToggle } from '../common/ThemeToggle';
import { 
  Cpu, 
  Glasses, 
  Bot, 
  Volume2, 
  Lock, 
  Globe, 
  Sparkles, 
  Mail, 
  Copy, 
  Check, 
  ArrowRight, 
  ChevronRight, 
  Layers, 
  Shield, 
  ExternalLink,
  Code2,
  Terminal,
  Activity,
  UserCheck
} from 'lucide-react';

interface LandingPageProps {
  onOpenLogin: () => void;
}

const MODULES_SHOWCASE = [
  { id: 1, title: 'Blockchain Architecture & Consensus', mentor: 'Cipher-304', color: '#f59e0b', tag: 'Web3 / Crypto' },
  { id: 2, title: 'Web3 & Smart Contracts', mentor: 'Solidity-Bot', color: '#10b981', tag: 'Decentralized' },
  { id: 3, title: 'Cloud Computing & Distributed Systems', mentor: 'Nimbus-42', color: '#60a5fa', tag: 'Cloud / Server' },
  { id: 4, title: 'DevOps & CI/CD Pipelines', mentor: 'Nexus-Ops', color: '#b45309', tag: 'Automation' },
  { id: 5, title: 'Modern Programming & Algorithms', mentor: 'Code-Sensei', color: '#06b6d4', tag: 'Software Eng' },
  { id: 6, title: 'Computer Networks & Protocols', mentor: 'Synapse-77', color: '#a855f7', tag: 'Networking' },
  { id: 7, title: 'Cybersecurity & Ethical Hacking', mentor: 'Aegis-99', color: '#ef4444', tag: 'Zero Trust' },
  { id: 8, title: 'Artificial Intelligence & Machine Learning', mentor: 'Cortex-AI', color: '#ec4899', tag: 'Deep Learning' },
  { id: 9, title: 'High-Scale System Design', mentor: 'Architect-Prime', color: '#6366f1', tag: 'Scalability' },
  { id: 10, title: 'Spatial Computing & WebXR', mentor: 'Vector-XR', color: '#14b8a6', tag: '3D & Virtual' },
  { id: 11, title: 'Internet of Things (IoT) & Embedded', mentor: 'Sensor-Node', color: '#8b5cf6', tag: 'Hardware' }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLogin }) => {
  const { lang, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const contactEmail = 'kurniawan.angang2005@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailtoUrl = `mailto:${contactEmail}?subject=Permintaan%20Akses%20Demo%20MetaChain&body=Halo%20Admin%20MetaChain%2C%0A%0ASaya%20tertarik%20untuk%20mencoba%20akses%20demo%20siswa%20di%20platform%20MetaChain%20WebXR.%20Mohon%20informasi%20kredensial%20akun%20demo.%0A%0ATerima%20kasih.`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Background glowing cyber grids */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent pointer-events-none blur-3xl" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">MetaChain</span>
              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase">
                WebXR
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">
              {t.navFeatures}
            </a>
            <a href="#modules" className="hover:text-cyan-400 transition-colors">
              {t.navModules}
            </a>
            <a href="#demo-access" className="hover:text-cyan-400 transition-colors text-amber-400 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{t.navDemo}</span>
            </a>
          </nav>

          {/* Right Controls: Theme Toggle & Sign In */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <button
              onClick={onOpenLogin}
              className="py-1.5 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/25 transition-all cursor-pointer active:scale-95"
            >
              <span>{t.loginBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 py-1 px-3.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-6 shadow-sm shadow-cyan-500/20 animate-float">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next-Gen Spatial Computing & AI Mentors</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
          {t.heroHeadline}
        </h1>

        {/* Hero Subheadline */}
        <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t.heroSubheadline}
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto py-3 px-7 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Glasses className="w-4 h-4" />
            <span>{t.exploreBtn}</span>
          </button>

          <a
            href="#demo-access"
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 text-slate-200 text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <Mail className="w-4 h-4 text-amber-400" />
            <span>{t.requestDemoBtn}</span>
          </a>
        </div>

        {/* Badges / Tech Highlights */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-slate-400">
          <div className="py-1 px-3 rounded-full bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
            <Glasses className="w-3.5 h-3.5 text-cyan-400" />
            <span>WebXR 3D Ready</span>
          </div>
          <div className="py-1 px-3 rounded-full bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clear Voice + Text HUD</span>
          </div>
          <div className="py-1 px-3 rounded-full bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>Zero-Retention Privacy</span>
          </div>
          <div className="py-1 px-3 rounded-full bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>Strict Bilingual (ID/EN)</span>
          </div>
        </div>

        {/* 3D VR Academy Interactive Preview Mockup Card */}
        <div className="mt-14 relative max-w-4xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-cyan-500/40 via-blue-500/20 to-slate-800/40 shadow-2xl shadow-cyan-950/60">
          <div className="rounded-[22px] bg-slate-950/95 border border-slate-800 p-6 sm:p-8 text-left relative overflow-hidden">
            {/* Hologram Grid in background */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-4 max-w-lg">
                <div className="inline-flex items-center gap-2 py-1 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>3D Mentor Online: Nimbus-42 (Cloud Computing)</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Interaksi Belajar Spasial Dua Arah Secara Real-Time
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Putar kamera 360° dengan sentuhan jari atau mouse, dengarkan penjelasan mentor lewat suara alami berdefinisi tinggi, dan baca transkrip teks langsung di panel Hologram HUD.
                </p>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs text-slate-300 flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
                  <p className="italic font-mono text-[11px] text-cyan-200">
                    "Halo! Saya Nimbus-42. AI ini dapat membuat kesalahan. Mari kita bedah arsitektur komputasi awan skala global!"
                  </p>
                </div>
              </div>

              {/* VR Avatar Mockup Orb */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex items-center justify-center bg-gradient-to-tr from-cyan-950 to-slate-900 border border-cyan-500/40 shadow-2xl shadow-cyan-500/20 shrink-0">
                <div className="absolute inset-2 rounded-full border border-dashed border-cyan-400/40 animate-spin" style={{ animationDuration: '20s' }} />
                <div className="w-24 h-24 rounded-full bg-cyan-500/20 flex items-center justify-center animate-pulse">
                  <Bot className="w-12 h-12 text-cyan-400" />
                </div>
                <span className="absolute bottom-3 py-0.5 px-2.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-mono font-bold text-cyan-300">
                  Holo-Sage
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Demo Access Information Section (Requested by User) */}
      <section id="demo-access" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto scroll-mt-20">
        <div className="rounded-3xl p-1 bg-gradient-to-r from-amber-500/40 via-orange-500/30 to-cyan-500/40 shadow-2xl shadow-amber-950/40">
          <div className="rounded-[22px] bg-slate-900/95 border border-slate-800 p-6 sm:p-10 text-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 py-1 px-3.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-4">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>{t.demoSectionTitle}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ingin Mencoba Akses Demo atau Bermitra?
            </h2>

            <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {t.demoSectionDesc}
            </p>

            {/* Email Box Pill with Quick Actions */}
            <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-3 p-2 rounded-2xl bg-slate-950/90 border border-amber-500/40 shadow-lg">
              <div className="flex items-center gap-2 px-3 py-1.5 font-mono text-sm sm:text-base font-bold text-amber-300">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>{contactEmail}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={mailtoUrl}
                  className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t.sendEmailBtn}</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                  title={t.copyEmailBtn}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">{t.emailCopiedMsg}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.copyEmailBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-5 text-[11px] text-slate-400 flex items-center justify-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Untuk pengujian cepat, Anda juga bisa mencoba akun demo langsung melalui tombol Login di pojok kanan atas.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Key Spatial Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.featuresTitle}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Didesain khusus untuk pembelajaran teknologi modern dengan performa tinggi dan nol biaya server.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-lg hover:shadow-cyan-950/20 group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <Glasses className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Ruang 3D WebXR Spasial</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dapat diakses langsung lewat peramban web tanpa instalasi. Mendukung rotasi kamera 360° lewat sentuhan layar ponsel, drag mouse, maupun headset VR.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all shadow-lg hover:shadow-emerald-950/20 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">1 Mentor 3D Khusus per Topik</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Setiap materi memiliki 1 Karakter 3D unik dengan tipe model avatar, warna neon, gaya persona, dan modulasi suara sintetis tersendiri.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition-all shadow-lg hover:shadow-blue-950/20 group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Respon Suara & Teks Simultan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Jawaban AI diperdengarkan dengan suara jernih berdefinisi tinggi dan sekaligus ditampilkan dalam gelembung teks hologram interaktif yang mudah dibaca.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all shadow-lg hover:shadow-purple-950/20 group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Multi-LLM & Offline Heuristik</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dapat beroperasi gratis dengan mesin offline heuristik lokal, atau terhubung dengan Google Gemini, OpenAI, Claude, dan DeepSeek melalui API key admin.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-red-500/40 transition-all shadow-lg hover:shadow-red-950/20 group">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 group-hover:scale-110 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Zero-Retention Privacy (RAM-Only)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Riwayat obrolan tanya jawab tidak disimpan di database manapun. Begitu Anda berganti materi atau logout, percakapan langsung terhapus bersih dari memori.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all shadow-lg hover:shadow-amber-950/20 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Bilingual Terkunci (ID / EN)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bebas dari bahasa yang tidak didukung. Terfokus penuh pada Bahasa Indonesia dan English untuk menjamin kejelasan artikulasi audio dan akurasi materi.
            </p>
          </div>
        </div>
      </section>

      {/* 11 Modules Grid Showcase */}
      <section id="modules" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Kurikulum Komprehensif</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.modulesTitle}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            {t.modulesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES_SHOWCASE.map((m) => (
            <div
              key={m.id}
              onClick={onOpenLogin}
              className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-3 group cursor-pointer hover:bg-slate-900"
            >
              <div className="flex items-center gap-3 truncate">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: m.color }}
                />
                <div className="truncate">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Modul #{m.id} • {m.tag}
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
                    {m.title}
                  </h4>
                  <div className="text-[11px] text-cyan-400 font-medium">
                    Mentor: {m.mentor}
                  </div>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-xs">
              M
            </div>
            <span className="font-bold text-sm text-white">MetaChain WebXR Academy</span>
          </div>

          <div className="text-xs text-slate-400 text-center sm:text-right">
            <span>Kontak Demo: </span>
            <a href={mailtoUrl} className="text-amber-400 hover:underline font-mono">
              {contactEmail}
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© 2026 MetaChain. Seluruh hak cipta dilindungi.</p>
          <p className="text-amber-400/90 font-medium">
            Pemberitahuan: AI ini dapat membuat kesalahan.
          </p>
        </div>
      </footer>
    </div>
  );
};


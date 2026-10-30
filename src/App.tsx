import React, { useState, useEffect } from 'react';
import { Profile, Topic } from './types';
import { dbService } from './lib/supabase';
import { LanguageProvider, useLanguage } from './lib/i18n';
import { ThemeProvider } from './lib/theme';
import { LoginModal } from './components/auth/LoginModal';
import { LandingPage } from './components/landing/LandingPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { VRCanvas } from './components/vr/VRCanvas';
import { speechEngine } from './lib/speechEngine';

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminViewingVR, setAdminViewingVR] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Load initial topics from Supabase / Local adapter
  const loadTopics = async () => {
    try {
      const data = await dbService.getTopics();
      setTopics(data);
    } catch (err) {
      console.error('Failed to load topics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const handleLoginSuccess = (user: Profile) => {
    setCurrentUser(user);
    setAdminViewingVR(false);
    setShowLoginModal(false);
    loadTopics(); // Refresh latest topics
  };

  const handleLogout = () => {
    // Zero-Retention Policy: cancel any speaking voice and clear memory state
    speechEngine.stopSpeaking();
    setCurrentUser(null);
    setAdminViewingVR(false);
    setShowLoginModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-cyan-400">
          {t.loading}
        </p>
      </div>
    );
  }

  // 1. Not Authenticated -> Show Landing Page with on-demand Login Gateway
  if (!currentUser) {
    return (
      <>
        <LandingPage onOpenLogin={() => setShowLoginModal(true)} />
        {showLoginModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <LoginModal
              onLoginSuccess={handleLoginSuccess}
              onClose={() => setShowLoginModal(false)}
            />
          </div>
        )}
      </>
    );
  }

  // 2. Admin viewing VR Preview mode
  if (currentUser.role === 'admin' && adminViewingVR) {
    return (
      <div className="relative">
        <button
          onClick={() => setAdminViewingVR(false)}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 py-1.5 px-4 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xl cursor-pointer"
        >
          {t.backToAdmin}
        </button>
        <VRCanvas
          currentUser={currentUser}
          topics={topics}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  // 3. Admin Dashboard (Standard 2D Interface - High Speed)
  if (currentUser.role === 'admin') {
    return (
      <AdminDashboard
        currentAdmin={currentUser}
        onLogout={handleLogout}
        onEnterVRPreview={() => setAdminViewingVR(true)}
      />
    );
  }

  // 4. Student User -> Directly enters the 3D WebXR Space
  return (
    <VRCanvas
      currentUser={currentUser}
      topics={topics}
      onLogout={handleLogout}
    />
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;


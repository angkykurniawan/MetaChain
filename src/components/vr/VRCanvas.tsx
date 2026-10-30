import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Topic, EphemeralChatMessage, Profile } from '../../types';
import { createProceduralAvatar, AvatarInstance } from './ProceduralAvatars';
import { createSciFiEnvironment, EnvironmentInstance } from './SciFiEnvironment';
import { HologramHUD } from './HologramHUD';
import { speechEngine } from '../../lib/speechEngine';
import { generateAIAnswer } from '../../lib/characterGen';
import { queryActiveLLMMentor, getActiveAIConfig, PROVIDER_PRESETS } from '../../lib/aiProvider';
import { useLanguage } from '../../lib/i18n';
import { LanguageToggle } from '../common/LanguageToggle';
import { ThemeToggle } from '../common/ThemeToggle';
import { Glasses, LogOut, Compass } from 'lucide-react';

interface VRCanvasProps {
  currentUser: Profile;
  topics: Topic[];
  onLogout: () => void;
}

export const VRCanvas: React.FC<VRCanvasProps> = ({
  currentUser,
  topics,
  onLogout
}) => {
  const { lang, t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTopic, setActiveTopic] = useState<Topic>(topics[0]);
  const [messages, setMessages] = useState<EphemeralChatMessage[]>([]);
  const [isMentorSpeaking, setIsMentorSpeaking] = useState(false);
  const [isVRAvailable, setIsVRAvailable] = useState(false);
  const [isInVR, setIsInVR] = useState(false);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const avatarInstanceRef = useRef<AvatarInstance | null>(null);
  const envInstanceRef = useRef<EnvironmentInstance | null>(null);
  const isSpeakingRef = useRef(false);

  isSpeakingRef.current = isMentorSpeaking;

  // Check WebXR Device Support
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'xr' in navigator) {
      (navigator as any).xr?.isSessionSupported?.('immersive-vr').then((supported: boolean) => {
        setIsVRAvailable(supported);
      }).catch(() => setIsVRAvailable(false));
    }
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.04);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 1.6, 3.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.xr.enabled = true; // Enable native WebXR API
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    // Setup Sci-Fi Environment
    const env = createSciFiEnvironment();
    scene.add(env.group);
    envInstanceRef.current = env;

    // Mouse / Touch Orbit Controls (Desktop fallback)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = 0;
    let sphericalPhi = Math.PI / 2 - 0.1;
    const radius = 3.2;

    const onMouseDown = (e: MouseEvent) => {
      // Don't drag if clicking UI HUD
      if ((e.target as HTMLElement).closest('.hud-overlay')) return;
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      sphericalTheta -= deltaX * 0.005;
      sphericalPhi = Math.max(0.2, Math.min(Math.PI / 2 + 0.3, sphericalPhi - deltaY * 0.005));

      camera.position.x = radius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = 1.4 + radius * Math.cos(sphericalPhi);
      camera.position.z = radius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(0, 1.4, 0);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Mobile Touch Orbit Controls
    const onTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('.hud-overlay')) return;
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;

      sphericalTheta -= deltaX * 0.007;
      sphericalPhi = Math.max(0.2, Math.min(Math.PI / 2 + 0.3, sphericalPhi - deltaY * 0.007));

      camera.position.x = radius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = 1.4 + radius * Math.cos(sphericalPhi);
      camera.position.z = radius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(0, 1.4, 0);
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    // Render loop
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const time = clock.getElapsedTime();
      env.update(time);
      if (avatarInstanceRef.current) {
        avatarInstanceRef.current.update(time, isSpeakingRef.current, camera.position);
      }
      renderer.render(scene, camera);
    });

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', handleResize);
      env.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Avatar when activeTopic changes
  useEffect(() => {
    if (!sceneRef.current) return;

    // Remove old avatar
    if (avatarInstanceRef.current) {
      sceneRef.current.remove(avatarInstanceRef.current.group);
      avatarInstanceRef.current.dispose();
      avatarInstanceRef.current = null;
    }

    // Create new dedicated avatar
    const newAvatar = createProceduralAvatar(
      activeTopic.character_avatar_type,
      activeTopic.character_primary_color,
      activeTopic.character_secondary_color
    );
    newAvatar.group.position.set(0, 0.25, 0);
    sceneRef.current.add(newAvatar.group);
    avatarInstanceRef.current = newAvatar;

    // Update accent light to match avatar neon
    if (envInstanceRef.current) {
      envInstanceRef.current.accentLight.color.set(activeTopic.character_primary_color);
    }

    // Greet the student with the dedicated voice line
    if (activeTopic.character_greeting) {
      setIsMentorSpeaking(true);
      speechEngine.speak({
        text: activeTopic.character_greeting,
        lang: lang,
        pitch: activeTopic.character_voice_pitch,
        rate: activeTopic.character_voice_rate,
        onEnd: () => setIsMentorSpeaking(false),
        onError: () => setIsMentorSpeaking(false)
      });
    }

    // Clear previous chat on topic switch (Zero-Retention Policy)
    setMessages([]);
  }, [activeTopic, lang]);

  // Handle User sending question via Voice or Text
  const handleSendMessage = async (text: string) => {
    const userMsg: EphemeralChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);

    // Generate fallback heuristic answer, then query chosen AI Provider (Google, OpenAI, Claude, DeepSeek)
    const offlineAnswer = generateAIAnswer(activeTopic, text, lang);
    const result = await queryActiveLLMMentor(activeTopic, text, offlineAnswer, lang);

    const mentorMsg: EphemeralChatMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'mentor',
      text: result.text,
      engine: result.engine,
      aiModel: result.modelName,
      timestamp: Date.now()
    };
    setMessages((prev) => [...prev, mentorMsg]);

    // Speak answer through spatial speech engine
    setIsMentorSpeaking(true);
    speechEngine.speak({
      text: result.text,
      lang: lang,
      pitch: activeTopic.character_voice_pitch,
      rate: activeTopic.character_voice_rate,
      onEnd: () => setIsMentorSpeaking(false),
      onError: () => setIsMentorSpeaking(false)
    });
  };

  const handleStopVoice = () => {
    speechEngine.stopSpeaking();
    setIsMentorSpeaking(false);
  };

  const handleEnterVR = async () => {
    if (!rendererRef.current) return;
    try {
      const session = await (navigator as any).xr.requestSession('immersive-vr');
      rendererRef.current.xr.setSession(session);
      setIsInVR(true);
      session.addEventListener('end', () => setIsInVR(false));
    } catch (err) {
      console.error('Failed to start VR session:', err);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-slate-950">
      {/* 3D WebGL Canvas Layer */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Top Floating Control Bar */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-20 flex items-center justify-between pointer-events-none hud-overlay gap-2">
        {/* User Pill */}
        <div className="py-1 px-2.5 sm:py-1.5 sm:px-3.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-xs font-semibold text-slate-200 pointer-events-auto flex items-center gap-1.5 sm:gap-2 shadow-lg max-w-[130px] xs:max-w-[160px] sm:max-w-none truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="truncate">{currentUser.full_name}</span>
          <span className="text-[10px] text-slate-400 font-mono hidden md:inline">({currentUser.role})</span>
        </div>

        {/* Center: WebXR / Orbit Controls Status */}
        <div className="hidden lg:flex items-center gap-2 py-1.5 px-3 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-800 text-[11px] text-slate-400">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.orbitHint}</span>
        </div>

        {/* Action Buttons: Theme Toggle, Language Switcher, Enter VR & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          <ThemeToggle />
          <LanguageToggle />

          {isVRAvailable && (
            <button
              onClick={handleEnterVR}
              className="py-1 px-2.5 sm:py-1.5 sm:px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <Glasses className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isInVR ? t.inVRStatus : t.enterVRBtn}</span>
            </button>
          )}

          <button
            onClick={() => {
              speechEngine.stopSpeaking();
              onLogout();
            }}
            className="py-1 px-2 sm:py-1.5 sm:px-3 rounded-xl bg-slate-900/80 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-300 text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shadow-lg"
            title={t.logout}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t.logout}</span>
          </button>
        </div>
      </div>

      {/* Floating Spatial Hologram HUD (Positioned in VR Space) */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 right-2 sm:right-auto sm:left-6 z-20 pointer-events-auto hud-overlay flex justify-center sm:justify-start">
        <HologramHUD
          currentTopic={activeTopic}
          allTopics={topics}
          onSelectTopic={(t) => setActiveTopic(t)}
          messages={messages}
          isMentorSpeaking={isMentorSpeaking}
          onSendMessage={handleSendMessage}
          onStopVoice={handleStopVoice}
        />
      </div>
    </div>
  );
};


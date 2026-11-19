import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { Volume2, VolumeX, Play, Pause, ArrowRight, ArrowLeft, X, Sparkles, AudioLines, CheckCircle2 } from 'lucide-react';

export interface TourStep {
  id: string;
  targetId: string;
  title: string;
  text: string;
  audioSrc: string;
  position?: 'top' | 'bottom' | 'center';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-1',
    targetId: 'tour-brand',
    title: 'Selamat Datang di Buku Saku MPP',
    text: 'Halo, selamat datang di Buku Saku Digital, Mal Pelayanan Publik Kabupaten Madiun. Saya adalah Voice AI Buku Saku. Izinkan saya memandu Anda mengenal fitur-fitur utama web ini secara singkat dan mudah.',
    audioSrc: '/audio/tour_step1.mp3',
    position: 'bottom'
  },
  {
    id: 'step-2',
    targetId: 'tour-search',
    title: 'Tanya Jawab & Voice Note AI',
    text: 'Pertama, di bilah pencarian ini, Anda dapat menanyakan persyaratan izin, berkas, atau alur layanan cukup dengan mengetik atau berbicara langsung menggunakan tombol Voice Note kami.',
    audioSrc: '/audio/tour_step2.mp3',
    position: 'bottom'
  },
  {
    id: 'step-3',
    targetId: 'tour-stats',
    title: 'Katalog Standar Pelayanan & RAG Resmi',
    text: 'Kedua, jelajahi lebih dari delapan puluh jenis standar pelayanan resmi terlengkap dari Disdukcapil, DPMPTSP, hingga instansi terkait, semuanya resmi, transparan, dan bebas calo.',
    audioSrc: '/audio/tour_step3.mp3',
    position: 'top'
  },
  {
    id: 'step-4',
    targetId: 'tour-floating-dock',
    title: 'Bantuan Langsung Loket MPP',
    text: 'Ketiga, di pojok kanan bawah tersedia tombol WhatsApp resmi dan kontak pengaduan untuk terhubung langsung dengan petugas loket Mal Pelayanan Publik Kabupaten Madiun.',
    audioSrc: '/audio/tour_step4.mp3',
    position: 'top'
  },
  {
    id: 'step-5',
    targetId: 'tour-brand',
    title: 'Siap Menjelajahi Layanan',
    text: 'Panduan selesai! Anda dapat mulai mencari perizinan atau menekan tombol Voice Note kapan saja. Selamat memanfaatkan layanan digital MPP Kabupaten Madiun!',
    audioSrc: '/audio/tour_step5.mp3',
    position: 'bottom'
  }
];

interface VoiceAiWelcomeTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAiWelcomeTour: React.FC<VoiceAiWelcomeTourProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const threeSceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    particles: THREE.Points;
    targetX: number;
    targetY: number;
    animId: number;
  } | null>(null);

  // Initialize or Clean Audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(100);
      // Auto-advance after brief pause
      if (currentStep < TOUR_STEPS.length - 1) {
        setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
        }, 800);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [currentStep]);

  // Load and play audio for active step
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    const step = TOUR_STEPS[currentStep];
    if (audioRef.current && step) {
      audioRef.current.src = step.audioSrc;
      audioRef.current.currentTime = 0;
      audioRef.current.muted = isMuted;

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.log('Audio autoplay prevented or waiting for interaction:', err);
            setIsPlaying(false);
          });
      }
    }
  }, [currentStep, isOpen, isMuted]);

  // Three.js Animated Particles Canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Cloud Geometry
    const particleCount = 180;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const emeraldColor = new THREE.Color('#10b981');
    const amberColor = new THREE.Color('#fbbf24');
    const cyanColor = new THREE.Color('#06b6d4');

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      const mixedColor = Math.random() > 0.5 ? emeraldColor : Math.random() > 0.5 ? amberColor : cyanColor;
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;

      scales[i] = Math.random() * 2 + 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Smooth Circular Particle Texture
    const particleTexture = createCircleTexture();
    const material = new THREE.PointsMaterial({
      size: 3.5,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    threeSceneRef.current = {
      renderer,
      scene,
      camera,
      particles,
      targetX: 0,
      targetY: 0,
      animId: 0
    };

    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const st = threeSceneRef.current;
      if (!st) return;

      // Smooth floating particle motion
      particles.rotation.y = elapsedTime * 0.05;
      particles.rotation.x = Math.sin(elapsedTime * 0.03) * 0.1;

      // Smoothly steer camera towards spotlight target
      camera.position.x += (st.targetX - camera.position.x) * 0.05;
      camera.position.y += (st.targetY - camera.position.y) * 0.05;

      renderer.render(scene, camera);
      st.animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!threeSceneRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (threeSceneRef.current) {
        cancelAnimationFrame(threeSceneRef.current.animId);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        threeSceneRef.current = null;
      }
    };
  }, [isOpen]);

  // Calculate Target Spotlight Rectangle & Three.js Focus Point
  const updateTargetRect = useCallback(() => {
    if (!isOpen) return;

    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    const el = document.getElementById(step.targetId);
    if (el) {
      // Smoothly scroll target element into viewport
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Allow scroll to complete before measuring
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);

        // Map screen coordinates to Three.js coordinates
        if (threeSceneRef.current) {
          const normX = (rect.left + rect.width / 2) / window.innerWidth - 0.5;
          const normY = -((rect.top + rect.height / 2) / window.innerHeight - 0.5);
          threeSceneRef.current.targetX = normX * 40;
          threeSceneRef.current.targetY = normY * 30;
        }
      }, 300);
    } else {
      setTargetRect(null);
    }
  }, [currentStep, isOpen]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [updateTargetRect]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    audioRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    localStorage.setItem('bukusaku_tour_completed', 'true');
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = TOUR_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none pointer-events-auto">
      {/* 1. Three.js Background Particle Stream */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* 2. Cinematic Spotlight Dimming & Blur Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="spotlight-mask">
              {/* Full White background covers everything */}
              <rect width="100%" height="100%" fill="white" />
              {/* Black cutout over the target element lets it shine clear and unblurred */}
              {targetRect && (
                <rect
                  x={Math.max(8, targetRect.left - 12)}
                  y={Math.max(8, targetRect.top - 12)}
                  width={targetRect.width + 24}
                  height={targetRect.height + 24}
                  rx="24"
                  fill="black"
                />
              )}
            </mask>
          </defs>

          {/* Dark Frosting Fill masked out where target is */}
          <rect
            width="100%"
            height="100%"
            fill="rgba(2, 6, 23, 0.78)"
            mask="url(#spotlight-mask)"
            className="backdrop-blur-md transition-all duration-500"
          />
        </svg>

        {/* 3. Glowing Target Highlight Border */}
        {targetRect && (
          <div
            className="absolute rounded-3xl border-2 border-emerald-400/80 shadow-[0_0_35px_rgba(52,211,153,0.5)] transition-all duration-500 pointer-events-none animate-pulse"
            style={{
              left: Math.max(8, targetRect.left - 12),
              top: Math.max(8, targetRect.top - 12),
              width: targetRect.width + 24,
              height: targetRect.height + 24
            }}
          >
            <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
              <AudioLines className="w-3 h-3" />
              <span>Fitur Terpilih</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Interactive Floating Voice AI HUD Card */}
      <div className="absolute inset-x-0 bottom-4 sm:bottom-8 z-30 flex justify-center px-4 pointer-events-auto">
        <div className="w-full max-w-xl rounded-2xl sm:rounded-3xl bg-slate-900/95 border border-emerald-500/40 p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)] shadow-emerald-950/40 backdrop-blur-2xl text-white transition-all duration-300">
          
          {/* Top Bar: Voice AI Badge, Progress Bar, Close */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <AudioLines className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                  VoiceAI Buku Saku
                </span>
                <span className="text-[10px] text-white/50 block font-medium">
                  Panduan Interaktif Suara Resmi MPP
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Step Counter Badge */}
              <span className="text-xs font-mono font-bold text-slate-300 px-2.5 py-1 rounded-full bg-white/10 border border-white/15">
                {currentStep + 1} / {TOUR_STEPS.length}
              </span>

              {/* Close / Skip Button */}
              <button
                onClick={handleComplete}
                className="p-1.5 rounded-xl hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Lewati panduan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Audio Waveform Live Timeline */}
          <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300 transition-all duration-150 rounded-full"
              style={{ width: `${audioProgress}%` }}
            />
          </div>

          {/* Title & Speech Content */}
          <div className="mb-5">
            <h3 className="font-display font-bold text-lg sm:text-xl text-white mb-1.5 flex items-center gap-2">
              <span>{currentStepData.title}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal bg-slate-950/40 p-3 rounded-xl border border-white/10">
              "{currentStepData.text}"
            </p>
          </div>

          {/* Interactive Controls Toolbar */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
            {/* Audio Toggle (Play/Pause & Mute) */}
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/15 transition-all cursor-pointer active:scale-95"
                title={isPlaying ? 'Jeda Suara' : 'Putar Suara'}
              >
                {isPlaying ? <Pause className="w-4 h-4 text-emerald-400" /> : <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />}
                <span className="hidden sm:inline">{isPlaying ? 'Jeda' : 'Dengar'}</span>
              </button>

              <button
                onClick={toggleMute}
                className="p-2 rounded-xl hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Nyalakan Suara' : 'Bisukan'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 border border-white/15 transition-all cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer active:scale-95"
              >
                {currentStep === TOUR_STEPS.length - 1 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>Mulai Eksplorasi</span>
                  </>
                ) : (
                  <>
                    <span>Lanjut</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Helper to create circular particle texture
function createCircleTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

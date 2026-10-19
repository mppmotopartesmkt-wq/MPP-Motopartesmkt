import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface HeroProps {
  onShopNow: () => void;
  onExplore: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopNow, onExplore }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100% of 10s
  const [currentTimeSec, setCurrentTimeSec] = useState(0);

  const DURATION_LIMIT = 10; // Exactly 10 seconds per loop

  // Control video 10-second loop
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;

    if (current >= DURATION_LIMIT) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setProgress(0);
      setCurrentTimeSec(0);
    } else {
      setProgress((current / DURATION_LIMIT) * 100);
      setCurrentTimeSec(Math.min(DURATION_LIMIT, current));
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback: ensure muted
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, []);

  return (
    <div className="relative bg-black overflow-hidden min-h-[600px] lg:min-h-[680px] flex items-center border-b border-gray-800">
      
      {/* Background Video (Pulsar 200 NS on highway, 10s multi-angle takes) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          src="/pulsar-200ns-carretera.mp4"
          autoPlay
          muted={isMuted}
          playsInline
          loop
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
        />

        {/* Cinematic Vignette & Gradients to guarantee high readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/80 pointer-events-none" />
      </div>

      {/* 10-Second Looping Progress Bar (Top of Hero) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-20">
        <div
          className="h-full bg-lime transition-all duration-100 ease-linear shadow-[0_0_10px_#a3e635]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-2xl">
          
          {/* Eyebrow / Model Badge with Live Indicator */}
          <div className="inline-flex items-center gap-2.5 mb-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lime"></span>
            </span>
            <span className="text-lime font-black tracking-[0.2em] text-[11px] sm:text-xs uppercase drop-shadow-sm flex items-center gap-1.5">
              <span>PULSAR 200 NS</span>
              <span className="text-white/40">•</span>
              <span className="text-white font-bold">EN CARRETERA (10s)</span>
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none mb-4">
            DOMINA LA RUTA.{' '}
            <span className="text-lime drop-shadow-[0_0_20px_rgba(163,230,53,0.5)]">
              PULSAR 200 NS.
            </span>
          </h1>

          {/* Subtext description */}
          <p className="text-gray-200 text-sm sm:text-lg max-w-xl mb-6 font-normal leading-relaxed drop-shadow-sm">
            Adrenalina, potencia y precisión en cada curva del asfalto. Repuestos originales, kits de arrastre reforzados, frenos de alto rendimiento y equipamiento para exprimir al máximo tu motocicleta.
          </p>

          {/* Features Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-8 text-[11px] font-bold text-gray-300">
            <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10">
              ⚡ Triple Bujía DTS-i
            </span>
            <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10">
              🛡️ Chasis Perimetral
            </span>
            <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10">
              🏁 Envíos a Todo Colombia
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onShopNow}
              className="bg-lime hover:bg-lime-bright text-black font-black px-8 py-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all transform hover:-translate-y-0.5 shadow-xl shadow-lime/25 flex items-center gap-2"
            >
              <span>COMPRAR REPUESTOS NS 200</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExplore}
              className="bg-white/10 hover:bg-white/20 border border-white/30 hover:border-lime text-white hover:text-lime font-black px-8 py-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider backdrop-blur-md transition-all"
            >
              EXPLORAR CATÁLOGO
            </button>
          </div>

        </div>
      </div>

      {/* Video Interactive Controls Floating Card (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 text-white shadow-2xl">
        
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
          title={isPlaying ? 'Pausar video' : 'Reproducir video'}
        >
          {isPlaying ? <Pause className="w-4 h-4 text-lime" /> : <Play className="w-4 h-4 text-white" />}
        </button>

        {/* Mute/Unmute Button */}
        <button
          onClick={toggleMute}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
          title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-lime" />}
        </button>

        <div className="h-4 w-px bg-white/20" />

        {/* 10s Loop Timer Display */}
        <div className="text-[11px] font-mono font-bold text-gray-300 flex items-center gap-1">
          <span className="text-lime">{currentTimeSec.toFixed(1)}s</span>
          <span className="text-gray-500">/</span>
          <span>10.0s</span>
        </div>

        <span className="text-[9px] font-black uppercase tracking-wider bg-lime/20 text-lime px-2 py-0.5 rounded-md border border-lime/30">
          LOOP 10s
        </span>

      </div>

    </div>
  );
};


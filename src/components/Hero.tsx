import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onShopNow: () => void;
  onExplore: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopNow, onExplore }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  // Background slides
  const slides = [
    {
      subtitle: 'EQUÍPATE. RUEDA AL LÍMITE.',
      title1: 'CREADO PARA',
      title2: 'PILOTOS.',
      description: 'Equipamiento, repuestos y accesorios prémium para cada ruta y cada camino.',
      image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=2000&q=85',
      primaryBtn: 'COMPRAR AHORA',
      secondaryBtn: 'EXPLORAR COLECCIÓN',
    },
    {
      subtitle: 'RENDIMIENTO Y SEGURIDAD',
      title1: 'LISTO PARA LA PISTA',
      title2: 'PRECISIÓN.',
      description: 'Monos y chaquetas deportivas con tecnología Tech-Air, escapes de titanio y llantas de competición.',
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=2000&q=85',
      primaryBtn: 'VER EQUIPACIÓN',
      secondaryBtn: 'DESCUBRIR MARCAS',
    },
    {
      subtitle: 'LIQUIDACIÓN DE TEMPORADA',
      title1: 'HASTA 20% DE',
      title2: 'DESCUENTO.',
      description: 'Ofertas exclusivas por tiempo limitado en cascos certificados de campeonato mundial.',
      image: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=2000&q=85',
      primaryBtn: 'VER OFERTAS',
      secondaryBtn: 'MÁS VENDIDOS',
    },
  ];

  const current = slides[activeSlide];

  return (
    <div className="relative bg-dark-950 overflow-hidden min-h-[580px] lg:min-h-[640px] flex items-center border-b border-dark-800">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={current.image}
          alt="Piloto de motocicleta en carretera"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 filter brightness-75 contrast-110"
        />
        {/* Dark Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-dark-950/60"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="max-w-2xl">
          {/* Eyebrow / Tagline in Lime Green */}
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-lime font-black tracking-[0.2em] text-xs sm:text-sm uppercase drop-shadow-sm">
              {current.subtitle}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none mb-4">
            {current.title1}{' '}
            <span className="text-lime drop-shadow-[0_0_15px_rgba(132,204,22,0.4)]">
              {current.title2}
            </span>
          </h1>

          {/* Subtext description */}
          <p className="text-gray-300 text-sm sm:text-lg max-w-lg mb-8 font-normal leading-relaxed">
            {current.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onShopNow}
              className="bg-lime hover:bg-lime-bright text-black font-extrabold px-8 py-3.5 rounded text-xs sm:text-sm uppercase tracking-wider transition-all transform hover:-translate-y-0.5 shadow-lg shadow-lime/25 flex items-center gap-2"
            >
              <span>{current.primaryBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExplore}
              className="border border-white/40 hover:border-lime text-white hover:text-lime font-bold px-8 py-3.5 rounded text-xs sm:text-sm uppercase tracking-wider backdrop-blur-sm transition-all hover:bg-white/5"
            >
              {current.secondaryBtn}
            </button>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex items-center gap-2.5 mt-14">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`transition-all rounded-full ${
                  activeSlide === idx
                    ? 'w-7 h-2.5 bg-lime'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/80'
                }`}
                aria-label={`Diapositiva ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

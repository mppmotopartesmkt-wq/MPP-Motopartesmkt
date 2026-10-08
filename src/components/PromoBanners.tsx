import React from 'react';
import { ArrowRight } from 'lucide-react';

interface PromoBannersProps {
  onShopDeals: () => void;
  onExploreNew: () => void;
}

export const PromoBanners: React.FC<PromoBannersProps> = ({
  onShopDeals,
  onExploreNew,
}) => {
  return (
    <section className="py-12 px-4 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* BANNER 1: LIMITED TIME OFFER (HASTA 20% DE DESCUENTO) */}
          <div className="relative rounded-lg overflow-hidden bg-dark-900 border border-dark-800 min-h-[260px] sm:min-h-[290px] flex items-center group shadow-md">
            {/* Background Rider Image */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=1200&q=80"
                alt="Piloto de motocicleta"
                className="w-full h-full object-cover object-right filter brightness-75 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/90 to-transparent"></div>
            </div>

            {/* Text Overlay */}
            <div className="relative z-10 p-6 sm:p-10 max-w-sm">
              <span className="text-lime font-black tracking-widest text-[11px] sm:text-xs uppercase block mb-1.5">
                OFERTA POR TIEMPO LIMITADO
              </span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white leading-tight mb-1">
                HASTA 20% OFF
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-6">
                EN EQUIPACIÓN Y REPUESTOS SELECCIONADOS
              </p>
              <button
                onClick={onShopDeals}
                className="bg-lime hover:bg-lime-bright text-black font-black text-xs uppercase tracking-wider py-3 px-6 rounded transition-all transform hover:-translate-y-0.5 shadow-md shadow-lime/20 inline-flex items-center gap-2"
              >
                <span>VER OFERTAS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* BANNER 2: NEW ARRIVALS (EL MEJOR EQUIPAMIENTO) */}
          <div className="relative rounded-lg overflow-hidden bg-dark-900 border border-dark-800 min-h-[260px] sm:min-h-[290px] flex items-center group shadow-md">
            {/* Background Helmet Image */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80"
                alt="Casco de carreras último modelo"
                className="w-full h-full object-cover object-right filter brightness-85 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/85 to-transparent"></div>
            </div>

            {/* Text Overlay */}
            <div className="relative z-10 p-6 sm:p-10 max-w-sm">
              <span className="text-lime font-black tracking-widest text-[11px] sm:text-xs uppercase block mb-1.5">
                NUEVOS LANZAMIENTOS
              </span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white leading-tight mb-6">
                EL MEJOR EQUIPAMIENTO PARA CADA PILOTO
              </h3>
              <button
                onClick={onExploreNew}
                className="border border-white/40 hover:border-lime text-white hover:text-lime font-black text-xs uppercase tracking-wider py-3 px-6 rounded transition-all hover:bg-white/5 inline-flex items-center gap-2 backdrop-blur-sm"
              >
                <span>EXPLORAR AHORA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

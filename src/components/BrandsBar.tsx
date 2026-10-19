import React from 'react';

interface BrandsBarProps {
  onSelectBrand?: (brand: string) => void;
}

export const BrandsBar: React.FC<BrandsBarProps> = ({ onSelectBrand }) => {
  const brandList = [
    {
      name: 'AKT',
      label: 'AKT Motos',
      renderLogo: () => (
        <div className="flex items-center gap-1.5 font-sans font-black italic tracking-tighter">
          <span className="text-2xl text-[#e11d24] group-hover:scale-105 transition-transform">AKT</span>
          <span className="text-[10px] tracking-widest uppercase font-black text-gray-800 not-italic bg-gray-100 px-1 py-0.5 rounded">
            MOTOS
          </span>
        </div>
      ),
    },
    {
      name: 'Auteco',
      label: 'Auteco',
      renderLogo: () => (
        <div className="flex items-center gap-1.5">
          <svg className="w-5 h-5 text-[#002d72]" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" fill="#002d72" />
            <path d="M12 4 L14 10 L20 12 L14 14 L12 20 L10 14 L4 12 L10 10 Z" fill="#e11d24" />
          </svg>
          <span className="text-lg font-black tracking-tighter text-[#002d72]">
            auteco<span className="text-[#e11d24] font-black">.</span>
          </span>
        </div>
      ),
    },
    {
      name: 'Bajaj',
      label: 'Bajaj',
      renderLogo: () => (
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-[#00529b]" viewBox="0 0 32 32" fill="none">
            <path d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z" stroke="#00529b" strokeWidth="2.5" fill="none" />
            <path d="M9 13 Q16 11 23 13 Q16 18 9 20 Q16 17 23 20" stroke="#00529b" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <span className="text-lg font-black tracking-widest text-[#00529b]">BAJAJ</span>
        </div>
      ),
    },
    {
      name: 'Honda',
      label: 'Honda',
      renderLogo: () => (
        <div className="flex items-center gap-2">
          <svg className="w-7 h-5 text-[#cc0000]" viewBox="0 0 40 24" fill="currentColor">
            <path d="M4 21 C10 15 20 8 36 6 C28 8 20 12 14 18 C12 20 8 21 4 21 Z" />
            <path d="M8 18 C14 13 22 8 38 4 C28 6 18 10 12 16 Z" opacity="0.85" />
            <path d="M12 15 C18 10 26 6 40 2 C30 5 20 8 14 13 Z" opacity="0.7" />
          </svg>
          <span className="text-base font-black tracking-wider text-[#cc0000] font-serif">HONDA</span>
        </div>
      ),
    },
    {
      name: 'Pulsar',
      label: 'Pulsar',
      renderLogo: () => (
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-black italic tracking-tight text-gray-900 font-mono">
            <span className="text-lime-dark font-black">p</span>ulsar
          </span>
          <span className="h-1.5 w-6 bg-gradient-to-r from-lime to-black transform -skew-x-12 rounded-xs"></span>
        </div>
      ),
    },
    {
      name: 'TVS',
      label: 'TVS Racing',
      renderLogo: () => (
        <div className="flex items-center gap-1.5">
          <svg className="w-6 h-5 text-[#d32f2f]" viewBox="0 0 32 20" fill="currentColor">
            <path d="M2 14 Q6 10 10 8 Q16 6 22 4 Q20 8 16 10 Q24 9 28 6 Q24 12 16 14 Q10 16 2 14 Z" />
          </svg>
          <span className="text-lg font-black tracking-tight text-[#002f6c]">TVS</span>
          <span className="text-[9px] font-black text-[#d32f2f] uppercase tracking-wider">RACING</span>
        </div>
      ),
    },
    {
      name: 'Suzuki',
      label: 'Suzuki',
      renderLogo: () => (
        <div className="flex items-center gap-2">
          <svg className="w-5 h-6 text-[#e60012]" viewBox="0 0 24 30" fill="currentColor">
            <path d="M22 2 L4 2 L2 9 L15 13 L2 18 L2 28 L20 28 L22 21 L9 17 L22 13 Z" />
          </svg>
          <span className="text-lg font-black tracking-wider text-[#002c6c]">SUZUKI</span>
        </div>
      ),
    },
    {
      name: 'Yamaha',
      label: 'Yamaha',
      renderLogo: () => (
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-[#e60012]" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12" stroke="#e60012" strokeWidth="2" />
            <path d="M14 4 L14 24 M5 9 L23 19 M5 19 L23 9" stroke="#e60012" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-base font-black tracking-widest text-gray-900">YAMAHA</span>
        </div>
      ),
    },
    {
      name: 'KTM',
      label: 'KTM',
      renderLogo: () => (
        <div className="flex items-center gap-1 bg-[#ff6600] text-white px-2.5 py-1 rounded-md font-black tracking-wider text-sm shadow-xs">
          <span>KTM</span>
        </div>
      ),
    },
    {
      name: 'Hero',
      label: 'Hero',
      renderLogo: () => (
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-[#e52421] rounded-xs flex items-center justify-center text-white font-black text-xs">
            H
          </div>
          <span className="text-lg font-black tracking-tight text-gray-900">Hero</span>
        </div>
      ),
    },
    {
      name: 'MPP',
      label: 'MPP Motopartes',
      renderLogo: () => (
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-black tracking-widest text-lime-dark drop-shadow-xs">MPP</span>
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
            PRO
          </span>
        </div>
      ),
    },
  ];

  // Duplicate for seamless 0% -> -50% infinite marquee loop
  const duplicatedBrands = [...brandList, ...brandList];

  return (
    <section className="bg-white py-6 border-y border-gray-100 overflow-hidden relative select-none">
      
      {/* Subtle Header Tag */}
      <div className="max-w-7xl mx-auto px-4 mb-3 flex items-center justify-between">
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-400">
          REPUESTOS Y ACCESORIOS COMPATIBLES
        </span>
        <span className="text-[10px] font-bold text-gray-400 hidden sm:inline">
          Pasa el cursor para pausar • Haz clic para filtrar
        </span>
      </div>

      {/* Marquee Wrapper with soft edge gradients */}
      <div className="relative w-full overflow-hidden">
        {/* Left fade gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        
        {/* Right fade gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        {/* Moving Track */}
        <div className="animate-marquee items-center py-2">
          {duplicatedBrands.map((brand, idx) => (
            <div
              key={`${brand.name}-${idx}`}
              onClick={() => onSelectBrand && onSelectBrand(brand.name)}
              title={`Ver repuestos para ${brand.label}`}
              className="group mx-5 sm:mx-8 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-300 filter grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:scale-110 hover:bg-gray-50 flex items-center justify-center shrink-0"
            >
              {brand.renderLogo()}
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};


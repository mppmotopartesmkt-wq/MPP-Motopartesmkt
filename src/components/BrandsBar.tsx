import React from 'react';

interface BrandsBarProps {
  onSelectBrand?: (brand: string) => void;
}

export const BrandsBar: React.FC<BrandsBarProps> = ({ onSelectBrand }) => {
  const brands = [
    { name: 'MPP', fontClass: 'font-black tracking-widest text-lime text-xl drop-shadow-[0_0_8px_rgba(132,204,22,0.5)]' },
    { name: 'SHOEI', fontClass: 'font-serif tracking-widest' },
    { name: 'alpinestars', fontClass: 'lowercase italic tracking-tighter font-extrabold' },
    { name: 'DAINESE', fontClass: 'tracking-[0.25em] font-black' },
    { name: 'AKRAPOVIČ', fontClass: 'font-black tracking-wider uppercase' },
    { name: 'PIRELLI', fontClass: 'font-mono tracking-widest font-black' },
    { name: 'BELL', fontClass: 'font-sans font-black tracking-widest text-lg' },
    { name: 'cardo', fontClass: 'lowercase font-bold tracking-tight' },
  ];

  return (
    <div className="bg-dark-950 py-8 px-4 border-b border-dark-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 sm:gap-8 items-center justify-items-center">
          {brands.map((brand) => (
            <div
              key={brand.name}
              onClick={() => onSelectBrand && onSelectBrand(brand.name)}
              className="text-gray-400 hover:text-lime cursor-pointer transition-colors duration-200 select-none py-2 text-center"
            >
              <span className={`text-base sm:text-lg ${brand.fontClass}`}>
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

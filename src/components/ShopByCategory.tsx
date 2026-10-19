import React from 'react';

interface CategoryItem {
  name: string;
  categoryKey: string;
  imageUrl: string;
}

interface ShopByCategoryProps {
  onSelectCategory: (category: string) => void;
}

export const ShopByCategory: React.FC<ShopByCategoryProps> = ({ onSelectCategory }) => {
  const categories: CategoryItem[] = [
    {
      name: 'CASCOS',
      categoryKey: 'Cascos',
      imageUrl: '/mpp-brake-disc.png',
    },
    {
      name: 'ACCESORIOS',
      categoryKey: 'Accesorios',
      imageUrl: '/mpp-brake-disc.png',
    },
    {
      name: 'REPUESTOS',
      categoryKey: 'Repuestos',
      imageUrl: '/mpp-brake-disc.png',
    },
    {
      name: 'LLANTAS',
      categoryKey: 'Llantas',
      imageUrl: '/mpp-brake-disc.png',
    },
    {
      name: 'BATERÍAS',
      categoryKey: 'Baterías',
      imageUrl: '/mpp-brake-disc.png',
    },
    {
      name: 'TANQUES',
      categoryKey: 'Tanques',
      imageUrl: '/mpp-brake-disc.png',
    },
    {
      name: 'FAROLAS',
      categoryKey: 'Farolas',
      imageUrl: '/mpp-brake-disc.png',
    },
    {
      name: 'DEFENSAS',
      categoryKey: 'Defensas',
      imageUrl: '/mpp-brake-disc.png',
    },
    {
      name: 'ESPEJOS',
      categoryKey: 'Espejos',
      imageUrl: '/mpp-brake-disc.png',
    },
    {
      name: 'CARENAJES',
      categoryKey: 'Carenajes',
      imageUrl: '/mpp-brake-disc.png',
    },
    {
      name: 'FRENOS',
      categoryKey: 'Frenos',
      imageUrl: '/mpp-brake-disc.png',
    },
    {
      name: 'MANTENIMIENTO',
      categoryKey: 'Mantenimiento',
      imageUrl: '/mpp-brake-disc.png',
    },
  ];

  return (
    <section className="py-14 px-4 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-center text-gray-900 mb-10">
          COMPRAR POR CATEGORÍA
        </h2>

        {/* Circular Category Grid matching reference (2 rows of 6 on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-5 justify-items-center">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => onSelectCategory(cat.categoryKey)}
              className="flex flex-col items-center cursor-pointer group w-full max-w-[140px]"
            >
              {/* Circular Container with soft background */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-50 flex items-center justify-center p-3 mb-3 border border-gray-200 group-hover:border-lime group-hover:ring-4 group-hover:ring-lime/20 transition-all duration-300 overflow-hidden shadow-xs">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Title & Shop Now link */}
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 text-center group-hover:text-black transition-colors">
                {cat.name}
              </h3>
              <span className="text-[11px] text-gray-500 font-medium group-hover:text-black transition-colors">
                Ver catálogo
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

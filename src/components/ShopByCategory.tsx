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
      categoryKey: 'Helmets',
      imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'EQUIPACIÓN',
      categoryKey: 'Riding Gear',
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'GUANTES',
      categoryKey: 'Gloves',
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'ESCAPES',
      categoryKey: 'Exhaust',
      imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'ACCESORIOS',
      categoryKey: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'LLANTAS',
      categoryKey: 'Tires',
      imageUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'BATERÍAS',
      categoryKey: 'Batteries',
      imageUrl: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'MANTENIMIENTO',
      categoryKey: 'Maintenance',
      imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=300&q=80',
    },
  ];

  return (
    <section className="py-14 px-4 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-center text-gray-900 mb-10">
          COMPRAR POR CATEGORÍA
        </h2>

        {/* Circular Category Grid matching reference */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 sm:gap-4 justify-items-center">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => onSelectCategory(cat.categoryKey)}
              className="flex flex-col items-center cursor-pointer group w-full max-w-[130px]"
            >
              {/* Circular Container with soft background */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-100 flex items-center justify-center p-3 mb-3 border border-gray-200 group-hover:border-lime group-hover:ring-4 group-hover:ring-lime/20 transition-all duration-300 overflow-hidden shadow-sm">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300 filter contrast-105"
                />
              </div>

              {/* Title & Shop Now link */}
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 text-center group-hover:text-lime-dark transition-colors">
                {cat.name}
              </h3>
              <span className="text-[11px] text-gray-500 font-medium group-hover:text-lime-dark transition-colors">
                Ver catálogo
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

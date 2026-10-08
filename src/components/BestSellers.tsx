import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface BestSellersProps {
  products: Product[];
  onViewAll: () => void;
  onQuickView: (product: Product) => void;
}

export const BestSellers: React.FC<BestSellersProps> = ({
  products,
  onViewAll,
  onQuickView,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-14 px-4 bg-white border-b border-gray-100 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Header: LOS MÁS VENDIDOS & VER TODOS -> */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
            LOS MÁS VENDIDOS
          </h2>

          <button
            onClick={onViewAll}
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-black uppercase tracking-wider text-gray-900 hover:text-lime-dark transition-colors"
          >
            <span>VER TODOS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Carousel Viewport with Navigation Chevrons */}
        <div className="relative group/carousel">
          {/* Left Arrow Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-gray-300 shadow-lg flex items-center justify-center text-gray-700 hover:text-black hover:border-lime transition-all opacity-90 hover:opacity-100"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1 px-1 -mx-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[230px] sm:w-[250px] shrink-0"
              >
                <ProductCard product={product} onQuickView={onQuickView} />
              </div>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-gray-300 shadow-lg flex items-center justify-center text-gray-700 hover:text-black hover:border-lime transition-all opacity-90 hover:opacity-100"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

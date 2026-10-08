import React, { useState } from 'react';
import { Search, X, Star } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/format';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl text-gray-100">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-dark-800 flex items-center gap-3 bg-dark-950">
          <Search className="w-5 h-5 text-lime shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Buscar por casco, chaqueta, llanta, marca (Shoei, Dainese...)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none font-medium"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-dark-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {searchTerm.trim() === '' ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              Escribe algo para buscar en todo el catálogo de MPP...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              No se encontraron productos que coincidan con "{searchTerm}".
            </div>
          ) : (
            filtered.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="flex items-center gap-4 p-3 bg-dark-950 hover:bg-dark-800 rounded-lg cursor-pointer border border-dark-800 hover:border-lime/40 transition-colors"
              >
                <div className="w-14 h-14 bg-white rounded p-1 flex items-center justify-center shrink-0">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    {product.brand} • {product.category}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                    <Star className="w-3 h-3 fill-lime text-lime" />
                    <span>{product.rating} ({product.reviews_count})</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-lime block">
                    {formatCurrency(product.discount_price ?? product.price)}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Stock: {product.stock_qty}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

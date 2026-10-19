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
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/60 backdrop-blur-md flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-gray-900 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <div className="w-9 h-9 rounded-full bg-lime/20 flex items-center justify-center shrink-0">
            <Search className="w-4 h-4 text-black" />
          </div>
          <input
            type="text"
            autoFocus
            placeholder="Buscar por cascos, llantas, baterías, repuestos, accesorios, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none font-medium"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {searchTerm.trim() === '' ? (
            <div className="text-center py-12 text-gray-400 text-xs font-medium">
              Escribe algo para buscar en todo el catálogo de repuestos MPP...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs">
              No se encontraron repuestos que coincidan con "<strong className="text-gray-900">{searchTerm}</strong>".
            </div>
          ) : (
            filtered.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="flex items-center gap-4 p-3 bg-white hover:bg-gray-50 rounded-xl cursor-pointer border border-gray-100 hover:border-gray-300 transition-all group"
              >
                <div className="w-14 h-14 bg-gray-50 rounded-lg p-1.5 flex items-center justify-center shrink-0 border border-gray-100 group-hover:border-lime/60 transition-colors">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-black">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {product.brand} • {product.category}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                    <Star className="w-3 h-3 fill-black text-black" />
                    <span>{product.rating} ({product.reviews_count})</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-gray-900 block">
                    {formatCurrency(product.discount_price ?? product.price)}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
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

import React from 'react';
import { Heart, ArrowUpRight } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const wishlisted = isWishlisted(product.id);

  const mainPrice = product.discount_price ?? product.price;
  const wholesalePrice =
    product.wholesale_price && product.wholesale_price > 0
      ? product.wholesale_price
      : Math.round(mainPrice * 0.9);

  const mainImage =
    product.images && product.images.length > 0 && product.images[0]
      ? product.images[0]
      : '/categories/repuestos.png';

  const brandTag = (product.brand || 'MPR').toUpperCase();
  const specTag = (product.category || 'REPUESTO').toUpperCase();

  return (
    <div className="group relative bg-white border border-gray-100 rounded-[28px] p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col justify-between">
      
      {/* Top row: Discount badge (left) & Wishlist (right) */}
      <div className="flex justify-between items-center mb-1">
        {product.discount_price && product.discount_price < product.price ? (
          <span className="bg-lime text-black font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-xs tracking-wider">
            OFERTA
          </span>
        ) : (
          <span />
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`p-1.5 rounded-full transition-colors ${
            wishlisted
              ? 'text-lime fill-lime'
              : 'text-gray-300 hover:text-black hover:bg-gray-100'
          }`}
          aria-label="Guardar en favoritos"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-lime text-lime' : ''}`} />
        </button>
      </div>

      {/* Product Image on Clean White Isolated Background */}
      <div
        className="w-full h-48 sm:h-52 flex items-center justify-center p-3 mb-3 cursor-pointer overflow-hidden rounded-2xl relative bg-white"
        onClick={() => onQuickView(product)}
      >
        <img
          src={mainImage}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
          loading="lazy"
        />
      </div>

      {/* Details & Tags matching graphic */}
      <div className="flex flex-col flex-1">
        {/* Meta tags: Brand & Spec/Category pill */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
            {brandTag}
          </span>
          <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            {specTag}
          </span>
        </div>

        {/* Product Title */}
        <h3
          onClick={() => onQuickView(product)}
          className="text-sm font-black text-gray-900 group-hover:text-black transition-colors line-clamp-1 mb-3 cursor-pointer leading-snug"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Bottom Row: Price & Wholesale on Left, "Comprar ↗" button on Right */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-black text-gray-900 tracking-tight leading-tight">
              {formatCurrency(mainPrice)}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 mt-0.5">
              Mayor: {formatCurrency(wholesalePrice)}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            className="bg-black hover:bg-neutral-800 active:scale-95 text-white rounded-full px-4 py-2 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
            title="Añadir al carrito"
          >
            <span>Comprar</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-lime" />
          </button>
        </div>
      </div>
    </div>
  );
};

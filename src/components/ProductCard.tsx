import React from 'react';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';
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

  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg p-4 flex flex-col justify-between hover:shadow-xl hover:border-lime/60 transition-all duration-300">
      
      {/* Top action: Wishlist */}
      <div className="flex justify-between items-start mb-2">
        {product.discount_price ? (
          <span className="bg-lime text-black font-extrabold text-[10px] uppercase px-2 py-0.5 rounded tracking-wider shadow-sm">
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
              : 'text-gray-400 hover:text-black hover:bg-gray-100'
          }`}
          aria-label="Guardar en favoritos"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-lime text-lime' : ''}`} />
        </button>
      </div>

      {/* Product Image */}
      <div
        className="w-full h-44 sm:h-48 flex items-center justify-center p-2 mb-4 cursor-pointer overflow-hidden relative"
        onClick={() => onQuickView(product)}
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 filter drop-shadow-sm"
        />

        {/* Hover Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="p-2 bg-white text-black rounded-full hover:bg-lime transition-colors shadow-md"
            title="Vista rápida"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1">
        {/* Title & Category/Subtitle */}
        <h3
          onClick={() => onQuickView(product)}
          className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-lime-dark transition-colors line-clamp-1 cursor-pointer"
          title={product.name}
        >
          {product.name}
        </h3>
        <p className="text-[11px] text-gray-500 font-medium mb-2 line-clamp-1">
          {product.category || product.brand}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-sm sm:text-base font-extrabold text-gray-900">
            {formatCurrency(product.discount_price ?? product.price)}
          </span>
          {product.discount_price && (
            <span className="text-xs text-gray-400 line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        {/* Ratings & Reviews (Exact format: ★★★★★ (842)) */}
        <div className="flex items-center gap-1 text-[11px] text-gray-600 mb-4">
          <div className="flex text-black">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating || 5)
                    ? 'fill-black text-black'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="font-semibold text-gray-500 ml-1">
            ({product.reviews_count?.toLocaleString() || 500})
          </span>
        </div>

        {/* Add to Cart Button (in Lime Green on hover / active) */}
        <button
          onClick={() => addToCart(product, 1)}
          className="w-full mt-auto bg-dark-900 hover:bg-lime text-white hover:text-black font-extrabold py-2 px-3 rounded text-xs uppercase tracking-wider transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Añadir al carrito</span>
        </button>
      </div>
    </div>
  );
};

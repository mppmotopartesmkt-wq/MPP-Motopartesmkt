import React, { useState } from 'react';
import { X, Star, ShoppingBag, ShieldCheck, Truck, Box, Heart, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const wishlisted = isWishlisted(product.id);

  const handleAdd = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl text-gray-100 my-8 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-white rounded-full bg-dark-950/80 hover:bg-dark-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
          
          {/* LEFT: IMAGE GALLERY */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-full h-72 sm:h-80 bg-white rounded-lg p-6 flex items-center justify-center border border-gray-200 shadow-sm relative">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="max-h-full max-w-full object-contain filter drop-shadow-md"
              />

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ${
                  wishlisted ? 'text-lime' : 'text-gray-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-lime text-lime' : ''}`} />
              </button>
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-14 h-14 bg-white rounded p-1 border-2 transition-all ${
                      selectedImage === idx ? 'border-lime' : 'border-dark-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: SPECS & BUY ACTION */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category & Brand */}
              <div className="flex items-center gap-2 mb-2 text-xs">
                <span className="text-lime font-bold uppercase tracking-wider">
                  {product.brand || 'MPP'}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400 font-medium">
                  {product.category || 'Gear'}
                </span>
                <span className="text-gray-500">•</span>
                <span className="font-mono text-[10px] text-gray-500">
                  SKU: {product.sku}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mb-2">
                {product.name}
              </h2>

              {/* Stars & Reviews */}
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                <div className="flex text-black">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-black text-black" />
                  ))}
                </div>
                <span className="font-bold text-gray-300">
                  {product.rating || 5.0}
                </span>
                <span>({product.reviews_count || 500} reseñas verificadas)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4 p-3 bg-dark-950 rounded-lg border border-dark-800">
                <span className="text-2xl font-black text-white">
                  {formatCurrency(product.discount_price ?? product.price)}
                </span>
                {product.discount_price && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatCurrency(product.price)}
                  </span>
                )}
                <span className="ml-auto text-xs px-2.5 py-1 rounded bg-lime/10 text-lime font-bold border border-lime/30">
                  Stock disponible: {product.stock_qty} unid.
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-300 leading-relaxed mb-6 font-normal">
                {product.description || 'Producto premium diseñado para máxima protección y alto desempeño sobre dos ruedas.'}
              </p>

              {/* Technical / Packing Details (from database schema specs) */}
              {(product.gross_weight_kg || product.length_mm) && (
                <div className="border border-dark-800 rounded-lg p-3 bg-dark-950 text-[11px] space-y-1.5 text-gray-400 mb-6">
                  <div className="flex items-center gap-1.5 text-white font-bold mb-1">
                    <Box className="w-3.5 h-3.5 text-lime" />
                    <span>Especificaciones de Empaque & Logística</span>
                  </div>
                  {product.length_mm && (
                    <div className="flex justify-between">
                      <span>Dimensiones:</span>
                      <span className="text-gray-200">
                        {product.length_mm} x {product.width_mm} x {product.height_mm} mm
                      </span>
                    </div>
                  )}
                  {product.gross_weight_kg && (
                    <div className="flex justify-between">
                      <span>Peso Bruto / Neto:</span>
                      <span className="text-gray-200">
                        {product.gross_weight_kg} kg / {product.net_weight_kg} kg
                      </span>
                    </div>
                  )}
                  {product.package_details && (
                    <div className="flex justify-between">
                      <span>Detalle Empaque:</span>
                      <span className="text-gray-200">{product.package_details}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="space-y-4 pt-4 border-t border-dark-800">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-dark-700 rounded bg-dark-950">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-400 hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-xs font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_qty || 99, quantity + 1))}
                    className="px-3 py-2 text-gray-400 hover:text-white"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  className="flex-1 bg-lime hover:bg-lime-bright text-black font-black py-3 px-6 rounded text-xs uppercase tracking-wider transition-all transform hover:-translate-y-0.5 shadow-lg shadow-lime/20 flex items-center justify-center gap-2"
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-black" />
                      <span>¡AÑADIDO AL CARRITO!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>AGREGAR AL CARRITO</span>
                    </>
                  )}
                </button>
              </div>

              {/* Micro Guarantees */}
              <div className="flex items-center justify-around text-[11px] text-gray-400 pt-2">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-lime" /> Envío Express
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime" /> Garantía Oficial 1 Año
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    totalAmount,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const freeShippingThreshold = 250000;
  const standardShippingCost = 15000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplying(true);
    setCouponStatus(null);
    const result = await applyCoupon(couponCode);
    setIsApplying(false);
    if (result.success) {
      setCouponStatus({ message: result.message, isError: false });
      setCouponCode('');
    } else {
      setCouponStatus({ message: result.message, isError: true });
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-dark-900 border-l border-dark-800 text-gray-100 flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-5 border-b border-dark-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-lime" />
              <h2 className="text-base font-black uppercase tracking-wider text-white">
                TU CARRITO ({items.length})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-dark-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-dark-950 px-5 py-3 border-b border-dark-800">
            {remainingForFreeShipping > 0 ? (
              <p className="text-xs text-gray-300 mb-1.5 font-medium">
                Agrega <strong className="text-lime">{formatCurrency(remainingForFreeShipping)}</strong> más para obtener <strong className="text-white">ENVÍO GRATIS</strong>.
              </p>
            ) : (
              <p className="text-xs text-lime font-bold mb-1.5 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> ¡Felicidades! Calificas para ENVÍO GRATIS.
              </p>
            )}
            <div className="w-full bg-dark-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-lime h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(132,204,22,0.6)]"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-300 uppercase mb-1">
                  Tu carrito está vacío
                </p>
                <p className="text-xs text-gray-500 mb-6">
                  Explora nuestra colección y equípate con lo mejor.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-lime hover:bg-lime-bright text-black font-extrabold text-xs uppercase px-6 py-2.5 rounded tracking-wider transition-colors"
                >
                  Continuar comprando
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => {
                const itemPrice = product.discount_price ?? product.price;
                return (
                  <div
                    key={product.id}
                    className="flex gap-4 p-3 bg-dark-950/60 border border-dark-800 rounded-lg group hover:border-dark-700 transition-colors"
                  >
                    <div className="w-20 h-20 bg-white rounded p-1 flex items-center justify-center shrink-0">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-white line-clamp-1">
                            {product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="text-gray-500 hover:text-red-400 p-1"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {product.category || product.brand}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-dark-700 rounded bg-dark-900">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-1 hover:text-lime text-gray-400 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-white">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="p-1 hover:text-lime text-gray-400 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-extrabold text-lime">
                          {formatCurrency(itemPrice * quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-5 bg-dark-950 border-t border-dark-800 space-y-4">
              
              {/* Coupon Form */}
              <div>
                {coupon ? (
                  <div className="flex items-center justify-between bg-lime/10 border border-lime/30 rounded p-2.5 text-xs">
                    <div className="flex items-center gap-2 text-lime font-bold">
                      <Tag className="w-4 h-4" />
                      <span>Cupón aplicado: <strong>{coupon.code}</strong></span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-gray-400 hover:text-white underline text-[11px]"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Código de cupón (Ej: RIDE10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-dark-900 border border-dark-700 rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-lime uppercase font-bold"
                    />
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="bg-dark-800 hover:bg-dark-700 text-white font-bold text-xs px-4 py-2 rounded transition-colors uppercase"
                    >
                      Aplicar
                    </button>
                  </form>
                )}

                {couponStatus && (
                  <p className={`text-[11px] mt-1.5 flex items-center gap-1 ${couponStatus.isError ? 'text-red-400' : 'text-lime'}`}>
                    {couponStatus.isError ? <AlertCircle className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                    {couponStatus.message}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-lime">
                    <span>Descuento cupón</span>
                    <span className="font-bold">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span className="font-semibold text-white">
                    {subtotal >= freeShippingThreshold ? 'GRATIS' : formatCurrency(standardShippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-dark-800">
                  <span>TOTAL ESTIMADO</span>
                  <span className="text-lime text-base">
                    {formatCurrency(totalAmount + (subtotal >= freeShippingThreshold ? 0 : standardShippingCost))}
                  </span>
                </div>
              </div>

              {/* Checkout Button in Lime Green */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full bg-lime hover:bg-lime-bright text-black font-black py-3.5 px-4 rounded text-xs uppercase tracking-wider transition-all transform hover:-translate-y-0.5 shadow-lg shadow-lime/20 flex items-center justify-center gap-2"
              >
                <span>PROCEDER AL CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

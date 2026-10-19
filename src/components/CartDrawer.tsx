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
    <div className="fixed inset-0 z-[70] overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-gray-200 text-gray-900 flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-lime/20 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-black" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">
                TU CARRITO ({items.length})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
            {remainingForFreeShipping > 0 ? (
              <p className="text-xs text-gray-600 mb-1.5 font-medium">
                Agrega <strong className="text-gray-900 font-bold">{formatCurrency(remainingForFreeShipping)}</strong> más para <strong className="text-black font-extrabold uppercase">ENVÍO GRATIS</strong>.
              </p>
            ) : (
              <p className="text-xs text-black font-bold mb-1.5 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-lime flex items-center justify-center text-black text-[10px] font-black">✓</span>
                ¡Felicidades! Calificas para <strong className="uppercase">ENVÍO GRATIS</strong> en Colombia.
              </p>
            )}
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-lime h-full rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-bold text-gray-900 uppercase mb-1">
                  Tu carrito está vacío
                </p>
                <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto">
                  Explora nuestro catálogo oficial de repuestos y equípate con lo mejor.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-black hover:bg-gray-800 text-white font-extrabold text-xs uppercase px-6 py-3 rounded-lg tracking-wider transition-colors shadow-sm"
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
                    className="flex gap-4 p-3 bg-white border border-gray-100 rounded-xl group hover:border-gray-300 transition-all shadow-xs"
                  >
                    <div className="w-20 h-20 bg-gray-50 rounded-lg p-2 flex items-center justify-center shrink-0 border border-gray-100">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                            {product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium">
                          {product.category || product.brand}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-1 hover:text-black text-gray-500 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-gray-900">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="p-1 hover:text-black text-gray-500 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-extrabold text-gray-900">
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
            <div className="p-5 bg-gray-50 border-t border-gray-200 space-y-4">
              
              {/* Coupon Form */}
              <div>
                {coupon ? (
                  <div className="flex items-center justify-between bg-white border border-lime/60 rounded-lg p-2.5 text-xs shadow-xs">
                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                      <Tag className="w-4 h-4 text-lime-dark" />
                      <span>Cupón aplicado: <strong className="font-mono bg-lime/20 px-1.5 py-0.5 rounded text-[11px]">{coupon.code}</strong></span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-gray-500 hover:text-red-500 underline text-[11px] font-medium"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Código de cupón (Ej: MPP10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black uppercase font-bold"
                    />
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors uppercase"
                    >
                      Aplicar
                    </button>
                  </form>
                )}

                {couponStatus && (
                  <p className={`text-[11px] mt-1.5 flex items-center gap-1 font-medium ${couponStatus.isError ? 'text-red-500' : 'text-emerald-600'}`}>
                    {couponStatus.isError ? <AlertCircle className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                    {couponStatus.message}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Descuento cupón</span>
                    <span className="font-bold">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span className="font-semibold text-gray-900">
                    {subtotal >= freeShippingThreshold ? 'GRATIS' : formatCurrency(standardShippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
                  <span>TOTAL ESTIMADO</span>
                  <span className="text-gray-900 text-base font-black">
                    {formatCurrency(totalAmount + (subtotal >= freeShippingThreshold ? 0 : standardShippingCost))}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full bg-black hover:bg-gray-800 text-white font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all transform hover:-translate-y-0.5 shadow-md flex items-center justify-center gap-2"
              >
                <span>PROCEDER AL CHECKOUT</span>
                <ArrowRight className="w-4 h-4 text-lime" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

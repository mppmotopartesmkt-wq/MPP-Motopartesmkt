import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle,
  CreditCard,
  Building,
  Smartphone,
  AlertTriangle,
  ArrowRight,
  Package,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { processCheckout } from '../services/api';
import { formatCurrency } from '../utils/format';
import { DocumentType, PaymentMethod, CheckoutResult } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { items, subtotal, discountAmount, totalAmount, coupon, clearCart } = useCart();
  const { profile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [docType, setDocType] = useState<DocumentType>(profile?.document_type || 'CC');
  const [docNumber, setDocNumber] = useState(profile?.document_number || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [city, setCity] = useState(profile?.city || 'Bogotá');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pse');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<CheckoutResult | null>(null);

  if (!isOpen) return null;

  const freeShipping = subtotal >= 250000;
  const shippingCost = freeShipping ? 0 : 15000;
  const finalTotal = totalAmount + shippingCost;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName || !email || !docNumber || !address || !city) {
      setErrorMessage('Por favor completa todos los campos de envío y facturación requeridos.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('El carrito de compras está vacío.');
      return;
    }

    setIsLoading(true);

    try {
      const shippingData = {
        full_name: fullName,
        email,
        document_type: docType,
        document_number: docNumber,
        phone,
        address,
        city,
        payment_method: paymentMethod,
      };

      const result = await processCheckout(
        profile?.id || 'd1111111-1111-1111-1111-111111111111',
        items,
        coupon?.code,
        shippingData
      );

      if (result.success) {
        setCompletedOrder(result);
        clearCart();
      } else {
        setErrorMessage(result.message || 'Error procesando el pedido.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con la pasarela de pagos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl text-gray-100 my-8">
        
        {/* Header */}
        <div className="p-5 border-b border-dark-800 flex items-center justify-between bg-dark-950">
          <div className="flex items-center gap-3">
            <img
              src="/mpp-logo.jpg"
              alt="MPP"
              className="w-10 h-10 rounded-lg object-contain bg-black border border-lime/40 p-0.5"
            />
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-white">
                FINALIZAR PEDIDO — MPP CHECKOUT
              </h2>
              <p className="text-[11px] text-gray-400">
                Transacción segura con control de inventario atómico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-dark-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {completedOrder ? (
          /* SUCCESS SCREEN */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-lime/20 text-lime rounded-full flex items-center justify-center mx-auto border-2 border-lime animate-bounce">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-lime tracking-widest uppercase">
                ¡ORDEN CONFIRMADA EXITOSAMENTE!
              </span>
              <h3 className="text-2xl font-black text-white">
                Gracias por tu compra, {fullName}
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Hemos reservado y descontado tu inventario en la base de datos de manera atómica. Recibirás tu guía de despacho en breve.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="bg-dark-950 border border-dark-800 rounded-lg p-5 max-w-md mx-auto text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-dark-800 pb-2">
                <span className="text-gray-400">Número de Pedido:</span>
                <span className="font-mono font-bold text-lime">{completedOrder.order_number}</span>
              </div>
              <div className="flex justify-between border-b border-dark-800 pb-2">
                <span className="text-gray-400">Documento DIAN:</span>
                <span className="text-white font-medium">{docType} {docNumber}</span>
              </div>
              <div className="flex justify-between border-b border-dark-800 pb-2">
                <span className="text-gray-400">Destino de Entrega:</span>
                <span className="text-white font-medium">{address}, {city}</span>
              </div>
              <div className="flex justify-between border-b border-dark-800 pb-2">
                <span className="text-gray-400">Método de Pago:</span>
                <span className="text-white uppercase font-bold">{paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-extrabold text-white">
                <span>Total Facturado:</span>
                <span className="text-lime">{formatCurrency(completedOrder.total_amount)}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-lime hover:bg-lime-bright text-black font-black py-3 px-8 rounded text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
            >
              <span>Volver a la tienda</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* LEFT COLUMN: DIAN & SHIPPING INFO */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-lime flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  1. Facturación & Envío (DIAN)
                </h3>

                <div>
                  <label className="block text-[11px] text-gray-400 font-semibold mb-1">
                    Nombre Completo o Razón Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-lime"
                    placeholder="Ej. Carlos Rodríguez"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 font-semibold mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-lime"
                    placeholder="carlos@ejemplo.com"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-400 font-semibold mb-1">
                      Tipo Doc. *
                    </label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as DocumentType)}
                      className="w-full bg-dark-950 border border-dark-700 rounded px-2 py-2 text-xs text-white focus:outline-none focus:border-lime"
                    >
                      <option value="CC">CC</option>
                      <option value="NIT">NIT</option>
                      <option value="CE">CE</option>
                      <option value="PASAPORTE">Pasaporte</option>
                      <option value="RUT">RUT</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] text-gray-400 font-semibold mb-1">
                      Número de Documento / NIT *
                    </label>
                    <input
                      type="text"
                      required
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      className="w-full bg-dark-950 border border-dark-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-lime"
                      placeholder="1020304050"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-400 font-semibold mb-1">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-dark-950 border border-dark-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-lime"
                      placeholder="Bogotá, Medellín, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 font-semibold mb-1">
                      Teléfono Móvil
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-dark-950 border border-dark-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-lime"
                      placeholder="+57 300..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 font-semibold mb-1">
                    Dirección de Entrega *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-lime"
                    placeholder="Calle, Carrera, Edificio, Apto..."
                  />
                </div>
              </div>

              {/* RIGHT COLUMN: PAYMENT METHOD & SUMMARY */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-lime flex items-center gap-1.5 mb-3">
                    <CreditCard className="w-4 h-4" />
                    2. Método de Pago
                  </h3>

                  <div className="space-y-2">
                    {[
                      { id: 'pse', label: 'PSE / Transferencia En Línea', icon: Smartphone },
                      { id: 'wompi', label: 'Wompi / Tarjeta Débito / Crédito', icon: CreditCard },
                      { id: 'transfer', label: 'Bancolombia Transferencia Directa', icon: Building },
                      { id: 'paypal', label: 'PayPal (USD)', icon: CreditCard },
                    ].map((m) => {
                      const Icon = m.icon;
                      return (
                        <label
                          key={m.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            paymentMethod === m.id
                              ? 'bg-lime/10 border-lime text-white'
                              : 'bg-dark-950 border-dark-800 text-gray-300 hover:border-dark-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === m.id}
                            onChange={() => setPaymentMethod(m.id as PaymentMethod)}
                            className="text-lime focus:ring-lime"
                          />
                          <Icon className="w-4 h-4 text-lime" />
                          <span className="text-xs font-semibold">{m.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Summary Box */}
                <div className="bg-dark-950 border border-dark-800 rounded-lg p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Artículos ({items.length}):</span>
                    <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-lime font-bold">
                      <span>Cupón ({coupon?.code}):</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400">
                    <span>Envío:</span>
                    <span className="text-white font-medium">
                      {freeShipping ? 'GRATIS ($0)' : formatCurrency(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-dark-800 text-sm font-black text-white">
                    <span>TOTAL A PAGAR:</span>
                    <span className="text-lime text-base">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-lime hover:bg-lime-bright text-black font-black py-3.5 px-4 rounded text-xs uppercase tracking-wider transition-all transform hover:-translate-y-0.5 shadow-lg shadow-lime/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isLoading ? 'PROCESANDO PAGO CON SEGURO...' : `PAGAR ${formatCurrency(finalTotal)}`}
                  </span>
                </button>
              </div>

            </div>
          </form>
        )}

      </div>
    </div>
  );
};

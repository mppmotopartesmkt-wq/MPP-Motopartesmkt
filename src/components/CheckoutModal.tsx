import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle,
  CreditCard,
  Building,
  AlertTriangle,
  ArrowRight,
  Package,
  ArrowLeft,
  Lock,
  Truck,
  FileText,
  Zap,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { processCheckout } from '../services/api';
import { openBoldCheckout, loadBoldScript } from '../services/bold';
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bold');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<CheckoutResult | null>(null);
  const [isBoldOpening, setIsBoldOpening] = useState(false);

  // Pre-cargar el script oficial de Bold en segundo plano cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      loadBoldScript().catch((err) => console.warn('Preload bold script warning:', err));
    }
  }, [isOpen]);

  // Lock background scroll when checkout is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

        // Si el método seleccionado es Bold, abrir el checkout embebido o redirigir
        if (paymentMethod === 'bold') {
          setIsBoldOpening(true);
          try {
            await openBoldCheckout({
              orderId: result.order_number,
              amount: finalTotal,
              description: `MPR Repuestos - Orden ${result.order_number}`,
              customerEmail: email,
              customerName: fullName,
              renderMode: 'embedded',
            });
          } catch (boldErr: any) {
            console.error('Error lanzando Bold:', boldErr);
          } finally {
            setIsBoldOpening(false);
          }
        }
      } else {
        setErrorMessage(result.message || 'Error procesando el pedido.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con la pasarela de pagos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReopenBold = async () => {
    if (!completedOrder) return;
    setIsBoldOpening(true);
    try {
      await openBoldCheckout({
        orderId: completedOrder.order_number,
        amount: completedOrder.total_amount,
        description: `MPR Repuestos - Orden ${completedOrder.order_number}`,
        customerEmail: email,
        customerName: fullName,
        renderMode: 'embedded',
      });
    } finally {
      setIsBoldOpening(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-heading"
      className="fixed inset-0 z-[80] overflow-y-auto bg-white text-gray-900 animate-fadeIn"
    >
      {/* 1. TOP STICKY BAR (IDENTICAL TO SINGLE PRODUCT SPEC) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Volver button & Breadcrumb */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-black hover:text-lime-dark transition-colors shrink-0 py-2 px-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Tienda</span>
            </button>

            <span className="hidden sm:inline-block text-gray-300">|</span>

            <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-2 text-xs text-gray-500 truncate">
              <span>Inicio</span>
              <span>/</span>
              <span>Carrito</span>
              <span>/</span>
              <span className="text-gray-900 font-semibold truncate">
                Finalizar Compra
              </span>
            </nav>
          </div>

          {/* Center: Branding */}
          <div className="hidden sm:flex items-center gap-2.5">
            <img
              src="/mpr-logo-dark.png"
              alt="MPR"
              className="h-8 w-auto object-contain"
            />
            <span className="text-xs font-black uppercase tracking-wider text-black">
              MPR MOTOPARTES • CHECKOUT SEGURO
            </span>
          </div>

          {/* Right: Security & Close Button */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Lock className="w-3.5 h-3.5" />
              <span>Transacción Cifrada 256-bit</span>
            </span>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 hover:text-black transition-colors"
              title="Cerrar (Esc)"
              aria-label="Cerrar checkout"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. MAIN CHECKOUT VIEWPORT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {completedOrder ? (
          /* ========================================================================= */
          /* SUCCESS SCREEN (CLEAN WHITE RECEIPT) */
          /* ========================================================================= */
          <div className="max-w-2xl mx-auto text-center py-8 sm:py-12 space-y-8 animate-fadeIn">
            
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500 shadow-md">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black text-emerald-700 tracking-widest uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ¡ORDEN CONFIRMADA EXITOSAMENTE!
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-black uppercase tracking-tight">
                Gracias por tu compra, {fullName}
              </h2>
              <p className="text-sm text-gray-600 max-w-lg mx-auto">
                Hemos reservado y descontado tu inventario en la base de datos de manera atómica. Tu pedido ha sido enviado al equipo de bodega y logística.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl p-6 sm:p-8 text-left text-sm space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-medium">Número de Pedido:</span>
                <span className="font-mono font-black text-black text-base">{completedOrder.order_number}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-medium">Factura Electrónica (DIAN):</span>
                <span className="text-gray-900 font-bold">{docType} {docNumber}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-medium">Destino de Envío:</span>
                <span className="text-gray-900 font-bold">{address}, {city}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-medium">Método de Pago Seleccionado:</span>
                <span className="text-black uppercase font-extrabold">
                  {paymentMethod === 'bold' ? 'Bold Colombia (En Línea)' : paymentMethod}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 text-lg font-black text-black">
                <span>Total Facturado:</span>
                <span className="text-black">{formatCurrency(completedOrder.total_amount)}</span>
              </div>
            </div>

            {/* Bold Colombia Payment Reopen Notice */}
            {paymentMethod === 'bold' && (
              <div className="bg-gradient-to-r from-emerald-50 to-lime/20 border border-emerald-200 rounded-2xl p-5 text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
                      Pasarela Bold
                    </span>
                    <span className="text-xs font-black text-gray-900">
                      Transacción en Proceso con Bold Colombia
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Aceptamos PSE, Nequi, Daviplata, Tarjetas y Botón Bancolombia. Si necesitas reabrir la ventana de pago:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReopenBold}
                  disabled={isBoldOpening}
                  className="bg-black hover:bg-neutral-800 text-white font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider shrink-0 flex items-center gap-2 shadow-sm transition-all"
                >
                  <Zap className="w-4 h-4 text-lime" />
                  <span>{isBoldOpening ? 'Iniciando Bold...' : 'Pagar con Bold'}</span>
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={onClose}
                className="bg-black hover:bg-neutral-800 text-white font-black py-4 px-8 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md inline-flex items-center justify-center gap-2"
              >
                <span>Volver a la Tienda</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (
          /* ========================================================================= */
          /* CHECKOUT FORM (2 COLUMNS: FORM + STICKY SUMMARY) */
          /* ========================================================================= */
          <form onSubmit={handleSubmitOrder} className="space-y-8">
            
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
              
              {/* LEFT COLUMN: DIAN & SHIPPING INFO + PAYMENT METHODS */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* STEP 1: FACTURACIÓN & ENVÍO (DIAN) */}
                <section aria-labelledby="shipping-heading" className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-black text-white font-black text-xs flex items-center justify-center">
                      1
                    </div>
                    <div>
                      <h2 id="shipping-heading" className="text-base sm:text-lg font-black uppercase tracking-tight text-black flex items-center gap-2">
                        <Package className="w-4 h-4 text-black" />
                        Facturación & Envío (DIAN Colombia)
                      </h2>
                      <p className="text-xs text-gray-500">
                        Ingresa los datos para la guía de transporte y tu factura electrónica oficial.
                      </p>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1.5">
                        Nombre Completo o Razón Social *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-black placeholder-gray-400 focus:bg-white focus:outline-none focus:border-black transition-colors"
                        placeholder="Ej. Carlos Rodríguez"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-1.5">
                        Correo Electrónico * (Para confirmación y factura)
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-black placeholder-gray-400 focus:bg-white focus:outline-none focus:border-black transition-colors"
                        placeholder="carlos@ejemplo.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-gray-700 font-bold mb-1.5">
                          Tipo Doc. *
                        </label>
                        <select
                          value={docType}
                          onChange={(e) => setDocType(e.target.value as DocumentType)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-3 text-sm text-black focus:bg-white focus:outline-none focus:border-black transition-colors font-medium"
                        >
                          <option value="CC">CC (Cédula de Ciudadanía)</option>
                          <option value="NIT">NIT (Empresas)</option>
                          <option value="CE">CE (Cédula Extranjería)</option>
                          <option value="PASAPORTE">Pasaporte</option>
                          <option value="RUT">RUT</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-gray-700 font-bold mb-1.5">
                          Número de Documento / NIT *
                        </label>
                        <input
                          type="text"
                          required
                          value={docNumber}
                          onChange={(e) => setDocNumber(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-black placeholder-gray-400 focus:bg-white focus:outline-none focus:border-black transition-colors"
                          placeholder="1020304050"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-700 font-bold mb-1.5">
                          Ciudad / Municipio *
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-black placeholder-gray-400 focus:bg-white focus:outline-none focus:border-black transition-colors"
                          placeholder="Bogotá, Medellín, Cali, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-bold mb-1.5">
                          Teléfono Móvil (WhatsApp) *
                        </label>
                        <input
                          type="text"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-black placeholder-gray-400 focus:bg-white focus:outline-none focus:border-black transition-colors"
                          placeholder="+57 300 123 4567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-1.5">
                        Dirección Completa de Entrega *
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-black placeholder-gray-400 focus:bg-white focus:outline-none focus:border-black transition-colors"
                        placeholder="Calle, Carrera, Manzana, Edificio, Apto..."
                      />
                    </div>
                  </div>
                </section>

                {/* STEP 2: MÉTODO DE PAGO */}
                <section aria-labelledby="payment-heading" className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-black text-white font-black text-xs flex items-center justify-center">
                      2
                    </div>
                    <div>
                      <h2 id="payment-heading" className="text-base sm:text-lg font-black uppercase tracking-tight text-black flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-black" />
                        Método de Pago Seguro
                      </h2>
                      <p className="text-xs text-gray-500">
                        Selecciona cómo deseas realizar tu abono o pago oficial.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        id: 'bold',
                        label: 'Bold Colombia — Pasarela Oficial en Línea',
                        isRecommended: true,
                        sub: 'Paga al instante y con seguridad certificada. Acepta PSE (todos los bancos de Colombia), Tarjetas Débito y Crédito (Visa, Mastercard, Amex), Nequi, Daviplata y Botón Bancolombia.',
                        icon: Zap,
                        badges: ['PSE', 'Visa / Mastercard', 'Nequi', 'Bancolombia'],
                      },
                      {
                        id: 'transfer',
                        label: 'Bancolombia Transferencia Directa / QR WhatsApp',
                        isRecommended: false,
                        sub: 'Transferencia directa a cuenta corriente/ahorros o QR con confirmación de comprobante vía WhatsApp.',
                        icon: Building,
                        badges: ['Transferencia Manual', 'WhatsApp'],
                      },
                    ].map((m) => {
                      const Icon = m.icon;
                      const isSelected = paymentMethod === m.id;
                      return (
                        <label
                          key={m.id}
                          className={`flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                            isSelected
                              ? 'bg-neutral-50/90 border-black shadow-md ring-1 ring-black/5'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={isSelected}
                            onChange={() => setPaymentMethod(m.id as PaymentMethod)}
                            className="mt-1 text-black focus:ring-black accent-black w-4 h-4 shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-black text-lime flex items-center justify-center shrink-0">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-sm font-black text-black">{m.label}</span>
                              {m.isRecommended && (
                                <span className="bg-lime text-black font-black text-[10px] uppercase px-2 py-0.5 rounded-full border border-lime-dark/30 shadow-2xs">
                                  Recomendado
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{m.sub}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {m.badges.map((b) => (
                                <span
                                  key={b}
                                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md border border-gray-200"
                                >
                                  {b}
                                </span>
                              ))}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </section>

              </div>

              {/* RIGHT COLUMN: STICKY ORDER SUMMARY (RESUMEN DEL PEDIDO) */}
              <div className="lg:col-span-5">
                <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm sticky top-24 space-y-6">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <h3 className="text-base font-black uppercase tracking-tight text-black">
                      Resumen del Pedido
                    </h3>
                    <span className="text-xs font-bold text-gray-500">
                      {items.length} {items.length === 1 ? 'producto' : 'productos'}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="max-h-64 overflow-y-auto space-y-3 pr-1 divide-y divide-gray-200/60">
                    {items.map((item) => (
                      <div key={item.product.id} className="pt-3 first:pt-0 flex items-center gap-3">
                        <div className="w-14 h-14 bg-white border border-gray-200 rounded-xl p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                          <img
                            src={item.product.images?.[0] || '/mpr-brake-disc.png'}
                            alt={item.product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-extrabold text-black uppercase truncate">
                            {item.product.name}
                          </h4>
                          <span className="text-[11px] text-gray-500">
                            Cant: {item.quantity} × {formatCurrency(item.product.discount_price ?? item.product.price)}
                          </span>
                        </div>
                        <span className="text-xs font-black text-black shrink-0">
                          {formatCurrency((item.product.discount_price ?? item.product.price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="space-y-2.5 pt-4 border-t border-gray-200 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded">
                        <span>Cupón ({coupon?.code}):</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-600">
                      <span>Envío a Nivel Nacional:</span>
                      <span className="font-bold text-gray-900">
                        {freeShipping ? (
                          <span className="text-emerald-700 font-extrabold uppercase">GRATIS ($0)</span>
                        ) : (
                          formatCurrency(shippingCost)
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between pt-3 border-t border-gray-200 text-lg font-black text-black">
                      <span>TOTAL A PAGAR:</span>
                      <span>{formatCurrency(finalTotal)}</span>
                    </div>
                  </div>

                  {/* Primary Black CTA Button (Identical to Single Product design!) */}
                  <button
                    type="submit"
                    disabled={isLoading || isBoldOpening || items.length === 0}
                    className="w-full bg-black hover:bg-neutral-800 text-white font-black py-4 px-6 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2.5 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-5 h-5 text-lime" />
                    <span>
                      {isLoading || isBoldOpening
                        ? 'CONECTANDO CON PASARELA BOLD...'
                        : paymentMethod === 'bold'
                        ? `PAGAR CON BOLD ${formatCurrency(finalTotal)}`
                        : `CONFIRMAR PEDIDO ${formatCurrency(finalTotal)}`}
                    </span>
                  </button>

                  {/* Trust guarantees */}
                  <div className="space-y-2 pt-2 border-t border-gray-200/80 text-[11px] text-gray-500">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-black shrink-0" />
                      <span>Despacho prioritario con guía de rastreo nacional.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-black shrink-0" />
                      <span>Emisión de Factura Electrónica conforme a requisitos DIAN.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-black shrink-0" />
                      <span>Garantía de compra protegida y encriptación de datos.</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </form>
        )}
      </main>
    </div>
  );
};

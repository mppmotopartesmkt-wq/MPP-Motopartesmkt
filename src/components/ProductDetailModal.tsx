import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Heart,
  Check,
  ArrowLeft,
  Lock,
  RotateCcw,
  ZoomIn,
  Box,
  Share2,
  ChevronDown,
  Layers,
  Wrench,
  Award,
  ArrowRight,
  Play,
  Film,
} from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
  onProceedToCheckout?: () => void;
  allProducts?: Product[];
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectProduct,
  onProceedToCheckout,
  allProducts = [],
}) => {
  const { addToCart, toggleWishlist, isWishlisted, setIsCartOpen, totalItems } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'compatibility' | 'shipping' | 'logistics'>('details');
  const [isZoomed, setIsZoomed] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setQuantity(1);
      setAdded(false);
      setIsZoomed(false);
      // Lock background scrolling
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [product]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const wishlisted = isWishlisted(product.id);

  const handleAdd = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1500);
    // Open Cart Drawer immediately on top so user can review and proceed to checkout
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    if (onProceedToCheckout) {
      onProceedToCheckout();
    } else {
      setIsCartOpen(true);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  // Unified media gallery supporting photos and videos
  interface MediaItem {
    type: 'image' | 'video';
    url: string;
  }

  const mediaList: MediaItem[] = [];
  if (product.images && product.images.length > 0) {
    product.images.forEach((img) => {
      if (img) mediaList.push({ type: 'image', url: img });
    });
  } else {
    mediaList.push({ type: 'image', url: '/mpr-brake-disc.png' });
  }

  if (product.videos && product.videos.length > 0) {
    product.videos.forEach((vid) => {
      if (vid) mediaList.push({ type: 'video', url: vid });
    });
  }

  // Guarantee at least 4 visual views for aesthetics if single photo and no videos
  const galleryItems: MediaItem[] =
    mediaList.length === 1 && mediaList[0].type === 'image'
      ? [mediaList[0], mediaList[0], mediaList[0], mediaList[0]]
      : mediaList;

  const currentMedia = galleryItems[selectedImage] || galleryItems[0] || { type: 'image', url: '/mpr-brake-disc.png' };

  // Related products (exclude current product)
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-white text-gray-900 animate-fadeIn"
    >
      {/* 1. TOP STICKY BAR (CLEAN BREADCRUMBS & FAST ACTIONS) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Volver al Catálogo button & Breadcrumbs */}
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
              <span>Repuestos</span>
              <span>/</span>
              <span className="text-gray-900 font-semibold truncate">
                {product.name}
              </span>
            </nav>
          </div>

          {/* Right: Quick actions (Share, Wishlist, Close) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full text-gray-600 hover:text-black hover:bg-gray-100 transition-colors relative"
              title="Copiar enlace del producto"
              aria-label="Compartir producto"
            >
              <Share2 className="w-4 h-4" />
              {copiedShare && (
                <span className="absolute -bottom-8 right-0 bg-black text-white text-[10px] font-bold py-1 px-2 rounded shadow-md whitespace-nowrap">
                  ¡Enlace copiado!
                </span>
              )}
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-2.5 rounded-full transition-colors ${
                wishlisted
                  ? 'text-lime fill-lime bg-lime/10'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
              title="Guardar en favoritos"
              aria-label="Guardar en favoritos"
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-lime text-lime' : ''}`} />
            </button>

            {/* Cart drawer toggle */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 rounded-full text-gray-700 hover:text-black hover:bg-gray-100 transition-colors relative"
              title="Abrir Carrito de Compras"
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-lime text-black font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 hover:text-black transition-colors ml-1"
              title="Cerrar (Esc)"
              aria-label="Cerrar producto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. MAIN PRODUCT HERO SHOWCASE (2 COLUMNS, LUXURY WHITE BACKGROUND) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* LEFT COLUMN: THUMBNAILS + LARGE HERO IMAGE SHOWCASE */}
          <section aria-label="Galería del repuesto" className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 sm:gap-6">
            
            {/* Vertical thumbnails list (Photos & Videos) */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
              {galleryItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-50 p-2 border-2 transition-all shrink-0 flex items-center justify-center overflow-hidden group relative ${
                    selectedImage === idx
                      ? 'border-black ring-1 ring-black shadow-sm'
                      : 'border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`Ver vista ${idx + 1} del producto`}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-black rounded flex items-center justify-center relative overflow-hidden">
                      <video src={item.url} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-5 h-5 text-white fill-white drop-shadow" />
                      </div>
                      <span className="absolute bottom-0 inset-x-0 bg-purple-700/90 text-[7px] sm:text-[8px] text-white font-extrabold uppercase text-center py-0.5">
                        VIDEO
                      </span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={`Vista ${idx + 1}`}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  )}
                </button>
              ))}

              <div className="hidden sm:flex items-center justify-center w-20 py-1 text-gray-400">
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </div>
            </div>

            {/* Main prominent display (Zoomable Image or HTML5 Video Player) */}
            <div className="flex-1">
              {currentMedia.type === 'video' ? (
                <div className="relative w-full aspect-square bg-black rounded-2xl border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                  <video
                    key={currentMedia.url}
                    src={currentMedia.url}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain max-h-[550px]"
                  />
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="bg-purple-600 text-white font-black text-[10px] sm:text-xs uppercase px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" /> Video Demostración
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className={`relative w-full aspect-square bg-[#f8f9fa] rounded-2xl border border-gray-100 flex items-center justify-center p-8 sm:p-14 overflow-hidden shadow-sm transition-all duration-300 ${
                    isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                >
                  {/* Floating badge inside image card */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="bg-white/90 backdrop-blur-sm text-black font-extrabold text-[10px] sm:text-xs uppercase px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                      {product.brand || 'MPR PERFORMANCE'}
                    </span>
                    {product.discount_price && (
                      <span className="bg-black text-white font-extrabold text-[10px] sm:text-xs uppercase px-2.5 py-1 rounded-full shadow-sm">
                        OFERTA
                      </span>
                    )}
                  </div>

                  {/* Main Product Image with Zoom Effect */}
                  <img
                    src={currentMedia.url}
                    alt={product.name}
                    className={`w-full h-full object-contain filter drop-shadow-lg transition-transform duration-500 ease-out ${
                      isZoomed ? 'scale-150' : 'hover:scale-105'
                    }`}
                  />

                  {/* Bottom Right Zoom Icon */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsZoomed(!isZoomed);
                    }}
                    className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full bg-white/95 border border-gray-200 shadow-md flex items-center justify-center text-gray-800 hover:text-black hover:scale-105 transition-all"
                    title={isZoomed ? 'Reducir imagen' : 'Ampliar imagen'}
                    aria-label={isZoomed ? 'Reducir imagen' : 'Ampliar imagen'}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              )}

              <p className="text-[11px] text-gray-400 text-center mt-2.5 flex items-center justify-center gap-1">
                {currentMedia.type === 'video' ? (
                  <span>Reproduciendo video demostrativo del producto</span>
                ) : (
                  <span>Pasa el cursor o haz clic en la imagen para hacer zoom de alta resolución</span>
                )}
              </p>
            </div>

          </section>

          {/* RIGHT COLUMN: DECISION & PURCHASE PANEL */}
          <section aria-labelledby="product-title" className="lg:col-span-5 flex flex-col justify-start">
            
            {/* Pill Tag */}
            <div className="mb-3">
              <span className="inline-block bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Repuesto Certificado Moto
              </span>
            </div>

            {/* Product Title */}
            <h1 id="product-title" className="text-3xl sm:text-4xl font-extrabold text-black uppercase tracking-tight mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating & Verified Reviews */}
            <div className="flex items-center gap-3 text-xs text-gray-600 mb-5">
              <div className="flex text-black">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-black text-black" />
                ))}
              </div>
              <span className="font-extrabold text-black text-sm">
                {product.rating || '5.0'}
              </span>
              <span className="text-gray-300">|</span>
              <span className="font-medium text-gray-700">
                ({product.reviews_count || 128} reseñas verificadas)
              </span>
            </div>

            {/* Price Showcase */}
            <div className="flex items-baseline gap-3 mb-5 pb-5 border-b border-gray-100">
              <span className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                {formatCurrency(product.discount_price ?? product.price)}
              </span>

              {product.discount_price && (
                <>
                  <span className="text-lg text-gray-400 line-through font-semibold">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="bg-black text-white text-xs font-black px-2 py-0.5 rounded tracking-wider uppercase">
                    Ahorro
                  </span>
                </>
              )}
            </div>

            {/* Commercial Description */}
            <p className="text-sm text-gray-700 leading-relaxed mb-6 font-normal">
              {product.description ||
                'Repuesto de alta ingeniería para motocicleta fabricado bajo estrictos estándares de competición y calle. Diseñado para ofrecer máxima precisión, durabilidad y rendimiento óptimo en cada ruta.'}
            </p>

            {/* Technical Quick Meta Preview */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-xs text-gray-700 mb-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Marca:</span>
                <span className="font-bold text-black">{product.brand || 'MPR Motopartes'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Código SKU:</span>
                <span className="font-mono text-gray-900 font-bold">{product.sku}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Categoría:</span>
                <span className="font-bold text-black">{product.category || 'Repuestos'}</span>
              </div>
              {product.wholesale_price && (
                <div className="flex justify-between items-center bg-lime/20 px-2.5 py-1.5 rounded-lg border border-lime/30">
                  <span className="text-gray-800 font-black">Precio Por Mayor:</span>
                  <span className="font-extrabold text-black text-sm">{formatCurrency(product.wholesale_price)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1 border-t border-gray-200/60">
                <span className="text-gray-500 font-medium">Disponibilidad:</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  {product.status_text || (product.stock_qty > 0
                    ? `En Stock (${product.stock_qty} unid. en bodega)`
                    : 'Agotado temporalmente')}
                </span>
              </div>
            </div>

            {/* QUANTITY & PRIMARY ACTION (BLACK BUTTONS AS REQUESTED) */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                
                {/* Quantity selector */}
                <div className="flex items-center border border-gray-300 rounded-xl bg-white px-2 py-1 shrink-0 h-13 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-11 flex items-center justify-center text-gray-600 hover:text-black font-bold text-lg transition-colors"
                    aria-label="Disminuir cantidad"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-extrabold text-black">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_qty || 99, quantity + 1))}
                    className="w-9 h-11 flex items-center justify-center text-gray-600 hover:text-black font-bold text-lg transition-colors"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>

                {/* Primary Button: BLACK BUTTON AS USER SPECIFIED */}
                <button
                  onClick={handleAdd}
                  disabled={product.stock_qty <= 0}
                  className={`flex-1 h-13 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-[0.99] ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-black hover:bg-neutral-800 text-white shadow-black/10'
                  } ${product.stock_qty <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5 text-white" />
                      <span>¡AÑADIDO AL CARRITO!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>AGREGAR AL CARRITO</span>
                    </>
                  )}
                </button>

                {/* Wishlist button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-13 h-13 rounded-xl border flex items-center justify-center transition-all shrink-0 shadow-sm ${
                    wishlisted
                      ? 'border-lime bg-lime/10 text-lime'
                      : 'border-gray-300 hover:border-black text-gray-600 hover:text-black bg-white'
                  }`}
                  aria-label="Favorito"
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-lime text-lime' : ''}`} />
                </button>
              </div>

              {/* Instant Direct Checkout Button */}
              <button
                onClick={handleBuyNow}
                disabled={product.stock_qty <= 0}
                className="w-full h-12 bg-lime hover:bg-lime-bright text-black font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-lime/20 active:scale-[0.99]"
              >
                <span>COMPRAR AHORA (CHECKOUT DIRECTO)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Instant purchase hint */}
              <p className="text-[11px] text-gray-500 text-center">
                Pago seguro garantizado con PSE, tarjetas débito/crédito y transferencias.
              </p>
            </div>

            {/* TRUST BADGES ROW (EXACT 3 BADGES FROM REFERENCE) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-gray-100 text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-50/80">
                <Truck className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900">Envío Gratis</h4>
                  <p className="text-[11px] text-gray-500">En compras sobre $250.000 COP</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-50/80">
                <RotateCcw className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900">Garantía Directa</h4>
                  <p className="text-[11px] text-gray-500">30 días de satisfacción total</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-50/80">
                <Lock className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900">Pago Seguro</h4>
                  <p className="text-[11px] text-gray-500">Protección certificada 100%</p>
                </div>
              </div>
            </div>

          </section>

        </div>

        {/* 3. TECHNICAL SPECIFICATIONS TABS (FROM VELORA REFERENCE) */}
        <section aria-labelledby="technical-specs-heading" className="mt-16 pt-10 border-t border-gray-100">
          
          {/* Tab Navigation */}
          <div className="flex items-center gap-6 sm:gap-10 border-b border-gray-200 overflow-x-auto pb-1 mb-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`text-sm sm:text-base font-black uppercase tracking-wider pb-3 transition-colors whitespace-nowrap relative ${
                activeTab === 'details'
                  ? 'text-black'
                  : 'text-gray-400 hover:text-gray-800'
              }`}
            >
              Detalles Técnicos
              {activeTab === 'details' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('compatibility')}
              className={`text-sm sm:text-base font-black uppercase tracking-wider pb-3 transition-colors whitespace-nowrap relative ${
                activeTab === 'compatibility'
                  ? 'text-black'
                  : 'text-gray-400 hover:text-gray-800'
              }`}
            >
              Compatibilidad de Motos
              {activeTab === 'compatibility' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('logistics')}
              className={`text-sm sm:text-base font-black uppercase tracking-wider pb-3 transition-colors whitespace-nowrap relative ${
                activeTab === 'logistics'
                  ? 'text-black'
                  : 'text-gray-400 hover:text-gray-800'
              }`}
            >
              Dimensiones & Logística
              {activeTab === 'logistics' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('shipping')}
              className={`text-sm sm:text-base font-black uppercase tracking-wider pb-3 transition-colors whitespace-nowrap relative ${
                activeTab === 'shipping'
                  ? 'text-black'
                  : 'text-gray-400 hover:text-gray-800'
              }`}
            >
              Envíos & Garantía
              {activeTab === 'shipping' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>
          </div>

          {/* Tab 1: Detalles Técnicos */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-4">
                <h3 id="technical-specs-heading" className="text-xl font-black text-black uppercase tracking-tight">
                  Ingeniería de Alto Rendimiento para Motos
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Diseñado para soportar las exigencias más altas tanto en conducción urbana agresiva como en circuitos de velocidad. Fabricado en acero de alto carbono con templado térmico por inducción para garantizar un coeficiente de fricción parejo y prevenir cualquier cristalización de las pastillas.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2.5 text-xs text-gray-800 font-semibold">
                    <Wrench className="w-4 h-4 text-black shrink-0" />
                    <span>Corte de precisión CNC láser</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-800 font-semibold">
                    <Layers className="w-4 h-4 text-black shrink-0" />
                    <span>Acero inoxidable 420 (2Cr13)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-800 font-semibold">
                    <Award className="w-4 h-4 text-black shrink-0" />
                    <span>Disipación térmica por ranurado wave</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-800 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-black shrink-0" />
                    <span>Resistencia contra la fatiga de frenado</span>
                  </div>
                </div>
              </div>

              {/* Right technical highlight card */}
              <div className="md:col-span-5 bg-gradient-to-br from-neutral-900 to-black text-white p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-lime mb-2 block">
                    MPR TECH SPEC
                  </span>
                  <h4 className="text-xl font-black tracking-tight mb-3">
                    CONTROL & SEGURIDAD TOTAL
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    Geometría optimizada para evacuación inmediata de agua, suciedad y partículas de asbesto/cerámica. Mantiene el disco refrigerado aun en descensos prolongados o frenadas bruscas.
                  </p>
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-neutral-800">
                    <span className="text-gray-400">Tolerancia de alabeo:</span>
                    <span className="font-mono text-lime font-bold">&lt; 0.05 mm</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Compatibilidad de Motos */}
          {activeTab === 'compatibility' && (
            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100">
              <h3 className="text-lg font-black text-black uppercase mb-3">
                Guía de Compatibilidad y Montaje
              </h3>
              <p className="text-sm text-gray-600 mb-6 max-w-2xl">
                Este repuesto cuenta con medidas de anclaje estándar. Antes de la instalación, verifica el diámetro exterior, diámetro de centro y la distancia entre tornillos de sujeción:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-gray-400 font-bold block mb-1">Cilindrada Recomendada</span>
                  <span className="font-extrabold text-black text-sm">150cc — 600cc</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-gray-400 font-bold block mb-1">Posición de Montaje</span>
                  <span className="font-extrabold text-black text-sm">Delantero / Trasero (Según modelo)</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-gray-400 font-bold block mb-1">Tipo de Anclaje</span>
                  <span className="font-extrabold text-black text-sm">Tornillería directa OEM</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Dimensiones & Logística */}
          {activeTab === 'logistics' && (
            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100">
              <h3 className="text-lg font-black text-black uppercase mb-4 flex items-center gap-2">
                <Box className="w-5 h-5 text-black" />
                Especificaciones de Empaque y Despacho
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-gray-400 block mb-1">Dimensiones de Caja:</span>
                  <span className="font-black text-black text-sm">
                    {product.length_mm || 380} × {product.width_mm || 290} × {product.height_mm || 280} mm
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-gray-400 block mb-1">Peso Bruto:</span>
                  <span className="font-black text-black text-sm">
                    {product.gross_weight_kg ? `${product.gross_weight_kg} kg` : '2.35 kg'}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-gray-400 block mb-1">Peso Neto:</span>
                  <span className="font-black text-black text-sm">
                    {product.net_weight_kg ? `${product.net_weight_kg} kg` : '1.62 kg'}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-gray-400 block mb-1">Empaque:</span>
                  <span className="font-bold text-gray-800 text-xs">
                    {product.package_details || 'Caja individual de exportación reforzada'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Envíos & Garantía */}
          {activeTab === 'shipping' && (
            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100 space-y-4">
              <h3 className="text-lg font-black text-black uppercase">
                Políticas de Despacho Nacional
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-700">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2">
                  <h4 className="font-bold text-black text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4 text-black" /> Tiempos de Entrega
                  </h4>
                  <p>• Ciudades principales de Colombia: 1 a 3 días hábiles.</p>
                  <p>• Resto del país: 2 a 5 días hábiles a través de Servientrega, Coordinadora o Envía.</p>
                  <p>• Envío 100% asegurado ante extravío o daño en tránsito.</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2">
                  <h4 className="font-bold text-black text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-black" /> Garantía de Fábrica
                  </h4>
                  <p>• Cobertura de 30 días contra cualquier defecto de manufactura.</p>
                  <p>• Soporte postventa y asesoría técnica directa con expertos en motocicletas.</p>
                  <p>• Facturación legal conforme a las exigencias DIAN para empresas y personas naturales.</p>
                </div>
              </div>
            </div>
          )}

        </section>

        {/* 4. "TAMBIÉN TE PUEDE INTERESAR" (FROM VELORA REFERENCE) */}
        {relatedProducts.length > 0 && (
          <section aria-labelledby="related-products-heading" className="mt-16 pt-12 border-t border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 id="related-products-heading" className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
                También te puede interesar
              </h3>
              <span className="text-xs font-black uppercase text-gray-500 tracking-wider">
                Catálogo MPR Repuestos
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relProduct) => (
                <div
                  key={relProduct.id}
                  onClick={() => {
                    if (onSelectProduct) {
                      onSelectProduct(relProduct);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="group bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex flex-col justify-between cursor-pointer hover:shadow-xl hover:border-black transition-all"
                >
                  <div className="w-full aspect-square bg-[#f8f9fa] rounded-lg p-4 flex items-center justify-center mb-3 relative overflow-hidden">
                    <img
                      src={relProduct.images?.[0] || '/mpr-brake-disc.png'}
                      alt={relProduct.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform filter drop-shadow-sm"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400 block mb-0.5">
                      {relProduct.brand || 'MPR'}
                    </span>
                    <h4 className="text-xs sm:text-sm font-extrabold text-black uppercase line-clamp-1 group-hover:text-neutral-600 transition-colors">
                      {relProduct.name}
                    </h4>
                    <p className="text-xs sm:text-sm font-black text-black mt-1">
                      {formatCurrency(relProduct.discount_price ?? relProduct.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
};

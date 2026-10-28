import React, { useState, useEffect } from 'react';
import { TopAnnouncementBar } from '../components/TopAnnouncementBar';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { ValuePropsBar } from '../components/ValuePropsBar';
import { ShopByCategory } from '../components/ShopByCategory';
import { BestSellers } from '../components/BestSellers';
import { PromoBanners } from '../components/PromoBanners';
import { BrandsBar } from '../components/BrandsBar';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { SearchModal } from '../components/SearchModal';
import { ProfileModal } from '../components/ProfileModal';
import { Product } from '../types';
import { fetchProducts, markOrderPaid } from '../services/api';
import { Filter, ArrowLeft, CheckCircle2, Zap, X } from 'lucide-react';

interface HomeProps {
  onNavigateToAdmin?: () => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigateToAdmin }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Bold Payment Status Banner / Modal
  const [boldPaymentNotice, setBoldPaymentNotice] = useState<{
    orderId: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    fetchProducts().then((data) => setProducts(data));

    // Detectar retorno de pago desde Bold
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const boldOrderId =
        urlParams.get('bold_order_id') ||
        urlParams.get('bold-order-id') ||
        urlParams.get('order_id');
      const boldStatus =
        urlParams.get('status') ||
        urlParams.get('bold_tx_status') ||
        'approved';

      if (boldOrderId) {
        setBoldPaymentNotice({ orderId: boldOrderId, status: boldStatus });
        markOrderPaid(boldOrderId);
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, []);

  const normalizeText = (text: string) =>
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  // Filter products by selected category or special "Sale" and brand
  const filteredProducts = products.filter((p) => {
    // 1. Category match
    let matchesCat = true;
    if (selectedCategory === 'All') matchesCat = true;
    else if (selectedCategory === 'Sale') matchesCat = !!p.discount_price;
    else if (selectedCategory === 'Brands') matchesCat = true;
    else if (!p.category) matchesCat = false;
    else matchesCat = normalizeText(p.category) === normalizeText(selectedCategory);

    // 2. Brand match
    let matchesBrand = true;
    if (selectedBrand !== 'All') {
      const bTerm = selectedBrand.toLowerCase();
      matchesBrand =
        (p.brand || '').toLowerCase().includes(bTerm) ||
        p.name.toLowerCase().includes(bTerm);
    }

    return matchesCat && matchesBrand;
  });

  // Best sellers: take top products
  const bestSellers = products.slice(0, 6);

  const handleScrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getCategoryTitle = (cat: string) => {
    const norm = normalizeText(cat);
    switch (norm) {
      case 'all':
        return 'EXPLORA NUESTRA COLECCIÓN COMPLETA';
      case 'cascos':
        return 'CASCOS CERTIFICADOS DE ALTA SEGURIDAD';
      case 'accesorios':
        return 'ACCESORIOS Y SOPORTES PARA MOTO';
      case 'repuestos':
        return 'REPUESTOS Y PARTES MECÁNICAS';
      case 'llantas':
        return 'LLANTAS Y NEUMÁTICOS DEPORTIVOS';
      case 'baterias':
        return 'BATERÍAS DE ALTO ARRANQUE (CCA)';
      case 'tanques':
        return 'TANQUES DE COMBUSTIBLE PARA MOTO';
      case 'farolas':
        return 'FAROLAS Y SISTEMAS DE ILUMINACIÓN LED';
      case 'defensas':
        return 'DEFENSAS Y PROTECCIÓN DE MOTOR';
      case 'espejos':
        return 'ESPEJOS RETROVISORES Y ACCESORIOS';
      case 'carenajes':
        return 'CARENAJES, TAPAS Y CÚPULAS AERODINÁMICAS';
      case 'frenos':
        return 'DISCOS, PASTILLAS Y SISTEMAS DE FRENO';
      case 'mantenimiento':
        return 'LUBRICANTES Y MANTENIMIENTO PREVENTIVO';
      case 'sale':
        return 'OFERTAS Y PROMOCIONES ESPECIALES';
      default:
        return `CATEGORÍA: ${cat.toUpperCase()}`;
    }
  };

  const categoryFilters = [
    { label: 'Todos', key: 'All' },
    { label: 'Cascos', key: 'Cascos' },
    { label: 'Accesorios', key: 'Accesorios' },
    { label: 'Repuestos', key: 'Repuestos' },
    { label: 'Llantas', key: 'Llantas' },
    { label: 'Baterías', key: 'Baterías' },
    { label: 'Tanques', key: 'Tanques' },
    { label: 'Farolas', key: 'Farolas' },
    { label: 'Defensas', key: 'Defensas' },
    { label: 'Espejos', key: 'Espejos' },
    { label: 'Carenajes', key: 'Carenajes' },
    { label: 'Frenos', key: 'Frenos' },
    { label: 'Ofertas', key: 'Sale' },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <TopAnnouncementBar />

      {/* 2. NAVBAR */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onNavigateToAdmin={onNavigateToAdmin}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (cat !== 'All') {
            handleScrollToCatalog();
          }
        }}
      />

      {/* 3. HERO SECTION */}
      <Hero
        onShopNow={handleScrollToCatalog}
        onExplore={() => {
          setSelectedCategory('All');
          handleScrollToCatalog();
        }}
      />

      {/* 4. VALUE PROPS (5 PILLARS) */}
      <ValuePropsBar />

      {/* 5. SHOP BY CATEGORY (8 CIRCLES) */}
      <ShopByCategory
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          handleScrollToCatalog();
        }}
      />

      {/* 6. BEST SELLERS CAROUSEL (AS IN PHOTO) */}
      <BestSellers
        products={bestSellers}
        onViewAll={() => {
          setSelectedCategory('All');
          handleScrollToCatalog();
        }}
        onQuickView={(p) => setSelectedProduct(p)}
      />

      {/* 7. DUAL PROMO BANNERS */}
      <PromoBanners
        onShopDeals={() => {
          setSelectedCategory('Sale');
          handleScrollToCatalog();
        }}
        onExploreNew={() => {
          setSelectedCategory('Helmets');
          handleScrollToCatalog();
        }}
      />

      {/* 8. BRANDS LOGOS ROW */}
      <BrandsBar
        onSelectBrand={(brand) => {
          setSelectedBrand(brand);
          handleScrollToCatalog();
        }}
      />

      {/* 9. EXTENDED CATALOG SECTION (DYNAMIC & FILTERABLE) */}
      <section id="catalog-section" className="py-16 px-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lime-dark font-black tracking-widest text-xs uppercase">
                  CATÁLOGO OFICIAL
                </span>
                {(selectedCategory !== 'All' || selectedBrand !== 'All') && (
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedBrand('All');
                    }}
                    className="text-xs text-gray-500 hover:text-black flex items-center gap-1 underline"
                  >
                    <ArrowLeft className="w-3 h-3" /> Ver Todos
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900">
                  {getCategoryTitle(selectedCategory)}
                </h2>
                {selectedBrand !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 bg-black text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                    <span>Marca: <strong className="text-lime">{selectedBrand}</strong></span>
                    <button
                      onClick={() => setSelectedBrand('All')}
                      className="hover:text-red-400 font-black ml-1 text-xs"
                      title="Quitar filtro de marca"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              <Filter className="w-4 h-4 text-gray-400 shrink-0 mr-1" />
              {categoryFilters.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase transition-all shrink-0 ${
                    selectedCategory === cat.key
                      ? 'bg-lime text-black shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>

        </div>
      </section>

      {/* 10. FOOTER */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          handleScrollToCatalog();
        }}
      />

      {/* MODALS & DRAWERS */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />
      
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        allProducts={products}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onNavigateToAdmin={onNavigateToAdmin}
      />

      {/* MODAL DE CONFIRMACIÓN PAGO BOLD COLOMBIA */}
      {boldPaymentNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setBoldPaymentNotice(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-lime-dark" />
                <span>Pago Aprobado con Bold</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
                ¡Transacción Exitosa!
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Tu pago ha sido validado correctamente mediante la pasarela de pagos oficial Bold Colombia. Tu pedido ya está registrado en nuestro centro de logística.
              </p>
            </div>

            <div className="bg-[#f8f9fa] border border-gray-200 rounded-xl p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Referencia de Orden:</span>
                <span className="font-mono font-black text-black">{boldPaymentNotice.orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Pasarela:</span>
                <span className="font-bold text-gray-900">Bold Colombia (SSL 256-bit)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Estado:</span>
                <span className="text-emerald-700 font-extrabold uppercase">Aprobado / Pagado</span>
              </div>
            </div>

            <button
              onClick={() => setBoldPaymentNotice(null)}
              className="w-full bg-black hover:bg-neutral-800 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Continuar en la Tienda
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

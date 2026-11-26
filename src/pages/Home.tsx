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
import {
  SlidersHorizontal,
  RotateCcw,
  Tag,
  Search,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Zap,
  Phone,
  MapPin,
  Mail,
  Store,
} from 'lucide-react';

interface HomeProps {
  onNavigateToAdmin?: () => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigateToAdmin }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeNav, setActiveNav] = useState<'inicio' | 'tienda' | 'contacto'>('tienda');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'name_asc'>('default');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9; // Exactly 3x3 grid matching the reference graphic

  // Mobile Filter Drawer State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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
      const rawStatus =
        urlParams.get('status') ||
        urlParams.get('bold_tx_status') ||
        urlParams.get('tx_status');

      if (boldOrderId) {
        const norm = (rawStatus || '').toLowerCase().trim();
        const isApproved =
          norm === 'approved' ||
          norm === 'paid' ||
          norm === 'aprobada' ||
          norm === 'exitosa';
        const isRejected =
          norm === 'rejected' ||
          norm === 'declined' ||
          norm === 'rechazada' ||
          norm === 'fallida' ||
          norm === 'failed';
        const isPending =
          norm === 'pending' ||
          norm === 'processing' ||
          norm === 'pendiente';

        const finalStatus = isApproved
          ? 'approved'
          : isRejected
          ? 'rejected'
          : isPending
          ? 'pending'
          : 'cancelled';

        setBoldPaymentNotice({ orderId: boldOrderId, status: finalStatus });

        if (isApproved) {
          markOrderPaid(boldOrderId);
        }

        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, []);

  const normalizeText = (text: string) =>
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  // Standard category list for MPR
  const baseCategories = [
    { label: 'Todos los Productos', key: 'All' },
    { label: 'Tanques', key: 'Tanques' },
    { label: 'Farolas', key: 'Farolas' },
    { label: 'Defensas', key: 'Defensas' },
    { label: 'Espejos', key: 'Espejos' },
    { label: 'Carenajes', key: 'Carenajes' },
    { label: 'Cascos', key: 'Cascos' },
    { label: 'Accesorios', key: 'Accesorios' },
    { label: 'Repuestos', key: 'Repuestos' },
    { label: 'Llantas', key: 'Llantas' },
    { label: 'Baterías', key: 'Baterías' },
    { label: 'Frenos', key: 'Frenos' },
    { label: 'Mantenimiento', key: 'Mantenimiento' },
    { label: 'Ofertas', key: 'Sale' },
  ];

  // Merge any dynamic categories present in the products
  const productCategories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean) as string[])
  );
  const additionalCategories = productCategories
    .filter(
      (pc) =>
        !baseCategories.some(
          (bc) => normalizeText(bc.key) === normalizeText(pc)
        )
    )
    .map((c) => ({ label: c, key: c }));

  const allCategoryOptions = [...baseCategories, ...additionalCategories];

  const getCategoryCount = (key: string) => {
    if (key === 'All') return products.length;
    if (key === 'Sale')
      return products.filter(
        (p) => p.discount_price != null && p.discount_price < p.price
      ).length;
    return products.filter(
      (p) => p.category && normalizeText(p.category) === normalizeText(key)
    ).length;
  };

  // Filter products by search term, category and brand
  const filteredProducts = products
    .filter((p) => {
      // 1. Search term match
      if (searchTerm.trim()) {
        const term = normalizeText(searchTerm.trim());
        const matchesSearch =
          normalizeText(p.name).includes(term) ||
          normalizeText(p.category || '').includes(term) ||
          normalizeText(p.brand || '').includes(term) ||
          normalizeText(p.sku || '').includes(term);
        if (!matchesSearch) return false;
      }

      // 2. Category match
      if (selectedCategory === 'All') {
        // match all
      } else if (selectedCategory === 'Sale') {
        if (!p.discount_price || p.discount_price >= p.price) return false;
      } else if (
        !p.category ||
        normalizeText(p.category) !== normalizeText(selectedCategory)
      ) {
        return false;
      }

      // 3. Brand match
      if (selectedBrand !== 'All') {
        const bTerm = selectedBrand.toLowerCase();
        const matchesBrand =
          (p.brand || '').toLowerCase().includes(bTerm) ||
          p.name.toLowerCase().includes(bTerm);
        if (!matchesBrand) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') {
        return (a.discount_price ?? a.price) - (b.discount_price ?? b.price);
      }
      if (sortBy === 'price_desc') {
        return (b.discount_price ?? b.price) - (a.discount_price ?? a.price);
      }
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name, 'es');
      }
      return 0; // Default / Destacados
    });

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSearchTerm('');
    setSortBy('default');
    setCurrentPage(1);
  };

  const bestSellers = products.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 flex flex-col font-sans">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <TopAnnouncementBar />

      {/* 2. NAVBAR (Matching the top bar in reference graphic) */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onNavigateToAdmin={onNavigateToAdmin}
        activeNav={activeNav}
        onNavChange={(nav) => {
          setActiveNav(nav);
          if (nav === 'tienda') {
            setSelectedCategory('All');
          }
        }}
        searchQuery={searchTerm}
        onSearchChange={(query) => {
          setSearchTerm(query);
          setActiveNav('tienda');
          setCurrentPage(1);
        }}
        onExecuteSearch={() => {
          setActiveNav('tienda');
          setCurrentPage(1);
        }}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveNav('tienda');
          setCurrentPage(1);
        }}
      />

      {/* ========================================================================= */}
      {/* VIEW 1: TIENDA / CATÁLOGO (EXACT LAYOUT FROM REFERENCE IMAGE) */}
      {/* ========================================================================= */}
      {activeNav === 'tienda' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
          
          {/* Mobile Filter Trigger Button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="w-full bg-white border border-gray-200/90 rounded-2xl py-3 px-4 text-xs font-black text-gray-900 flex items-center justify-between shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-black" />
                <span>Filtros Inteligentes</span>
              </div>
              <span className="bg-black text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {selectedCategory === 'All' ? 'Todos los Productos' : selectedCategory}
              </span>
            </button>
          </div>

          {/* TWO COLUMN GRID: LEFT SIDEBAR + RIGHT PRODUCT CATALOG */}
          <div className="flex flex-col lg:flex-row items-start gap-8">
            
            {/* --------------------------------------------------------------------- */}
            {/* LEFT SIDEBAR: FILTROS INTELIGENTES (Matches Reference Image) */}
            {/* --------------------------------------------------------------------- */}
            <aside className="hidden lg:block w-64 shrink-0 bg-white border border-gray-100 rounded-3xl p-5 shadow-xs sticky top-24">
              
              {/* Header: Filtros Inteligentes & Limpiar */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-black" />
                  <span className="text-xs font-black uppercase text-gray-900 tracking-wider">
                    Filtros Inteligentes
                  </span>
                </div>
                {(selectedCategory !== 'All' || searchTerm !== '' || selectedBrand !== 'All') && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-bold text-gray-400 hover:text-black flex items-center gap-1 transition-colors cursor-pointer"
                    title="Restablecer filtros"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Limpiar</span>
                  </button>
                )}
              </div>

              {/* Subheading: CATEGORÍAS */}
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                <Tag className="w-3 h-3" />
                <span>CATEGORÍAS</span>
              </div>

              {/* Dynamic Category List with real counts */}
              <div className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 scrollbar-thin">
                {allCategoryOptions.map((cat) => {
                  const isSelected = selectedCategory === cat.key;
                  const count = getCategoryCount(cat.key);
                  return (
                    <button
                      key={cat.key}
                      onClick={() => {
                        setSelectedCategory(cat.key);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-full text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-black text-white font-black shadow-xs'
                          : 'text-gray-700 hover:text-black hover:bg-gray-50 font-medium'
                      }`}
                    >
                      <span className="truncate pr-2">{cat.label}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* --------------------------------------------------------------------- */}
            {/* RIGHT CATALOG: SEARCH / SORT BAR + 3-COLUMN PRODUCT GRID + PAGINATION */}
            {/* --------------------------------------------------------------------- */}
            <div className="flex-1 min-w-0 w-full">
              
              {/* Action Bar: Search Pill + Counter + Sort Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                
                {/* Large Pill Search Input */}
                <div className="relative flex-1 max-w-lg">
                  <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar por repuesto, modelo, referencia, Yamaha, Honda..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-white border border-gray-200/90 rounded-full pl-10 pr-9 py-2.5 text-xs text-gray-900 placeholder-gray-400 shadow-2xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setCurrentPage(1);
                      }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Counter & Sort dropdown */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 text-xs">
                  <span className="text-gray-500 text-xs hidden sm:inline">
                    Mostrando{' '}
                    <strong className="text-gray-900 font-black">
                      {paginatedProducts.length}
                    </strong>{' '}
                    de{' '}
                    <strong className="text-gray-900 font-black">
                      {filteredProducts.length}
                    </strong>{' '}
                    productos
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs hidden md:inline">
                      ⇅ Ordenar:
                    </span>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value as any);
                          setCurrentPage(1);
                        }}
                        className="appearance-none bg-white border border-gray-200/90 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-gray-900 shadow-2xs focus:outline-none focus:border-black cursor-pointer"
                      >
                        <option value="default">Destacados</option>
                        <option value="price_asc">Menor Precio</option>
                        <option value="price_desc">Mayor Precio</option>
                        <option value="name_asc">Nombre A-Z</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Grid: Exactly 3 Columns on Desktop */}
              {paginatedProducts.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-xs">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-black text-gray-900">
                    No encontramos repuestos con esos criterios
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Prueba ajustando los términos de búsqueda o seleccionando otra categoría en el menú lateral.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 bg-black text-white text-xs font-black px-5 py-2.5 rounded-full uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-xs"
                  >
                    Ver Todos los Repuestos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination Controls matching reference layout */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-10 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:text-black hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-2xs"
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = currentPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-full text-xs font-black transition-all ${
                          isActive
                            ? 'bg-lime text-black shadow-xs font-black scale-105'
                            : 'bg-white border border-gray-200 text-gray-700 hover:text-black hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:text-black hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-2xs"
                    aria-label="Página siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* MOBILE FILTER DRAWER */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                onClick={() => setIsMobileFilterOpen(false)}
              />
              <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 shadow-2xl flex flex-col z-10 animate-slideLeft">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-black" />
                    <span className="text-xs font-black uppercase text-gray-900 tracking-wider">
                      Filtros Inteligentes
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-black rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {allCategoryOptions.map((cat) => {
                    const isSelected = selectedCategory === cat.key;
                    const count = getCategoryCount(cat.key);
                    return (
                      <button
                        key={cat.key}
                        onClick={() => {
                          setSelectedCategory(cat.key);
                          setCurrentPage(1);
                          setIsMobileFilterOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-full text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-black text-white font-black shadow-xs'
                            : 'text-gray-700 hover:text-black hover:bg-gray-50 font-medium'
                        }`}
                      >
                        <span className="truncate pr-2">{cat.label}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-gray-100 mt-auto flex gap-2">
                  <button
                    onClick={() => {
                      handleResetFilters();
                      setIsMobileFilterOpen(false);
                    }}
                    className="flex-1 bg-gray-100 text-gray-800 text-xs font-bold py-2.5 rounded-full"
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="flex-1 bg-black text-white text-xs font-black py-2.5 rounded-full"
                  >
                    Ver ({filteredProducts.length})
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: INICIO (HERO, VALUE PROPS, BEST SELLERS, PROMOS & BRANDS) */}
      {/* ========================================================================= */}
      {activeNav === 'inicio' && (
        <div className="space-y-0 animate-fadeIn">
          {/* HERO SECTION */}
          <Hero
            onShopNow={() => {
              setActiveNav('tienda');
              setSelectedCategory('All');
            }}
            onExplore={() => {
              setActiveNav('tienda');
              setSelectedCategory('All');
            }}
          />

          {/* VALUE PROPS (5 PILLARS) */}
          <ValuePropsBar />

          {/* SHOP BY CATEGORY (8 CIRCLES) */}
          <ShopByCategory
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setActiveNav('tienda');
              setCurrentPage(1);
            }}
          />

          {/* BEST SELLERS CAROUSEL (WITH NEW CARD STYLE) */}
          <BestSellers
            products={bestSellers}
            onViewAll={() => {
              setActiveNav('tienda');
              setSelectedCategory('All');
            }}
            onQuickView={(p) => setSelectedProduct(p)}
          />

          {/* DUAL PROMO BANNERS */}
          <PromoBanners
            onShopDeals={() => {
              setSelectedCategory('Sale');
              setActiveNav('tienda');
              setCurrentPage(1);
            }}
            onExploreNew={() => {
              setSelectedCategory('Cascos');
              setActiveNav('tienda');
              setCurrentPage(1);
            }}
          />

          {/* BRANDS LOGOS ROW */}
          <BrandsBar
            onSelectBrand={(brand) => {
              setSelectedBrand(brand);
              setActiveNav('tienda');
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: CONTACTO (INFORMACIÓN DE CONTACTO & WHATSAPP) */}
      {/* ========================================================================= */}
      {activeNav === 'contacto' && (
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 animate-fadeIn">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 shadow-xs text-center space-y-6">
            <div className="w-16 h-16 bg-lime/20 text-black rounded-3xl flex items-center justify-center mx-auto">
              <Store className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900">
                Atención al Cliente & Punto de Venta
              </h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Estamos listos para asesorarte con la referencia exacta para tu motocicleta. Venta al detal y al por mayor con envíos a todo Colombia.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100 text-left">
              <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-1 border border-gray-100">
                <div className="flex items-center gap-2 text-black font-black text-xs uppercase">
                  <Phone className="w-4 h-4 text-lime-dark" />
                  <span>WhatsApp & Teléfono</span>
                </div>
                <p className="text-xs text-gray-600 font-bold mt-1">+57 318 423 9845</p>
                <p className="text-[11px] text-gray-400">Lunes a Sábado 8am - 6pm</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-1 border border-gray-100">
                <div className="flex items-center gap-2 text-black font-black text-xs uppercase">
                  <MapPin className="w-4 h-4 text-lime-dark" />
                  <span>Ubicación</span>
                </div>
                <p className="text-xs text-gray-600 font-bold mt-1">Bogotá D.C., Colombia</p>
                <p className="text-[11px] text-gray-400">Distribución nacional</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-1 border border-gray-100">
                <div className="flex items-center gap-2 text-black font-black text-xs uppercase">
                  <Mail className="w-4 h-4 text-lime-dark" />
                  <span>Correo Electrónico</span>
                </div>
                <p className="text-xs text-gray-600 font-bold mt-1">contacto@motopartes.com</p>
                <p className="text-[11px] text-gray-400">Respuesta en &lt; 24h</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  setActiveNav('tienda');
                  setSelectedCategory('All');
                }}
                className="bg-black hover:bg-neutral-800 text-white font-black px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-all shadow-xs"
              >
                Volver a la Tienda
              </button>
            </div>
          </div>
        </main>
      )}

      {/* 4. FOOTER */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveNav('tienda');
          setCurrentPage(1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 5. MODALS & DRAWERS */}
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
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setIsSearchOpen(false);
        }}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onNavigateToAdmin={onNavigateToAdmin}
      />

      {/* 6. MODAL DE CONFIRMACIÓN PAGO BOLD COLOMBIA */}
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

            {boldPaymentNotice.status === 'approved' ? (
              <>
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
                    Tu pago ha sido validado correctamente mediante la pasarela de pagos oficial Bold Colombia. Tu pedido ya está confirmado y en preparación para despacho.
                  </p>
                </div>
              </>
            ) : boldPaymentNotice.status === 'rejected' ? (
              <>
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border-2 border-red-500 shadow-sm">
                  <XCircle className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-800 text-[11px] font-black uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>Pago Rechazado o No Completado</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-red-600 uppercase tracking-tight">
                    Pago No Aprobado
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    La transacción no pudo completarse o fue rechazada por tu entidad bancaria. Tu pedido <strong className="text-red-700">NO será enviado a bodega</strong> hasta que se complete el pago.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border-2 border-amber-500 shadow-sm">
                  <Clock className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pago en Verificación / Pendiente</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
                    Pago Pendiente de Confirmación
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Tu pedido fue registrado pero aún no hemos recibido la aprobación bancaria de Bold. Una vez tu banco confirme los fondos, despacharemos tus repuestos.
                  </p>
                </div>
              </>
            )}

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
                <span className={`font-black uppercase text-xs px-2 py-0.5 rounded ${
                  boldPaymentNotice.status === 'approved'
                    ? 'text-emerald-700 bg-emerald-50'
                    : boldPaymentNotice.status === 'rejected'
                    ? 'text-red-700 bg-red-50'
                    : 'text-amber-700 bg-amber-50'
                }`}>
                  {boldPaymentNotice.status === 'approved'
                    ? 'Aprobado / Pagado'
                    : boldPaymentNotice.status === 'rejected'
                    ? 'Rechazado (No Pagado)'
                    : 'Pendiente de Pago'}
                </span>
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

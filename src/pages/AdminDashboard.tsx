import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  Upload,
  Edit2,
  Trash2,
  Tag,
  Copy,
  Check,
  RefreshCw,
  Video,
  Play,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  Download,
  X,
  XCircle,
  CameraOff,
} from 'lucide-react';
import { Product } from '../types';
import {
  fetchProducts,
  fetchOrders,
  updateOrderStatus,
  saveProduct,
  deleteProduct,
  uploadProductMedia,
  UploadMediaResult,
} from '../services/api';
import { formatCurrency } from '../utils/format';

interface AdminDashboardProps {
  onBackToStore: () => void;
}

export type SmartPreset =
  | 'all'
  | 'critical'
  | 'low_stock'
  | 'offers'
  | 'wholesale'
  | 'missing_photo'
  | 'with_video'
  | 'inactive';

export type StockLevel = 'all' | 'zero' | 'critical' | 'low' | 'optimal';

export type SortOption =
  | 'default'
  | 'stock_asc'
  | 'stock_desc'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc'
  | 'discount_desc';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'coupons' | 'storage'>('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & smart filters in inventory
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [smartPreset, setSmartPreset] = useState<SmartPreset>('all');
  const [selectedStockLevel, setSelectedStockLevel] = useState<StockLevel>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  // Modal for new/edit product
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [modalUploading, setModalUploading] = useState<'photo' | 'video' | null>(null);
  const [photoUploadProgress, setPhotoUploadProgress] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Storage upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<UploadMediaResult | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // New coupon state
  const [coupons, setCoupons] = useState([
    { code: 'MPR10', discount_type: 'percentage', discount_value: 10, current_uses: 24, max_uses: 1000, is_active: true },
    { code: 'RIDE10', discount_type: 'percentage', discount_value: 10, current_uses: 52, max_uses: 1000, is_active: true },
    { code: 'LIME20', discount_type: 'percentage', discount_value: 20, current_uses: 8, max_uses: 500, is_active: true },
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponValue, setNewCouponValue] = useState(15);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, ords] = await Promise.all([fetchProducts(), fetchOrders()]);
      setProducts(prods);
      setOrders(ords);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // KPIs
  const totalSalesCOP = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
  const totalOrdersCount = orders.length;
  const lowStockItems = products.filter((p) => p.stock_qty < 25);
  const totalInventoryValue = products.reduce((acc, p) => acc + p.price * p.stock_qty, 0);

  // Helper: detect if product is missing a real photo
  const isMissingRealPhoto = (p: Product) => {
    if (!p.images || p.images.length === 0) return true;
    return p.images[0] === '/mpr-brake-disc.png' || p.images[0] === '/mpp-brake-disc.png';
  };

  // Dynamic categories and brands
  const availableCategories = Array.from(
    new Set([
      'Cascos',
      'Accesorios',
      'Repuestos',
      'Llantas',
      'Baterías',
      'Tanques',
      'Farolas',
      'Defensas',
      'Espejos',
      'Carenajes',
      'Frenos',
      'Mantenimiento',
      ...products.map((p) => p.category).filter(Boolean) as string[],
    ])
  ).sort((a, b) => a.localeCompare(b, 'es'));

  const availableBrands = Array.from(
    new Set(
      products
        .map((p) => p.brand?.trim())
        .filter((b): b is string => Boolean(b && b.length > 0))
    )
  ).sort((a, b) => a.localeCompare(b, 'es'));

  // Preset live counts
  const presetCounts = {
    all: products.length,
    critical: products.filter((p) => p.stock_qty < 10).length,
    low_stock: products.filter((p) => p.stock_qty < 25).length,
    offers: products.filter((p) => p.discount_price != null && p.discount_price < p.price).length,
    wholesale: products.filter((p) => p.wholesale_price != null && p.wholesale_price > 0).length,
    missing_photo: products.filter(isMissingRealPhoto).length,
    with_video: products.filter((p) => (p.videos?.length ?? 0) > 0).length,
    inactive: products.filter((p) => !p.is_active).length,
  };

  // Filtered & Sorted Products
  const filteredProducts = products
    .filter((p) => {
      // 1. Search term (SKU, Name, or Brand)
      const term = searchTerm.trim().toLowerCase();
      if (term) {
        const matchName = p.name.toLowerCase().includes(term);
        const matchSku = p.sku.toLowerCase().includes(term);
        const matchBrand = (p.brand || '').toLowerCase().includes(term);
        if (!matchName && !matchSku && !matchBrand) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'All') {
        const normalize = (s: string) =>
          s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if (!p.category || normalize(p.category) !== normalize(selectedCategory)) {
          return false;
        }
      }

      // 3. Brand filter
      if (selectedBrand !== 'All') {
        const brand = p.brand?.trim() || 'MPR';
        if (brand.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }
      }

      // 4. Smart Preset
      if (smartPreset === 'critical' && p.stock_qty >= 10) return false;
      if (smartPreset === 'low_stock' && p.stock_qty >= 25) return false;
      if (smartPreset === 'offers' && (!p.discount_price || p.discount_price >= p.price)) return false;
      if (smartPreset === 'wholesale' && (!p.wholesale_price || p.wholesale_price <= 0)) return false;
      if (smartPreset === 'missing_photo' && !isMissingRealPhoto(p)) return false;
      if (smartPreset === 'with_video' && (!p.videos || p.videos.length === 0)) return false;
      if (smartPreset === 'inactive' && p.is_active) return false;

      // 5. Stock Level Filter
      if (selectedStockLevel === 'zero' && p.stock_qty !== 0) return false;
      if (selectedStockLevel === 'critical' && (p.stock_qty <= 0 || p.stock_qty >= 10)) return false;
      if (selectedStockLevel === 'low' && (p.stock_qty < 10 || p.stock_qty >= 25)) return false;
      if (selectedStockLevel === 'optimal' && p.stock_qty < 25) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'stock_asc') return a.stock_qty - b.stock_qty;
      if (sortBy === 'stock_desc') return b.stock_qty - a.stock_qty;
      if (sortBy === 'price_asc') {
        const pA = a.discount_price ?? a.price;
        const pB = b.discount_price ?? b.price;
        return pA - pB;
      }
      if (sortBy === 'price_desc') {
        const pA = a.discount_price ?? a.price;
        const pB = b.discount_price ?? b.price;
        return pB - pA;
      }
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name, 'es');
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name, 'es');
      if (sortBy === 'discount_desc') {
        const dA = a.discount_price && a.discount_price < a.price ? (a.price - a.discount_price) / a.price : 0;
        const dB = b.discount_price && b.discount_price < b.price ? (b.price - b.discount_price) / b.price : 0;
        return dB - dA;
      }
      return 0;
    });

  const filteredInventoryValue = filteredProducts.reduce(
    (acc, p) => acc + (p.discount_price ?? p.price) * p.stock_qty,
    0
  );

  const isAnyFilterActive =
    searchTerm !== '' ||
    selectedCategory !== 'All' ||
    selectedBrand !== 'All' ||
    smartPreset !== 'all' ||
    selectedStockLevel !== 'all' ||
    sortBy !== 'default';

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSmartPreset('all');
    setSelectedStockLevel('all');
    setSortBy('default');
  };

  const handleExportCSV = () => {
    if (filteredProducts.length === 0) return;

    const headers = [
      'SKU',
      'Nombre',
      'Categoría',
      'Marca',
      'Precio Regular (COP)',
      'Precio Oferta (COP)',
      'Precio Mayorista (COP)',
      'Stock Actual',
      'Nivel Stock',
      'Estado',
      'Peso Bruto (kg)',
      'Fotos Reales',
      'Tiene Video',
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredProducts.map((p) => {
      const stockStatus =
        p.stock_qty === 0
          ? 'Agotado'
          : p.stock_qty < 10
          ? 'Crítico'
          : p.stock_qty < 25
          ? 'Bajo'
          : 'Óptimo';

      return [
        escapeCSV(p.sku),
        escapeCSV(p.name),
        escapeCSV(p.category || 'General'),
        escapeCSV(p.brand || 'MPR'),
        p.price,
        p.discount_price || '',
        p.wholesale_price || '',
        p.stock_qty,
        escapeCSV(stockStatus),
        escapeCSV(p.is_active ? 'Activo' : 'Inactivo'),
        p.gross_weight_kg || '',
        escapeCSV(isMissingRealPhoto(p) ? 'Falta Foto' : `${p.images.length} fotos`),
        escapeCSV((p.videos?.length ?? 0) > 0 ? 'Sí' : 'No'),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventario_mpr_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Order Status Change
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Photo Reorder functions
  const handleMovePhoto = (fromIndex: number, toIndex: number) => {
    if (!editingProduct?.images) return;
    if (toIndex < 0 || toIndex >= editingProduct.images.length) return;
    const updated = [...editingProduct.images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setEditingProduct({ ...editingProduct, images: updated });
  };

  const handleSetCoverPhoto = (index: number) => {
    if (!editingProduct?.images || index === 0) return;
    const updated = [...editingProduct.images];
    const [cover] = updated.splice(index, 1);
    updated.unshift(cover);
    setEditingProduct({ ...editingProduct, images: updated });
  };

  const handleDragStart = (index: number) => {
    setDraggedPhotoIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedPhotoIndex === null || draggedPhotoIndex === dropIndex) return;
    handleMovePhoto(draggedPhotoIndex, dropIndex);
    setDraggedPhotoIndex(null);
  };

  // Multiple photo upload handler
  const handleModalPhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setModalUploading('photo');
    const newUrls: string[] = [];
    const total = files.length;

    for (let i = 0; i < total; i++) {
      setPhotoUploadProgress(`Subiendo foto ${i + 1} de ${total}...`);
      const result = await uploadProductMedia(files[i]);
      if (result) {
        newUrls.push(result.url);
      }
    }

    if (newUrls.length > 0 && editingProduct) {
      const currentImages = editingProduct.images || [];
      setEditingProduct({
        ...editingProduct,
        images: [...currentImages, ...newUrls],
      });
    }

    setModalUploading(null);
    setPhotoUploadProgress('');
    e.target.value = '';
  };

  // Handle Save Product with validation, feedback, and loading state
  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveFeedback(null);

    if (!editingProduct?.name?.trim()) {
      setSaveFeedback({ type: 'error', message: 'Por favor ingresa el nombre del producto.' });
      return;
    }
    if (!editingProduct?.sku?.trim()) {
      setSaveFeedback({ type: 'error', message: 'Por favor ingresa un SKU único.' });
      return;
    }
    if (!editingProduct?.price || Number(editingProduct.price) <= 0) {
      setSaveFeedback({ type: 'error', message: 'Por favor ingresa un precio válido mayor a 0.' });
      return;
    }

    setIsSaving(true);

    const payload: Partial<Product> = {
      ...editingProduct,
      name: editingProduct.name.trim(),
      sku: editingProduct.sku.trim(),
      slug:
        editingProduct.slug ||
        editingProduct.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
      stock_qty: Number(editingProduct.stock_qty || 0),
      price: Number(editingProduct.price || 0),
      discount_price: editingProduct.discount_price ? Number(editingProduct.discount_price) : null,
      wholesale_price: editingProduct.wholesale_price ? Number(editingProduct.wholesale_price) : null,
      is_active: editingProduct.is_active !== false,
      status_text: editingProduct.status_text || 'Disponible',
      images: editingProduct.images && editingProduct.images.length > 0
        ? editingProduct.images
        : ['/mpr-brake-disc.png'],
      videos: editingProduct.videos || [],
    };

    try {
      const res = await saveProduct(payload);
      if (res.success) {
        setSaveFeedback({
          type: 'success',
          message: '¡Producto guardado exitosamente en el catálogo!',
        });
        await loadData();
        setTimeout(() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
          setSaveFeedback(null);
          setIsSaving(false);
        }, 600);
      } else {
        setSaveFeedback({
          type: 'error',
          message: res.error || 'Ocurrió un error al guardar el producto.',
        });
        setIsSaving(false);
      }
    } catch (err: any) {
      setSaveFeedback({
        type: 'error',
        message: err?.message || 'Error inesperado al guardar el producto.',
      });
      setIsSaving(false);
    }
  };

  // Handle Delete / Deactivate
  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Deseas desactivar este producto del catálogo?')) {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Handle Media (Photo / Video) Upload to Supabase Storage in Storage Tab
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadedMedia(null);

    const result = await uploadProductMedia(file);
    setUploadingFile(false);

    if (result) {
      setUploadedMedia(result);
    }
  };

  // Handle Direct Video Upload inside Product Modal
  const handleModalVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setModalUploading('video');
    const result = await uploadProductMedia(file);
    setModalUploading(null);

    if (result && editingProduct) {
      const currentVideos = editingProduct.videos || [];
      setEditingProduct({
        ...editingProduct,
        videos: [...currentVideos, result.url],
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 flex flex-col font-sans">
      
      {/* Top Admin Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <img
              src="/mpr-logo-dark.png"
              alt="MPR"
              className="h-10 sm:h-12 w-auto object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black uppercase text-gray-900 tracking-wider">
                  PANEL DE ADMINISTRACIÓN
                </span>
                <span className="bg-lime text-black font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider shadow-xs">
                  ROL: ADMIN
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                Inventario, Pedidos & Supabase Storage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2 text-gray-600 hover:text-black rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Refrescar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-lime-dark' : ''}`} />
            </button>

            <button
              onClick={onBackToStore}
              className="bg-black hover:bg-gray-800 text-white font-black text-xs uppercase px-4 py-2.5 rounded-lg tracking-wider flex items-center gap-2 transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-lime" />
              <span>Volver a la Tienda</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Ventas Totales */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:border-black/20 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Ventas Totales (COP)
              </span>
              <div className="p-2 rounded-xl bg-lime/20 text-black">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900">
              {formatCurrency(totalSalesCOP)}
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-1">
              {totalOrdersCount} pedidos procesados
            </p>
          </div>

          {/* Card 2: Valor en Inventario */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:border-black/20 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Valor en Inventario
              </span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900">
              {formatCurrency(totalInventoryValue)}
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-1">
              {products.length} productos registrados
            </p>
          </div>

          {/* Card 3: Pedidos Registrados */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:border-black/20 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Órdenes Registradas
              </span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900">
              {totalOrdersCount}
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-1">
              Descuento atómico vía RPC
            </p>
          </div>

          {/* Card 4: Alertas de Stock Bajo */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:border-black/20 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Alertas de Stock
              </span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-600">
              {lowStockItems.length}
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-1">
              Referencias con existencias &lt; 25
            </p>
          </div>

        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
          {[
            { id: 'inventory', label: 'Inventario de Productos', icon: Package },
            { id: 'orders', label: 'Gestión de Pedidos', icon: ShoppingBag },
            { id: 'coupons', label: 'Cupones de Descuento', icon: Tag },
            { id: 'storage', label: 'Supabase Storage (Fotos & Videos)', icon: Upload },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  active
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-lime' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: INVENTARIO DE PRODUCTOS (FILTROS INTELIGENTES) */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">

            {/* Smart Presets Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-lime-dark" />
                  <span className="text-xs font-black uppercase tracking-wider text-gray-900">
                    Filtros Rápidos Inteligentes
                  </span>
                </div>
                {isAnyFilterActive && (
                  <button
                    onClick={handleClearAllFilters}
                    className="text-[11px] font-bold text-gray-500 hover:text-black flex items-center gap-1 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5 text-gray-400" />
                    <span>Limpiar filtros</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'Todos', count: presetCounts.all, badgeClass: 'bg-gray-100 text-gray-800' },
                  { id: 'critical', label: '🚨 Crítico (< 10)', count: presetCounts.critical, badgeClass: 'bg-red-50 text-red-600 border border-red-200' },
                  { id: 'low_stock', label: '⚠️ Bajo Stock (< 25)', count: presetCounts.low_stock, badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200' },
                  { id: 'offers', label: '🏷️ En Oferta', count: presetCounts.offers, badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
                  { id: 'wholesale', label: '💼 Precio Mayorista', count: presetCounts.wholesale, badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200' },
                  { id: 'missing_photo', label: '📷 Sin Foto Real', count: presetCounts.missing_photo, badgeClass: 'bg-gray-100 text-gray-700 border border-gray-200' },
                  { id: 'with_video', label: '🎬 Con Video', count: presetCounts.with_video, badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200' },
                  { id: 'inactive', label: '⛔ Pausados', count: presetCounts.inactive, badgeClass: 'bg-gray-100 text-gray-500 border border-gray-200' },
                ].map((preset) => {
                  const active = smartPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSmartPreset(preset.id as SmartPreset)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${
                        active
                          ? 'bg-black text-white border-black shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span>{preset.label}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                          active
                            ? 'bg-lime text-black'
                            : preset.badgeClass
                        }`}
                      >
                        {preset.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Filters & Action Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por SKU, Nombre o Marca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-8 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition-all font-medium"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Dropdowns Grid */}
                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* Category Filter */}
                  <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                    <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-transparent text-xs text-gray-900 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="All">Categoría: Todas</option>
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Brand Filter */}
                  <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                    <span className="text-[10px] font-black uppercase text-gray-400">Marca:</span>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="bg-transparent text-xs text-gray-900 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="All">Todas</option>
                      {availableBrands.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stock Level Filter */}
                  <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <select
                      value={selectedStockLevel}
                      onChange={(e) => setSelectedStockLevel(e.target.value as StockLevel)}
                      className="bg-transparent text-xs text-gray-900 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="all">Stock: Todos</option>
                      <option value="zero">Agotado (0 unid.)</option>
                      <option value="critical">🚨 Crítico (1-9 unid.)</option>
                      <option value="low">⚠️ Bajo (10-24 unid.)</option>
                      <option value="optimal">✓ Óptimo (25+ unid.)</option>
                    </select>
                  </div>

                  {/* Sort By Filter */}
                  <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="bg-transparent text-xs text-gray-900 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="default">Ordenar: Defecto</option>
                      <option value="stock_asc">Menor Stock (Urgente)</option>
                      <option value="stock_desc">Mayor Stock</option>
                      <option value="price_asc">Menor Precio</option>
                      <option value="price_desc">Mayor Precio</option>
                      <option value="name_asc">Nombre (A - Z)</option>
                      <option value="name_desc">Nombre (Z - A)</option>
                      <option value="discount_desc">Mayor % Descuento</option>
                    </select>
                  </div>

                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleExportCSV}
                    title="Exportar inventario filtrado a archivo CSV / Excel"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-xs uppercase px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all border border-gray-200"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                    <span className="hidden sm:inline">Exportar CSV</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingProduct({
                        sku: `MPR-${Date.now().toString().slice(-4)}`,
                        name: '',
                        price: 150000,
                        wholesale_price: 120000,
                        stock_qty: 20,
                        category: 'Tanques',
                        brand: 'MPR',
                        status_text: 'Disponible',
                        images: ['/categories/tanques.png'],
                        videos: [],
                        is_active: true,
                      });
                      setIsProductModalOpen(true);
                    }}
                    className="bg-black hover:bg-gray-800 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4 text-lime" />
                    <span>Crear Producto</span>
                  </button>
                </div>

              </div>

              {/* Summary Bar & Active Filters */}
              <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-gray-600 font-medium">
                  <span>
                    Mostrando <strong className="text-gray-900 font-black">{filteredProducts.length}</strong> de <strong className="text-gray-900 font-black">{products.length}</strong> referencias
                  </span>
                  <span className="text-gray-300">•</span>
                  <span>
                    Valor inventario filtrado: <strong className="text-gray-900 font-black">{formatCurrency(filteredInventoryValue)}</strong>
                  </span>
                </div>

                {isAnyFilterActive && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase text-gray-400">Activos:</span>
                    {searchTerm && (
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-[11px] px-2 py-0.5 rounded-md font-medium">
                        "{searchTerm}"
                        <button onClick={() => setSearchTerm('')}><X className="w-3 h-3 hover:text-black" /></button>
                      </span>
                    )}
                    {selectedCategory !== 'All' && (
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-[11px] px-2 py-0.5 rounded-md font-medium">
                        Cat: {selectedCategory}
                        <button onClick={() => setSelectedCategory('All')}><X className="w-3 h-3 hover:text-black" /></button>
                      </span>
                    )}
                    {selectedBrand !== 'All' && (
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-[11px] px-2 py-0.5 rounded-md font-medium">
                        Marca: {selectedBrand}
                        <button onClick={() => setSelectedBrand('All')}><X className="w-3 h-3 hover:text-black" /></button>
                      </span>
                    )}
                    {smartPreset !== 'all' && (
                      <span className="inline-flex items-center gap-1 bg-gray-900 text-white text-[11px] px-2 py-0.5 rounded-md font-medium">
                        Preset: {smartPreset}
                        <button onClick={() => setSmartPreset('all')}><X className="w-3 h-3 text-lime hover:text-white" /></button>
                      </span>
                    )}
                    {selectedStockLevel !== 'all' && (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] px-2 py-0.5 rounded-md font-medium">
                        Stock: {selectedStockLevel}
                        <button onClick={() => setSelectedStockLevel('all')}><X className="w-3 h-3 hover:text-black" /></button>
                      </span>
                    )}
                    {sortBy !== 'default' && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 text-[11px] px-2 py-0.5 rounded-md font-medium">
                        Orden: {sortBy}
                        <button onClick={() => setSortBy('default')}><X className="w-3 h-3 hover:text-black" /></button>
                      </span>
                    )}
                    <button
                      onClick={handleClearAllFilters}
                      className="text-[11px] text-red-600 hover:text-red-800 font-bold underline ml-1"
                    >
                      Limpiar todo
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Inventory Table or Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-xs space-y-4">
                <div className="w-14 h-14 bg-gray-50 border border-gray-200 text-gray-400 rounded-2xl flex items-center justify-center mx-auto">
                  <AlertCircle className="w-7 h-7 text-gray-400" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-base font-black text-gray-900">
                    No se encontraron referencias
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Ningún producto coincide con los filtros, presets o término de búsqueda aplicados.
                  </p>
                </div>
                <button
                  onClick={handleClearAllFilters}
                  className="bg-black hover:bg-gray-800 text-white font-black text-xs uppercase px-5 py-2.5 rounded-xl transition-all shadow-xs"
                >
                  Restablecer todos los filtros
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200 font-bold">
                      <tr>
                        <th className="py-3.5 px-4">Producto</th>
                        <th className="py-3.5 px-4">SKU</th>
                        <th className="py-3.5 px-4">Categoría</th>
                        <th className="py-3.5 px-4">Precio (COP)</th>
                        <th className="py-3.5 px-4">Stock</th>
                        <th className="py-3.5 px-4">Packing / Peso</th>
                        <th className="py-3.5 px-4">Estado</th>
                        <th className="py-3.5 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredProducts.map((p) => {
                        const hasDiscount = p.discount_price != null && p.discount_price < p.price;
                        const missingPhoto = isMissingRealPhoto(p);
                        const hasVideos = p.videos && p.videos.length > 0;

                        return (
                          <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                            
                            {/* Image & Name & Tags */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 bg-gray-50 rounded-xl p-1 flex items-center justify-center shrink-0 border border-gray-100">
                                  <img
                                    src={p.images[0]}
                                    alt={p.name}
                                    className="max-h-full max-w-full object-contain"
                                  />
                                  {missingPhoto && (
                                    <span
                                      title="Sin fotografía real subida"
                                      className="absolute -top-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full shadow-xs"
                                    >
                                      <CameraOff className="w-2.5 h-2.5" />
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <span className="font-bold text-gray-900 block truncate max-w-[220px]">
                                    {p.name}
                                  </span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] text-gray-500 font-medium">
                                      {p.brand || 'MPR'}
                                    </span>
                                    {missingPhoto && (
                                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                        Falta foto
                                      </span>
                                    )}
                                    {hasVideos && (
                                      <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200 flex items-center gap-0.5">
                                        <Video className="w-2.5 h-2.5" /> Video
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* SKU */}
                            <td className="py-3 px-4 font-mono font-bold text-gray-700">
                              {p.sku}
                            </td>

                            {/* Category */}
                            <td className="py-3 px-4 text-gray-700 font-medium">
                              <span className="bg-gray-100 px-2 py-0.5 rounded-md text-[11px] font-medium text-gray-800">
                                {p.category || 'General'}
                              </span>
                            </td>

                            {/* Price & Discounts & Wholesale */}
                            <td className="py-3 px-4">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-black text-gray-900 text-xs">
                                    {formatCurrency(p.discount_price ?? p.price)}
                                  </span>
                                  {hasDiscount && (
                                    <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-1.5 py-0.2 rounded border border-emerald-200">
                                      -{Math.round(((p.price - p.discount_price!) / p.price) * 100)}%
                                    </span>
                                  )}
                                </div>
                                {hasDiscount && (
                                  <span className="text-[10px] text-gray-400 line-through block font-medium">
                                    {formatCurrency(p.price)}
                                  </span>
                                )}
                                {p.wholesale_price != null && p.wholesale_price > 0 && (
                                  <span className="text-[10px] text-blue-600 block font-bold">
                                    Mayorista: {formatCurrency(p.wholesale_price)}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Stock with intelligent health badges */}
                            <td className="py-3 px-4">
                              {p.stock_qty === 0 ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-300">
                                  Agotado (0)
                                </span>
                              ) : p.stock_qty < 10 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-red-700 border border-red-200">
                                  🚨 Crítico: {p.stock_qty}
                                </span>
                              ) : p.stock_qty < 25 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                                  ⚠️ Bajo: {p.stock_qty}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-lime/20 text-gray-900 border border-lime/40">
                                  ✓ Óptimo: {p.stock_qty}
                                </span>
                              )}
                            </td>

                            {/* Logistics specs */}
                            <td className="py-3 px-4 text-[11px] text-gray-500 font-medium">
                              {p.gross_weight_kg ? `${p.gross_weight_kg} kg` : '-'}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                  p.is_active
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {p.is_active ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setIsProductModalOpen(true);
                                  }}
                                  className="p-1.5 text-gray-500 hover:text-black rounded-lg hover:bg-gray-100 transition-colors"
                                  title="Editar producto"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
                                  title="Eliminar / Pausar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: GESTIÓN DE PEDIDOS */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200 font-bold">
                    <tr>
                      <th className="py-3.5 px-4">Consecutivo</th>
                      <th className="py-3.5 px-4">Cliente & Destino</th>
                      <th className="py-3.5 px-4">Fecha</th>
                      <th className="py-3.5 px-4">Total</th>
                      <th className="py-3.5 px-4">Pago</th>
                      <th className="py-3.5 px-4">Estado del Pedido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                        
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                          {ord.order_number}
                        </td>

                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-gray-900 block">
                              {ord.shipping_address?.full_name || 'Cliente MPR'}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {ord.shipping_address?.city || 'Colombia'} • {ord.shipping_address?.address || ''}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                          {new Date(ord.created_at).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        <td className="py-3.5 px-4 font-black text-gray-900">
                          {formatCurrency(ord.total_amount)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              ord.payment_status === 'paid_in_full'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {ord.payment_status === 'paid_in_full' ? 'Pagado' : 'Pendiente'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={ord.status}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white font-medium transition-all"
                          >
                            <option value="pending">⏳ Pendiente</option>
                            <option value="processing">⚙️ En Proceso</option>
                            <option value="shipped">🚚 Enviado</option>
                            <option value="delivered">✅ Entregado</option>
                            <option value="cancelled">❌ Cancelado</option>
                          </select>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CUPONES DE DESCUENTO */}
        {/* ========================================================================= */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            
            {/* Create Coupon Form */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-black" /> Crear Nuevo Cupón Promocional
              </h3>

              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Código (ej. MPR15)"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 font-mono font-bold focus:outline-none focus:border-black focus:bg-white uppercase"
                />

                <input
                  type="number"
                  placeholder="% Descuento"
                  value={newCouponValue}
                  onChange={(e) => setNewCouponValue(Number(e.target.value))}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 w-28 focus:outline-none focus:border-black focus:bg-white"
                />

                <button
                  onClick={() => {
                    if (!newCouponCode) return;
                    setCoupons([
                      ...coupons,
                      {
                        code: newCouponCode,
                        discount_type: 'percentage',
                        discount_value: newCouponValue,
                        current_uses: 0,
                        max_uses: 1000,
                        is_active: true,
                      },
                    ]);
                    setNewCouponCode('');
                  }}
                  className="bg-black hover:bg-gray-800 text-white font-black text-xs uppercase px-5 py-2 rounded-lg transition-colors shadow-xs"
                >
                  Agregar Cupón
                </button>
              </div>
            </div>

            {/* Coupons List */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Código</th>
                    <th className="py-3.5 px-4">Tipo</th>
                    <th className="py-3.5 px-4">Descuento</th>
                    <th className="py-3.5 px-4">Usos Realizados</th>
                    <th className="py-3.5 px-4">Límite</th>
                    <th className="py-3.5 px-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.map((c) => (
                    <tr key={c.code} className="hover:bg-gray-50/80">
                      <td className="py-3.5 px-4 font-mono font-black text-gray-900">
                        {c.code}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 uppercase font-medium">
                        {c.discount_type}
                      </td>
                      <td className="py-3.5 px-4 font-black text-gray-900">
                        {c.discount_value}%
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium">
                        {c.current_uses}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500">
                        {c.max_uses}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase">
                          Activo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SUPABASE STORAGE UPLOADER (FOTOS Y VIDEOS) */}
        {/* ========================================================================= */}
        {activeTab === 'storage' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-2xl shadow-xs">
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4 text-black" /> Subida Directa a Supabase Storage ("products")
              </h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Selecciona una foto o video de producto desde tu computador. Se subirá al bucket público <code className="text-gray-900 font-mono font-bold bg-gray-100 px-1 py-0.5 rounded">products/images/</code> o <code className="text-gray-900 font-mono font-bold bg-gray-100 px-1 py-0.5 rounded">products/videos/</code> de Supabase y te generará la URL directa lista para asociar al producto.
              </p>

              <div className="border-2 border-dashed border-gray-200 hover:border-black rounded-2xl p-8 text-center bg-gray-50/60 transition-colors">
                <div className="flex justify-center items-center gap-3 mb-3 text-gray-400">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xl font-light">/</span>
                  <Video className="w-8 h-8" />
                </div>
                <label className="cursor-pointer">
                  <span className="bg-black hover:bg-gray-800 text-white font-black text-xs uppercase px-5 py-2.5 rounded-xl inline-block transition-all shadow-sm mb-2">
                    {uploadingFile ? 'Subiendo archivo multimedia...' : 'Seleccionar Foto o Video'}
                  </span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-gray-500 mt-2 font-medium">
                  Formatos soportados: JPG, PNG, WEBP, MP4, WEBM, MOV (hasta 50MB)
                </p>
              </div>

              {/* Upload Result */}
              {uploadedMedia && (
                <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-lime/60 space-y-3">
                  <div className="flex items-center gap-3">
                    {uploadedMedia.type === 'video' ? (
                      <div className="w-20 h-20 bg-black rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-gray-200">
                        <video
                          src={uploadedMedia.url}
                          className="w-full h-full object-cover"
                          controls
                        />
                      </div>
                    ) : (
                      <img
                        src={uploadedMedia.url}
                        alt="Uploaded preview"
                        className="w-20 h-20 object-contain rounded-lg bg-white p-1 shrink-0 border border-gray-200"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-900 block">
                          ¡Archivo subido exitosamente a Supabase Storage!
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          uploadedMedia.type === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-lime/30 text-gray-900'
                        }`}>
                          {uploadedMedia.type === 'video' ? 'VIDEO' : 'FOTO'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-mono truncate">
                        {uploadedMedia.url}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(uploadedMedia.url);
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 2000);
                    }}
                    className="w-full bg-black hover:bg-gray-800 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-lime" />
                        <span>¡URL copiada al portapapeles!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar URL para el Producto</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL: CREAR / EDITAR PRODUCTO */}
      {/* ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-gray-900 my-8 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <h3 className="text-sm font-black uppercase text-gray-900 tracking-wider">
                {editingProduct?.id ? 'Editar Producto' : 'Crear Nuevo Producto en Catálogo'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-bold mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct?.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-black focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    SKU Único *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct?.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 font-mono font-bold focus:outline-none focus:border-black focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Precio Normal (COP) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct?.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-black focus:bg-white font-black"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Precio Por Mayor (COP)
                  </label>
                  <input
                    type="number"
                    value={editingProduct?.wholesale_price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, wholesale_price: Number(e.target.value) || null })}
                    placeholder="Mayorista"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-black focus:bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Precio Oferta (COP)
                  </label>
                  <input
                    type="number"
                    value={editingProduct?.discount_price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, discount_price: Number(e.target.value) || null })}
                    placeholder="Opcional"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-black focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Stock (Unid) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct?.stock_qty || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_qty: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-black focus:bg-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Categoría *
                  </label>
                  <select
                    value={editingProduct?.category || 'Cascos'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-gray-900 focus:outline-none focus:border-black focus:bg-white font-medium"
                  >
                    <option value="Cascos">Cascos</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Repuestos">Repuestos</option>
                    <option value="Llantas">Llantas</option>
                    <option value="Baterías">Baterías</option>
                    <option value="Tanques">Tanques</option>
                    <option value="Farolas">Farolas</option>
                    <option value="Defensas">Defensas</option>
                    <option value="Espejos">Espejos</option>
                    <option value="Carenajes">Carenajes</option>
                    <option value="Frenos">Frenos</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Marca / Fabricante
                  </label>
                  <input
                    type="text"
                    value={editingProduct?.brand || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    placeholder="Duvox, Growsun, MPR..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-black focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Estado en Tienda
                  </label>
                  <select
                    value={editingProduct?.status_text || 'Disponible'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status_text: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-gray-900 focus:outline-none focus:border-black focus:bg-white font-medium"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Por agotarse">Por agotarse</option>
                    <option value="Bajo pedido">Bajo pedido</option>
                  </select>
                </div>
              </div>

              {/* SECCIÓN 1: FOTOS DEL PRODUCTO (SUPABASE STORAGE & GALERÍA) */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-gray-900 font-bold flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-black" /> Fotografías del Producto ({editingProduct?.images?.length || 0})
                    </span>
                    <span className="text-[10px] text-gray-500 block">
                      Sube una o varias fotos. Organiza el orden: la <strong>Foto #1</strong> es la portada.
                    </span>
                  </div>

                  <label className="cursor-pointer bg-black hover:bg-gray-800 text-white font-extrabold text-[11px] uppercase px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-xs shrink-0">
                    <Upload className="w-3.5 h-3.5 text-lime" />
                    <span>{photoUploadProgress || (modalUploading === 'photo' ? 'Subiendo...' : 'Subir Fotos (Múltiples)')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleModalPhotosUpload}
                      className="hidden"
                      disabled={modalUploading !== null}
                    />
                  </label>
                </div>

                {/* Input manual URL foto */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="O pegar URL de imagen directa (https://...)"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newPhotoUrl.trim()) return;
                      const currentImages = editingProduct?.images || [];
                      setEditingProduct({
                        ...editingProduct,
                        images: [...currentImages, newPhotoUrl.trim()],
                      });
                      setNewPhotoUrl('');
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shrink-0"
                  >
                    Añadir URL
                  </button>
                </div>

                {/* Lista interactiva de fotos organizables */}
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {(editingProduct?.images || []).map((imgUrl, idx) => {
                      const isCover = idx === 0;
                      return (
                        <div
                          key={idx}
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(idx)}
                          className={`relative group bg-white rounded-xl p-2 border transition-all cursor-move flex flex-col justify-between shadow-xs ${
                            isCover
                              ? 'border-lime ring-2 ring-lime/30 bg-lime/5'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                          title="Arrastra para cambiar el orden de las fotos"
                        >
                          {/* Top Badges */}
                          <div className="flex items-center justify-between mb-1.5 z-10">
                            {isCover ? (
                              <span className="bg-lime text-black font-black text-[9px] px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1 uppercase">
                                <Star className="w-2.5 h-2.5 fill-black" /> Portada
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-600 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded border border-gray-200">
                                #{idx + 1}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                const updated = (editingProduct?.images || []).filter((_, i) => i !== idx);
                                setEditingProduct({ ...editingProduct, images: updated });
                              }}
                              className="w-5 h-5 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white rounded-full flex items-center justify-center text-[10px] transition-colors"
                              title="Eliminar foto"
                            >
                              ✕
                            </button>
                          </div>

                          {/* Image preview */}
                          <div className="w-full h-24 flex items-center justify-center p-1 bg-gray-50 rounded-lg overflow-hidden mb-2">
                            <img
                              src={imgUrl}
                              alt={`Foto ${idx + 1}`}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>

                          {/* Reordering Controls */}
                          <div className="flex items-center justify-between gap-1 pt-1 border-t border-gray-100">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMovePhoto(idx, idx - 1)}
                              className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100 text-gray-700 transition-colors"
                              title="Mover hacia la izquierda"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>

                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverPhoto(idx)}
                                className="flex-1 text-[9px] font-extrabold uppercase py-0.5 px-1 rounded bg-gray-100 hover:bg-lime hover:text-black text-gray-700 transition-colors flex items-center justify-center gap-1"
                                title="Fijar como portada principal"
                              >
                                <Star className="w-2.5 h-2.5" /> Portada
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={idx === (editingProduct?.images?.length || 0) - 1}
                              onClick={() => handleMovePhoto(idx, idx + 1)}
                              className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100 text-gray-700 transition-colors"
                              title="Mover hacia la derecha"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {(!editingProduct?.images || editingProduct.images.length === 0) ? (
                    <div className="text-center py-4 bg-white rounded-lg border border-dashed border-gray-200 text-gray-400 text-[11px]">
                      No hay fotos asignadas aún. Sube fotos desde tu equipo o añade una URL.
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-500 font-medium">
                      💡 <strong>Organización:</strong> Usa las flechas (← / →) o el botón "Portada" para ordenar las fotos. La primera foto (#1) será la que se verá en la tienda.
                    </p>
                  )}
                </div>
              </div>

              {/* SECCIÓN 2: VIDEOS DEL PRODUCTO (SUPABASE STORAGE) */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-bold flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-600" /> Videos del Producto (Supabase Storage)
                  </span>

                  <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[11px] uppercase px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{modalUploading === 'video' ? 'Subiendo...' : 'Subir Video'}</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleModalVideoUpload}
                      className="hidden"
                      disabled={modalUploading !== null}
                    />
                  </label>
                </div>

                {/* Input manual URL video */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="O pegar URL de video (https://... mp4, webm o link directo)"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newVideoUrl.trim()) return;
                      const currentVideos = editingProduct?.videos || [];
                      setEditingProduct({
                        ...editingProduct,
                        videos: [...currentVideos, newVideoUrl.trim()],
                      });
                      setNewVideoUrl('');
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors"
                  >
                    Añadir
                  </button>
                </div>

                {/* Lista de videos adjuntos */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {(editingProduct?.videos || []).map((videoUrl, idx) => (
                    <div
                      key={idx}
                      className="relative group w-24 h-16 bg-black rounded-xl border border-purple-300 overflow-hidden flex items-center justify-center shadow-xs"
                    >
                      <video src={videoUrl} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Play className="w-4 h-4 text-white fill-white/80" />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editingProduct?.videos || []).filter((_, i) => i !== idx);
                          setEditingProduct({ ...editingProduct, videos: updated });
                        }}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-90 group-hover:opacity-100 transition-opacity z-10"
                        title="Eliminar video"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {(!editingProduct?.videos || editingProduct.videos.length === 0) && (
                    <span className="text-[11px] text-gray-400 italic">No hay videos asignados aún (opcional)</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Descripción Comercial
                </label>
                <textarea
                  rows={3}
                  value={editingProduct?.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-black focus:bg-white font-medium"
                />
              </div>

              {/* Logistics / Packing Specs */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <span className="text-gray-900 font-bold block">
                  Especificaciones de Empaque & Importación
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-500 font-medium">Peso Bruto (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct?.gross_weight_kg || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, gross_weight_kg: Number(e.target.value) })}
                      className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 font-medium">Largo x Ancho (mm)</label>
                    <input
                      type="text"
                      placeholder="380x290"
                      onChange={(e) => {
                        const parts = e.target.value.split('x');
                        setEditingProduct({
                          ...editingProduct,
                          length_mm: Number(parts[0]) || 0,
                          width_mm: Number(parts[1]) || 0,
                        });
                      }}
                      className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 font-medium">Detalles Empaque</label>
                    <input
                      type="text"
                      value={editingProduct?.package_details || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, package_details: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Feedback Alert Banner */}
              {saveFeedback && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold ${
                    saveFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  {saveFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{saveFeedback.message}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setIsProductModalOpen(false);
                    setSaveFeedback(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-lg bg-black hover:bg-gray-800 text-white font-black uppercase tracking-wider shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 text-lime animate-spin" />
                      <span>Guardando en Catálogo...</span>
                    </>
                  ) : (
                    <span>Guardar en Catálogo</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

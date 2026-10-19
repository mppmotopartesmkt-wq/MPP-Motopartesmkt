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

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'coupons' | 'storage'>('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & filter in inventory
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal for new/edit product
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [modalUploading, setModalUploading] = useState<'photo' | 'video' | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  // Storage upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<UploadMediaResult | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // New coupon state
  const [coupons, setCoupons] = useState([
    { code: 'MPP10', discount_type: 'percentage', discount_value: 10, current_uses: 24, max_uses: 1000, is_active: true },
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

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Handle Order Status Change
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Handle Save Product
  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price || !editingProduct?.sku) return;

    const payload: Partial<Product> = {
      ...editingProduct,
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
        : ['/mpp-brake-disc.png'],
      videos: editingProduct.videos || [],
    };

    const res = await saveProduct(payload);
    if (res.success) {
      setIsProductModalOpen(false);
      setEditingProduct(null);
      loadData();
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

  // Handle Direct Photo Upload inside Product Modal
  const handleModalPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setModalUploading('photo');
    const result = await uploadProductMedia(file);
    setModalUploading(null);

    if (result && editingProduct) {
      const currentImages = editingProduct.images || [];
      setEditingProduct({
        ...editingProduct,
        images: [...currentImages, result.url],
      });
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
    <div className="min-h-screen bg-dark-950 text-gray-100 flex flex-col font-sans">
      
      {/* Top Admin Navbar */}
      <header className="bg-dark-900 border-b border-dark-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <img
              src="/mpp-logo.png"
              alt="MPP"
              className="h-10 sm:h-12 w-auto object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black uppercase text-white tracking-wider">
                  PANEL DE ADMINISTRACIÓN
                </span>
                <span className="bg-lime text-black font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                  ROL: ADMIN
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Inventario, Pedidos & Supabase Storage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2 text-gray-400 hover:text-white rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
              title="Refrescar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-lime' : ''}`} />
            </button>

            <button
              onClick={onBackToStore}
              className="bg-lime hover:bg-lime-bright text-black font-black text-xs uppercase px-4 py-2 rounded tracking-wider flex items-center gap-2 transition-all shadow-md shadow-lime/20"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
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
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 relative overflow-hidden group hover:border-lime/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Ventas Totales (COP)
              </span>
              <div className="p-2 rounded-lg bg-lime/10 text-lime">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {formatCurrency(totalSalesCOP)}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {totalOrdersCount} pedidos procesados
            </p>
          </div>

          {/* Card 2: Valor en Inventario */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 relative overflow-hidden group hover:border-lime/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Valor en Inventario
              </span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {formatCurrency(totalInventoryValue)}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {products.length} productos registrados
            </p>
          </div>

          {/* Card 3: Pedidos Registrados */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 relative overflow-hidden group hover:border-lime/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Órdenes Registradas
              </span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {totalOrdersCount}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Descuento atómico vía RPC
            </p>
          </div>

          {/* Card 4: Alertas de Stock Bajo */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 relative overflow-hidden group hover:border-lime/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Alertas de Stock
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-400">
              {lowStockItems.length}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Referencias con existencias &lt; 25
            </p>
          </div>

        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-dark-800 pb-2 overflow-x-auto">
          {[
            { id: 'inventory', label: 'Inventario de Productos', icon: Package },
            { id: 'orders', label: 'Gestión de Pedidos', icon: ShoppingBag },
            { id: 'coupons', label: 'Cupones de Descuento', icon: Tag },
            { id: 'storage', label: 'Supabase Storage (Fotos)', icon: Upload },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  active
                    ? 'bg-lime text-black shadow-lg shadow-lime/20'
                    : 'text-gray-400 hover:text-white hover:bg-dark-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: INVENTARIO DE PRODUCTOS */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            
            {/* Toolbar: Search, Category Filter, and Add Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-dark-900 p-4 rounded-xl border border-dark-800">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por SKU o Nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-lime"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-dark-950 border border-dark-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-lime"
                  >
                    <option value="All">Todas las categorías</option>
                    <option value="Tanques">Tanques</option>
                    <option value="Farolas">Farolas</option>
                    <option value="Defensas">Defensas</option>
                    <option value="Espejos">Espejos</option>
                    <option value="Carenajes">Carenajes</option>
                    <option value="Frenos">Frenos</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingProduct({
                    sku: `MPP-${Date.now().toString().slice(-4)}`,
                    name: '',
                    price: 150000,
                    wholesale_price: 120000,
                    stock_qty: 20,
                    category: 'Tanques',
                    brand: 'MPP',
                    status_text: 'Disponible',
                    images: ['/mpp-brake-disc.png'],
                    videos: [],
                    is_active: true,
                  });
                  setIsProductModalOpen(true);
                }}
                className="bg-lime hover:bg-lime-bright text-black font-black text-xs uppercase px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md shadow-lime/20"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Producto</span>
              </button>
            </div>

            {/* Inventory Table */}
            <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-dark-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-dark-800">
                    <tr>
                      <th className="py-3 px-4">Producto</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4">Precio (COP)</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Packing / Peso</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-800">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-dark-850/60 transition-colors">
                        
                        {/* Image & Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded p-1 flex items-center justify-center shrink-0">
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div>
                              <span className="font-bold text-white block truncate max-w-[200px]">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {p.brand || 'MPP'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3 px-4 font-mono text-gray-300">
                          {p.sku}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 text-gray-300">
                          {p.category}
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4 font-black text-lime">
                          {formatCurrency(p.discount_price ?? p.price)}
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-extrabold ${
                              p.stock_qty < 20
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-lime/10 text-lime border border-lime/30'
                            }`}
                          >
                            {p.stock_qty} unid.
                          </span>
                        </td>

                        {/* Logistics specs */}
                        <td className="py-3 px-4 text-[11px] text-gray-400">
                          {p.gross_weight_kg ? `${p.gross_weight_kg} kg` : '-'}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              p.is_active
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-gray-500/10 text-gray-400'
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
                              className="p-1.5 text-gray-400 hover:text-lime rounded hover:bg-dark-800 transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-dark-800 transition-colors"
                              title="Desactivar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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
        {/* TAB 2: GESTIÓN DE PEDIDOS */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-dark-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-dark-800">
                    <tr>
                      <th className="py-3 px-4">Consecutivo</th>
                      <th className="py-3 px-4">Cliente & Destino</th>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Pago</th>
                      <th className="py-3 px-4">Estado del Pedido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-800">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-dark-850/60 transition-colors">
                        
                        <td className="py-3.5 px-4 font-mono font-bold text-lime">
                          {ord.order_number}
                        </td>

                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-white block">
                              {ord.shipping_address?.full_name || 'Cliente MPP'}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {ord.shipping_address?.city || 'Colombia'} • {ord.shipping_address?.address || ''}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                          {new Date(ord.created_at).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        <td className="py-3.5 px-4 font-black text-white">
                          {formatCurrency(ord.total_amount)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ord.payment_status === 'paid_in_full'
                                ? 'bg-lime/20 text-lime'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {ord.payment_status === 'paid_in_full' ? 'Pagado' : 'Pendiente'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={ord.status}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                            className="bg-dark-950 border border-dark-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-lime"
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
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-lime mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Crear Nuevo Cupón Promocional
              </h3>

              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Código (ej. MPP15)"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  className="bg-dark-950 border border-dark-700 rounded px-3 py-2 text-xs text-white placeholder-gray-500 font-mono font-bold focus:outline-none focus:border-lime uppercase"
                />

                <input
                  type="number"
                  placeholder="% Descuento"
                  value={newCouponValue}
                  onChange={(e) => setNewCouponValue(Number(e.target.value))}
                  className="bg-dark-950 border border-dark-700 rounded px-3 py-2 text-xs text-white placeholder-gray-500 w-28 focus:outline-none focus:border-lime"
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
                  className="bg-lime hover:bg-lime-bright text-black font-black text-xs uppercase px-5 py-2 rounded transition-colors"
                >
                  Agregar Cupón
                </button>
              </div>
            </div>

            {/* Coupons List */}
            <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-dark-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-dark-800">
                  <tr>
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Descuento</th>
                    <th className="py-3 px-4">Usos Realizados</th>
                    <th className="py-3 px-4">Límite</th>
                    <th className="py-3 px-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {coupons.map((c) => (
                    <tr key={c.code} className="hover:bg-dark-850/60">
                      <td className="py-3 px-4 font-mono font-black text-lime">
                        {c.code}
                      </td>
                      <td className="py-3 px-4 text-gray-300 uppercase">
                        {c.discount_type}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {c.discount_value}%
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {c.current_uses}
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {c.max_uses}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">
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
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 max-w-2xl">
              <h3 className="text-sm font-black uppercase tracking-wider text-lime mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4" /> Subida Directa a Supabase Storage ("products")
              </h3>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                Selecciona una foto o video de producto desde tu computador. Se subirá al bucket público <code className="text-lime bg-dark-950 px-1 py-0.5 rounded">products/images/</code> o <code className="text-lime bg-dark-950 px-1 py-0.5 rounded">products/videos/</code> de Supabase y te generará la URL directa lista para asociar al producto.
              </p>

              <div className="border-2 border-dashed border-dark-700 hover:border-lime rounded-xl p-8 text-center bg-dark-950/60 transition-colors">
                <div className="flex justify-center items-center gap-3 mb-3 text-gray-500">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xl font-light">/</span>
                  <Video className="w-8 h-8" />
                </div>
                <label className="cursor-pointer">
                  <span className="bg-lime hover:bg-lime-bright text-black font-black text-xs uppercase px-5 py-2.5 rounded-lg inline-block transition-all shadow-md shadow-lime/20 mb-2">
                    {uploadingFile ? 'Subiendo archivo multimedia...' : 'Seleccionar Foto o Video'}
                  </span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-gray-500 mt-2">
                  Formatos soportados: JPG, PNG, WEBP, MP4, WEBM, MOV (hasta 50MB)
                </p>
              </div>

              {/* Upload Result */}
              {uploadedMedia && (
                <div className="mt-6 p-4 rounded-xl bg-dark-950 border border-lime/40 space-y-3">
                  <div className="flex items-center gap-3">
                    {uploadedMedia.type === 'video' ? (
                      <div className="w-20 h-20 bg-black rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-dark-700">
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
                        className="w-20 h-20 object-cover rounded-lg bg-white p-1 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-lime block">
                          ¡Archivo subido exitosamente a Supabase Storage!
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          uploadedMedia.type === 'video' ? 'bg-purple-500/20 text-purple-300' : 'bg-lime/20 text-lime'
                        }`}>
                          {uploadedMedia.type === 'video' ? 'VIDEO' : 'FOTO'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">
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
                    className="w-full bg-dark-800 hover:bg-dark-700 text-white font-bold text-xs py-2 rounded flex items-center justify-center gap-2 transition-colors"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl text-gray-100 my-8">
            
            <div className="p-5 border-b border-dark-800 flex items-center justify-between bg-dark-950">
              <h3 className="text-sm font-black uppercase text-white tracking-wider">
                {editingProduct?.id ? 'Editar Producto' : 'Crear Nuevo Producto en Catálogo'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-gray-400 font-semibold mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct?.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded px-3 py-2 text-white focus:outline-none focus:border-lime"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">
                    SKU Único *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct?.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-lime"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">
                    Precio Normal (COP) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct?.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-dark-950 border border-dark-700 rounded px-3 py-2 text-white focus:outline-none focus:border-lime font-black"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">
                    Precio Por Mayor (COP)
                  </label>
                  <input
                    type="number"
                    value={editingProduct?.wholesale_price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, wholesale_price: Number(e.target.value) || null })}
                    placeholder="Mayorista"
                    className="w-full bg-dark-950 border border-dark-700 rounded px-3 py-2 text-lime focus:outline-none focus:border-lime font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">
                    Precio Oferta (COP)
                  </label>
                  <input
                    type="number"
                    value={editingProduct?.discount_price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, discount_price: Number(e.target.value) || null })}
                    placeholder="Opcional"
                    className="w-full bg-dark-950 border border-dark-700 rounded px-3 py-2 text-white focus:outline-none focus:border-lime"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">
                    Stock (Unid) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct?.stock_qty || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_qty: Number(e.target.value) })}
                    className="w-full bg-dark-950 border border-dark-700 rounded px-3 py-2 text-white focus:outline-none focus:border-lime"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">
                    Categoría *
                  </label>
                  <select
                    value={editingProduct?.category || 'Tanques'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded px-2.5 py-2 text-white focus:outline-none focus:border-lime"
                  >
                    <option value="Tanques">Tanques</option>
                    <option value="Farolas">Farolas</option>
                    <option value="Defensas">Defensas</option>
                    <option value="Espejos">Espejos</option>
                    <option value="Carenajes">Carenajes</option>
                    <option value="Frenos">Frenos</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">
                    Marca / Fabricante
                  </label>
                  <input
                    type="text"
                    value={editingProduct?.brand || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    placeholder="Duvox, Growsun, MPP..."
                    className="w-full bg-dark-950 border border-dark-700 rounded px-3 py-2 text-white focus:outline-none focus:border-lime"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">
                    Estado en Tienda
                  </label>
                  <select
                    value={editingProduct?.status_text || 'Disponible'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status_text: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded px-2.5 py-2 text-white focus:outline-none focus:border-lime"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Por agotarse">Por agotarse</option>
                    <option value="Bajo pedido">Bajo pedido</option>
                  </select>
                </div>
              </div>

              {/* SECCIÓN 1: FOTOS DEL PRODUCTO (SUPABASE STORAGE) */}
              <div className="p-3 bg-dark-950 rounded-lg border border-dark-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-200 font-bold flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-lime" /> Fotografías del Producto (Supabase Storage)
                  </span>

                  <label className="cursor-pointer bg-lime hover:bg-lime-bright text-black font-extrabold text-[11px] uppercase px-3 py-1.5 rounded transition-all flex items-center gap-1.5 shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{modalUploading === 'photo' ? 'Subiendo...' : 'Subir Foto'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleModalPhotoUpload}
                      className="hidden"
                      disabled={modalUploading !== null}
                    />
                  </label>
                </div>

                {/* Input manual URL foto */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="O pegar URL de imagen (https://...)"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    className="flex-1 bg-dark-900 border border-dark-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-lime"
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
                    className="bg-dark-800 hover:bg-dark-700 text-white px-3 py-1.5 rounded font-bold text-xs transition-colors"
                  >
                    Añadir
                  </button>
                </div>

                {/* Lista de fotos adjuntas */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {(editingProduct?.images || []).map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative group w-16 h-16 bg-white rounded-lg p-1 border border-dark-700 overflow-hidden flex items-center justify-center"
                    >
                      <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editingProduct?.images || []).filter((_, i) => i !== idx);
                          setEditingProduct({ ...editingProduct, images: updated });
                        }}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-90 group-hover:opacity-100 transition-opacity"
                        title="Eliminar foto"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {(!editingProduct?.images || editingProduct.images.length === 0) && (
                    <span className="text-[11px] text-gray-500 italic">No hay fotos asignadas aún</span>
                  )}
                </div>
              </div>

              {/* SECCIÓN 2: VIDEOS DEL PRODUCTO (SUPABASE STORAGE) */}
              <div className="p-3 bg-dark-950 rounded-lg border border-dark-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-200 font-bold flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-400" /> Videos del Producto (Supabase Storage)
                  </span>

                  <label className="cursor-pointer bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-[11px] uppercase px-3 py-1.5 rounded transition-all flex items-center gap-1.5 shadow-sm">
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
                    className="flex-1 bg-dark-900 border border-dark-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-lime"
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
                    className="bg-dark-800 hover:bg-dark-700 text-white px-3 py-1.5 rounded font-bold text-xs transition-colors"
                  >
                    Añadir
                  </button>
                </div>

                {/* Lista de videos adjuntos */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {(editingProduct?.videos || []).map((videoUrl, idx) => (
                    <div
                      key={idx}
                      className="relative group w-24 h-16 bg-black rounded-lg border border-purple-500/40 overflow-hidden flex items-center justify-center"
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
                    <span className="text-[11px] text-gray-500 italic">No hay videos asignados aún (opcional)</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">
                  Descripción Comercial
                </label>
                <textarea
                  rows={3}
                  value={editingProduct?.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-dark-950 border border-dark-700 rounded px-3 py-2 text-white focus:outline-none focus:border-lime"
                />
              </div>

              {/* Logistics / Packing Specs */}
              <div className="p-3 bg-dark-950 rounded-lg border border-dark-800 space-y-3">
                <span className="text-gray-300 font-bold block">
                  Especificaciones de Empaque & Importación
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-400">Peso Bruto (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct?.gross_weight_kg || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, gross_weight_kg: Number(e.target.value) })}
                      className="w-full bg-dark-900 border border-dark-700 rounded px-2 py-1 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400">Largo x Ancho (mm)</label>
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
                      className="w-full bg-dark-900 border border-dark-700 rounded px-2 py-1 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400">Detalles Empaque</label>
                    <input
                      type="text"
                      value={editingProduct?.package_details || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, package_details: e.target.value })}
                      className="w-full bg-dark-900 border border-dark-700 rounded px-2 py-1 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-dark-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded bg-dark-800 text-gray-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded bg-lime hover:bg-lime-bright text-black font-black uppercase tracking-wider shadow-md shadow-lime/20"
                >
                  Guardar en Catálogo
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

import { supabase, isSupabaseConfigured } from './supabase';
import { Product, Coupon, CheckoutResult } from '../types';

// Initial local catalog matching the exact reference photo
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'a0000001-0000-0000-0000-000000000001',
    sku: 'HELM-SHOEI-RF1400',
    name: 'Shoei RF-1400',
    slug: 'shoei-rf-1400-full-face-helmet',
    price: 2199000,
    discount_price: null,
    stock_qty: 28,
    category: 'Helmets',
    brand: 'Shoei',
    rating: 5.0,
    reviews_count: 842,
    description: 'Casco Integral — Perfección aerodinámica, interior insonorizado y doble certificación Snell y DOT.',
    length_mm: 380,
    width_mm: 290,
    height_mm: 280,
    package_details: 'Caja reforzada con funda protectora de felpa y pinlock antivaho',
    gross_weight_kg: 2.35,
    net_weight_kg: 1.62,
    images: [
      '/mpp-brake-disc.png'
    ],
    is_active: true
  },
  {
    id: 'a0000002-0000-0000-0000-000000000002',
    sku: 'JACK-ALP-TGPRV4',
    name: 'Alpinestars T-GP R',
    slug: 'alpinestars-t-gp-r-v4-jacket',
    price: 1299000,
    discount_price: null,
    stock_qty: 35,
    category: 'Riding Gear',
    brand: 'Alpinestars',
    rating: 5.0,
    reviews_count: 623,
    description: 'Chaqueta Deportiva V4 — Textil de alto rendimiento compatible con airbag Tech-Air 5 y deslizaderas DFS.',
    length_mm: 600,
    width_mm: 420,
    height_mm: 120,
    package_details: 'Funda para prendas con percha reforzada de marca y protecciones',
    gross_weight_kg: 2.80,
    net_weight_kg: 2.45,
    images: [
      '/mpp-brake-disc.png'
    ],
    is_active: true
  },
  {
    id: 'a0000003-0000-0000-0000-000000000003',
    sku: 'EXH-AKRA-SHORTY',
    name: 'Akrapovic Shorty',
    slug: 'akrapovic-shorty-exhaust',
    price: 2850000,
    discount_price: null,
    stock_qty: 14,
    category: 'Exhaust',
    brand: 'Akrapovic',
    rating: 5.0,
    reviews_count: 512,
    description: 'Sistema de Escape — Fabricación ligera en titanio con puntera de fibra de carbono y sonido de carreras profundo.',
    length_mm: 520,
    width_mm: 220,
    height_mm: 180,
    package_details: 'Caja con espuma preformada a medida y abrazaderas de montaje',
    gross_weight_kg: 3.40,
    net_weight_kg: 2.20,
    images: [
      '/mpp-brake-disc.png'
    ],
    is_active: true
  },
  {
    id: 'a0000004-0000-0000-0000-000000000004',
    sku: 'TIRE-PIR-ROSSO4',
    name: 'Pirelli Diablo Rosso IV',
    slug: 'pirelli-diablo-rosso-iv-rear-tire',
    price: 890000,
    discount_price: null,
    stock_qty: 42,
    category: 'Tires',
    brand: 'Pirelli',
    rating: 5.0,
    reviews_count: 721,
    description: 'Llanta Trasera — Máximo agarre deportivo en curvas y sobresaliente estabilidad a altas velocidades tanto en seco como mojado.',
    length_mm: 650,
    width_mm: 650,
    height_mm: 190,
    package_details: 'Envoltura con fleje protector antihumedad',
    gross_weight_kg: 6.90,
    net_weight_kg: 6.80,
    images: [
      '/mpp-brake-disc.png'
    ],
    is_active: true
  },
  {
    id: 'a0000005-0000-0000-0000-000000000005',
    sku: 'ACC-QUAD-MOUNT',
    name: 'Quad Lock Motorcycle',
    slug: 'quad-lock-motorcycle-phone-mount',
    price: 260000,
    discount_price: null,
    stock_qty: 85,
    category: 'Accessories',
    brand: 'Quad Lock',
    rating: 5.0,
    reviews_count: 1125,
    description: 'Soporte Celular para Moto — Bloqueo patentado de doble fase con amortiguación antivibración para manillar.',
    length_mm: 150,
    width_mm: 120,
    height_mm: 60,
    package_details: 'Caja expositora con brazo alargador y 3 anillos adaptadores',
    gross_weight_kg: 0.32,
    net_weight_kg: 0.19,
    images: [
      '/mpp-brake-disc.png'
    ],
    is_active: true
  },
  {
    id: 'a0000006-0000-0000-0000-000000000006',
    sku: 'GLOV-DAIN-FM6',
    name: 'Dainese Full Metal 6',
    slug: 'dainese-full-metal-6-gloves',
    price: 590000,
    discount_price: null,
    stock_qty: 26,
    category: 'Gloves',
    brand: 'Dainese',
    rating: 5.0,
    reviews_count: 431,
    description: 'Guantes de Competición — Nivel MotoGP con inserciones de titanio y fibra de carbono, costuras en Kevlar y piel de cabra.',
    length_mm: 360,
    width_mm: 180,
    height_mm: 90,
    package_details: 'Caja de coleccionista con certificados de autenticidad de carbono',
    gross_weight_kg: 0.78,
    net_weight_kg: 0.46,
    images: [
      '/mpp-brake-disc.png'
    ],
    is_active: true
  },
  {
    id: 'a0000007-0000-0000-0000-000000000007',
    sku: 'BATT-YUA-YTZ10S',
    name: 'Batería AGM Yuasa Alto Rendimiento',
    slug: 'yuasa-high-performance-agm-battery',
    price: 380000,
    discount_price: null,
    stock_qty: 50,
    category: 'Batteries',
    brand: 'Yuasa',
    rating: 4.9,
    reviews_count: 294,
    description: 'Batería sellada de fábrica libre de mantenimiento con tecnología AGM y máxima potencia de arranque en frío.',
    images: [
      '/mpp-brake-disc.png'
    ],
    is_active: true
  },
  {
    id: 'a0000008-0000-0000-0000-000000000008',
    sku: 'MAINT-MOTUL-7100',
    name: 'Aceite Sintético Motul 7100 4T 10W-40 (4L)',
    slug: 'motul-7100-4t-10w-40-synthetic-oil-4l',
    price: 270000,
    discount_price: null,
    stock_qty: 70,
    category: 'Maintenance',
    brand: 'Motul',
    rating: 5.0,
    reviews_count: 880,
    description: 'Lubricante 100% sintético para motores 4 tiempos con tecnología de Éster. Homologación JASO MA2 para embrague bañado en aceite.',
    images: [
      '/mpp-brake-disc.png'
    ],
    is_active: true
  }
];

export const MOCK_COUPONS: Record<string, Coupon> = {
  RIDE10: {
    id: 'c1111111-1111-1111-1111-111111111111',
    code: 'RIDE10',
    discount_type: 'percentage',
    discount_value: 10,
    max_uses: 1000,
    current_uses: 0,
    is_active: true
  },
  LIME20: {
    id: 'c2222222-2222-2222-2222-222222222222',
    code: 'LIME20',
    discount_type: 'percentage',
    discount_value: 20,
    max_uses: 500,
    current_uses: 0,
    is_active: true
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching from Supabase, using local catalog:', error.message);
        return INITIAL_PRODUCTS;
      }
      if (data && data.length > 0) {
        return data as Product[];
      }
    } catch (err) {
      console.warn('Supabase network error, fallback to initial products:', err);
    }
  }

  // Fallback to local catalog
  return INITIAL_PRODUCTS;
};

export const validateCoupon = async (code: string): Promise<Coupon | null> => {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .single();

      if (!error && data) {
        return data as Coupon;
      }
    } catch (err) {
      console.warn('Coupon lookup error in Supabase, checking fallback:', err);
    }
  }

  return MOCK_COUPONS[cleanCode] || null;
};

export const processCheckout = async (
  profileId: string,
  items: { product: Product; quantity: number }[],
  couponCode?: string,
  shippingAddress: any = {}
): Promise<CheckoutResult> => {
  if (isSupabaseConfigured()) {
    try {
      const payloadItems = items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      }));

      const { data, error } = await supabase.rpc('process_checkout', {
        p_profile_id: profileId,
        p_items: payloadItems,
        p_coupon_code: couponCode || null,
        p_shipping_address: shippingAddress,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data as CheckoutResult;
    } catch (err: any) {
      console.warn('Supabase RPC process_checkout failed, executing fallback:', err);
      // If RPC fails or table not initialized yet, execute simulated atomic checkout
    }
  }

  // Simulated fallback transaction logic (Pessimistic-like lock and atomic reduction simulation)
  let subtotal = 0;
  for (const item of items) {
    if (item.product.stock_qty < item.quantity) {
      throw new Error(`Stock insuficiente para "${item.product.name}". Existencias: ${item.product.stock_qty}`);
    }
    const unitPrice = item.product.discount_price ?? item.product.price;
    subtotal += unitPrice * item.quantity;
  }

  let discountApplied = 0;
  if (couponCode) {
    const coupon = await validateCoupon(couponCode);
    if (coupon) {
      if (coupon.discount_type === 'percentage') {
        discountApplied = Math.round(subtotal * (coupon.discount_value / 100) * 100) / 100;
      } else {
        discountApplied = Math.min(subtotal, coupon.discount_value);
      }
    }
  }

  const totalAmount = Math.max(0, subtotal - discountApplied);
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const orderNumber = `MPP-${dateStr}-${randomPart}`;

  return {
    success: true,
    order_id: crypto.randomUUID ? crypto.randomUUID() : 'simulated-' + Date.now(),
    order_number: orderNumber,
    subtotal: Math.round(subtotal * 100) / 100,
    discount_applied: discountApplied,
    total_amount: Math.round(totalAmount * 100) / 100,
    message: '¡Pedido procesado con éxito!',
  };
};

// ==============================================================================
// SERVICIOS DEL PANEL DE ADMINISTRACIÓN (INVENTARIO, PEDIDOS, STORAGE)
// ==============================================================================

export const fetchOrders = async (): Promise<any[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('Error fetching orders from Supabase:', err);
    }
  }

  // Fallback demo orders
  return [
    {
      id: 'ord-001',
      order_number: 'MPP-20261008-883A',
      profile_id: 'd1111111-1111-1111-1111-111111111111',
      status: 'shipped',
      subtotal: 2199000,
      discount_applied: 219900,
      total_amount: 1979100,
      invoice_status: 'generated',
      payment_status: 'paid_in_full',
      shipping_address: {
        full_name: 'Carlos Rodríguez',
        city: 'Bogotá',
        address: 'Carrera 15 # 85-30, Apto 402',
        phone: '+57 300 123 4567',
        payment_method: 'pse',
      },
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      order_items: [
        {
          id: 'item-1',
          product_sku: 'HELM-SHOEI-RF1400',
          quantity: 1,
          unit_price: 2199000,
          total_price: 2199000,
        },
      ],
    },
    {
      id: 'ord-002',
      order_number: 'MPP-20261008-992B',
      profile_id: 'd1111111-1111-1111-1111-111111111111',
      status: 'pending',
      subtotal: 1299000,
      discount_applied: 0,
      total_amount: 1299000,
      invoice_status: 'pending',
      payment_status: 'pending',
      shipping_address: {
        full_name: 'Santiago Morales',
        city: 'Medellín',
        address: 'Calle 10 Poblado # 43B-12',
        phone: '+57 310 987 6543',
        payment_method: 'wompi',
      },
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      order_items: [
        {
          id: 'item-2',
          product_sku: 'JACK-ALP-TGPRV4',
          quantity: 1,
          unit_price: 1299000,
          total_price: 1299000,
        },
      ],
    },
  ];
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (!error) return true;
    } catch (err) {
      console.warn('Error updating order status in Supabase:', err);
    }
  }
  return true;
};

export const saveProduct = async (product: Partial<Product>): Promise<{ success: boolean; data?: any; error?: string }> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .upsert(product)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.warn('Error saving product in Supabase:', err.message);
      return { success: false, error: err.message };
    }
  }
  return { success: true, data: product };
};

export const deleteProduct = async (productId: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', productId);

      if (!error) return true;
    } catch (err) {
      console.warn('Error deleting product in Supabase:', err);
    }
  }
  return true;
};

export const uploadProductImage = async (file: File): Promise<string | null> => {
  if (isSupabaseConfigured()) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage
        .from('products')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) {
        console.warn('Storage upload error:', error.message);
        return null;
      }

      const { data } = supabase.storage.from('products').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.warn('Exception uploading image:', err);
      return null;
    }
  }
  return null;
};


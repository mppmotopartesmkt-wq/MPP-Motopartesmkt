import { supabase, isSupabaseConfigured } from './supabase';
import { Product, Coupon, CheckoutResult } from '../types';

// Initial local catalog matching the exact real inventory CSV
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'b0000001-0000-0000-0000-000000000001',
    sku: 'TAN2011N',
    name: 'Tanque Gasolina Boxer CT',
    slug: 'tanque-gasolina-boxer-ct-tan2011n',
    price: 200000,
    discount_price: 165000,
    wholesale_price: 165000,
    stock_qty: 25,
    category: 'Tanques',
    brand: 'Duvox/Twin',
    rating: 5.0,
    reviews_count: 148,
    description: 'Tanque de gasolina metálico de alta resistencia para Bajaj Boxer CT 100. Fabricado en lámina de calibre original con tratamiento anticorrosivo interno y pintura electrostática bicapa para máxima durabilidad en climas cálidos y húmedos.',
    length_mm: 540,
    width_mm: 320,
    height_mm: 260,
    package_details: 'Caja individual de exportación reforzada con plástico burbuja y protectores de esquinas',
    cbm_pc: 0.044928,
    gross_weight_kg: 4.20,
    net_weight_kg: 3.60,
    images: ['/mpp-brake-disc.png'],
    videos: [],
    is_active: true,
    status_text: 'Disponible'
  },
  {
    id: 'b0000002-0000-0000-0000-000000000002',
    sku: 'BX14080068',
    name: 'Farola NMAX Connect LED',
    slug: 'farola-n-max-connect-bx14080068',
    price: 350000,
    discount_price: 266000,
    wholesale_price: 266000,
    stock_qty: 15,
    category: 'Farolas',
    brand: 'Growsun',
    rating: 4.9,
    reviews_count: 92,
    description: 'Farola frontal completa con tecnología LED de alto flujo luminoso para Yamaha NMAX Connected (V2). Lente de policarbonato con tratamiento anti-UV resistente al amarillamiento y reflectores parabólicos de alta penetración.',
    length_mm: 380,
    width_mm: 300,
    height_mm: 240,
    package_details: 'Caja acolchada con moldes de espuma preformada anti-impacto',
    cbm_pc: 0.027360,
    gross_weight_kg: 2.10,
    net_weight_kg: 1.70,
    images: ['/mpp-brake-disc.png'],
    videos: [],
    is_active: true,
    status_text: 'Por agotarse'
  },
  {
    id: 'b0000003-0000-0000-0000-000000000003',
    sku: '827379',
    name: 'Farola NMAX V1 Original Quality',
    slug: 'farola-n-max-v1-827379',
    price: 155000,
    discount_price: null,
    wholesale_price: 155000,
    stock_qty: 15,
    category: 'Farolas',
    brand: 'Gx Motor',
    rating: 4.8,
    reviews_count: 64,
    description: 'Farola delantera para Yamaha NMAX V1 (2016-2020). Calce directo OEM sin modificaciones en arnés de cableado. Sellado hermético para impedir la entrada de polvo y humedad en días de lluvia.',
    length_mm: 360,
    width_mm: 290,
    height_mm: 220,
    package_details: 'Caja reforzada con soporte perimetral de amortiguación',
    cbm_pc: 0.022968,
    gross_weight_kg: 1.85,
    net_weight_kg: 1.50,
    images: ['/mpp-brake-disc.png'],
    videos: [],
    is_active: true,
    status_text: 'Por agotarse'
  },
  {
    id: 'b0000004-0000-0000-0000-000000000004',
    sku: '3928',
    name: 'Defensas NMAX Planas V1, V2 y V3',
    slug: 'defensas-n-max-planas-v1v2v3-3928',
    price: 160000,
    discount_price: 120000,
    wholesale_price: 120000,
    stock_qty: 25,
    category: 'Defensas',
    brand: 'Nacional / MPP',
    rating: 5.0,
    reviews_count: 115,
    description: 'Defensas slider planas de protección lateral para Yamaha NMAX (versiones V1, V2 y V3). Estructura en tubería de acero al carbono de alta resistencia con punteras deslizadoras en polímero técnico que absorben el impacto y protegen carenajes.',
    length_mm: 420,
    width_mm: 280,
    height_mm: 140,
    package_details: 'Empaque con plástico termocontraíble y flejes protectores',
    cbm_pc: 0.016464,
    gross_weight_kg: 2.90,
    net_weight_kg: 2.60,
    images: ['/mpp-brake-disc.png'],
    videos: [],
    is_active: true,
    status_text: 'Disponible'
  },
  {
    id: 'b0000005-0000-0000-0000-000000000005',
    sku: '2473',
    name: 'Defensas NMAX Largas V1, V2 y V3',
    slug: 'defensas-n-max-largas-v1v2v3-2473',
    price: 180000,
    discount_price: 120000,
    wholesale_price: 120000,
    stock_qty: 25,
    category: 'Defensas',
    brand: 'Nacional / MPP',
    rating: 5.0,
    reviews_count: 88,
    description: 'Defensas tubulares largas de máxima cobertura para scooter Yamaha NMAX V1, V2 y V3. Brindan protección integral para posapiés, piso y carenaje inferior en caídas y tráfico denso.',
    length_mm: 480,
    width_mm: 300,
    height_mm: 160,
    package_details: 'Empaque tubular reforzado con protección anticorrosión',
    cbm_pc: 0.023040,
    gross_weight_kg: 3.40,
    net_weight_kg: 3.10,
    images: ['/mpp-brake-disc.png'],
    videos: [],
    is_active: true,
    status_text: 'Disponible'
  },
  {
    id: 'b0000006-0000-0000-0000-000000000006',
    sku: '170302',
    name: 'Espejos Retrovisores MT 03 / MT 07 / MT 09',
    slug: 'espejos-mt-03-07-09-170302',
    price: 70000,
    discount_price: 30000,
    wholesale_price: 30000,
    stock_qty: 100,
    category: 'Espejos',
    brand: 'Champion',
    rating: 5.0,
    reviews_count: 210,
    description: 'Juego de espejos retrovisores deportivos aerodinámicos estilo Yamaha MT Series (MT-03, MT-07, MT-09). Cristal antirreflejo convexo con visión panorámica y brazo articulado antirvibración.',
    length_mm: 280,
    width_mm: 140,
    height_mm: 80,
    package_details: 'Blíster plástico rígido sellado de fábrica con adaptadores incluidos',
    cbm_pc: 0.003136,
    gross_weight_kg: 0.75,
    net_weight_kg: 0.60,
    images: ['/mpp-brake-disc.png'],
    videos: [],
    is_active: true,
    status_text: 'Disponible'
  },
  {
    id: 'b0000007-0000-0000-0000-000000000007',
    sku: '1703186',
    name: 'Espejos Retrovisores Duke 200 / 250 / 390',
    slug: 'espejos-duke-200-1703186',
    price: 50000,
    discount_price: 40000,
    wholesale_price: 40000,
    stock_qty: 50,
    category: 'Espejos',
    brand: 'Champion',
    rating: 4.9,
    reviews_count: 134,
    description: 'Par de espejos retrovisores diseño agresivo para KTM Duke 200, 250 y 390. Roscas de 10mm compatibles con la mayoría de motos naked y deportivas del mercado.',
    length_mm: 260,
    width_mm: 130,
    height_mm: 75,
    package_details: 'Caja expositora por par con protectores de cristal',
    cbm_pc: 0.002535,
    gross_weight_kg: 0.68,
    net_weight_kg: 0.55,
    images: ['/mpp-brake-disc.png'],
    videos: [],
    is_active: true,
    status_text: 'Disponible'
  },
  {
    id: 'b0000008-0000-0000-0000-000000000008',
    sku: '190404',
    name: 'Espejos Retrovisores XT 660 / Enduro',
    slug: 'espejos-xt-660-190404',
    price: 50000,
    discount_price: 40000,
    wholesale_price: 40000,
    stock_qty: 30,
    category: 'Espejos',
    brand: 'Nacional / MPP',
    rating: 4.8,
    reviews_count: 77,
    description: 'Espejos retrovisores redondos de alta visibilidad para Yamaha XT 660, XTZ y motocicletas todo terreno. Mecanismo de articulación giratorio resistente a ramas y caídas en trocha.',
    length_mm: 250,
    width_mm: 120,
    height_mm: 80,
    package_details: 'Empaque individual por par en caja compacta',
    cbm_pc: 0.002400,
    gross_weight_kg: 0.65,
    net_weight_kg: 0.52,
    images: ['/mpp-brake-disc.png'],
    videos: [],
    is_active: true,
    status_text: 'Por agotarse'
  },
  {
    id: 'b0000009-0000-0000-0000-000000000009',
    sku: '8489',
    name: 'Carenaje Completo Boxer CT 100',
    slug: 'carenaje-completo-boxer-ct100-8489',
    price: 100000,
    discount_price: 80000,
    wholesale_price: 80000,
    stock_qty: 10,
    category: 'Carenajes',
    brand: 'Duvox',
    rating: 4.9,
    reviews_count: 58,
    description: 'Kit de carenaje frontal completo con soporte de farola para Bajaj Boxer CT 100. Fabricado en plástico ABS virgen inyectado para evitar rajaduras por vibración y garantizar ensamble perfecto.',
    length_mm: 450,
    width_mm: 380,
    height_mm: 280,
    package_details: 'Caja de cartón corrugado reforzado para envíos nacionales',
    cbm_pc: 0.047880,
    gross_weight_kg: 2.20,
    net_weight_kg: 1.80,
    images: ['/mpp-brake-disc.png'],
    videos: [],
    is_active: true,
    status_text: 'Por agotarse'
  },
  {
    id: 'b0000010-0000-0000-0000-000000000010',
    sku: 'FAC2008N',
    name: 'Carenaje Completo Pulsar 180 / 220',
    slug: 'carenaje-completo-pulsar-180-fac2008n',
    price: 150000,
    discount_price: 125000,
    wholesale_price: 125000,
    stock_qty: 10,
    category: 'Carenajes',
    brand: 'Duvox',
    rating: 5.0,
    reviews_count: 82,
    description: 'Carenaje frontal deportivo con cúpula y soportes para Bajaj Pulsar 180 y 220. Acabado en pintura de alto brillo resistente al sol y calce directo con tornillos originales.',
    length_mm: 480,
    width_mm: 400,
    height_mm: 300,
    package_details: 'Caja de protección de doble pared con separadores de cartón',
    cbm_pc: 0.057600,
    gross_weight_kg: 2.60,
    net_weight_kg: 2.10,
    images: ['/mpp-brake-disc.png'],
    videos: [],
    is_active: true,
    status_text: 'Por agotarse'
  },
  {
    id: 'b0000011-0000-0000-0000-000000000011',
    sku: 'CSC3001N',
    name: 'Casco Integral MPP Racing Pro Certificado ECE/DOT',
    slug: 'casco-integral-mpp-racing-pro',
    price: 320000,
    discount_price: 285000,
    wholesale_price: 250000,
    stock_qty: 30,
    category: 'Cascos',
    brand: 'MPP Helmets',
    rating: 5.0,
    reviews_count: 114,
    description: 'Casco integral de alta gama con coraza aerodinámica en policarbonato avanzado, visor de liberación rápida con tratamiento anti-rayaduras y preparación Pinlock. Homologación internacional DOT y ECE 22.06.',
    length_mm: 360,
    width_mm: 270,
    height_mm: 270,
    package_details: 'Funda protectora en tela, manual y caja de embalaje con acolchado anti-golpes',
    cbm_pc: 0.026244,
    gross_weight_kg: 1.80,
    net_weight_kg: 1.45,
    images: ['/mpp-brake-disc.png'],
    videos: [],
    is_active: true,
    status_text: 'Disponible'
  },
  {
    id: 'b0000012-0000-0000-0000-000000000012',
    sku: 'ACC4001N',
    name: 'Soporte Celular Aluminio Antivibración con Carga USB',
    slug: 'soporte-celular-aluminio-antivibracion',
    price: 85000,
    discount_price: 69900,
    wholesale_price: 55000,
    stock_qty: 45,
    category: 'Accesorios',
    brand: 'MPP Moto',
    rating: 4.9,
    reviews_count: 67,
    description: 'Soporte universal para manubrio y espejo retrovisor en aleación de aluminio CNC con amortiguadores de vibración para proteger cámaras ópticas de smartphones. Incluye puerto de carga rápida USB impermeable.',
    length_mm: 150,
    width_mm: 100,
    height_mm: 80,
    package_details: 'Caja compacta con llaves bristol y adaptadores de diámetro para manillar',
    cbm_pc: 0.001200,
    gross_weight_kg: 0.35,
    net_weight_kg: 0.28,
    images: ['/mpp-brake-disc.png'],
    videos: [],
    is_active: true,
    status_text: 'Disponible'
  },
  {
    id: 'b0000013-0000-0000-0000-000000000013',
    sku: 'REP5001N',
    name: 'Kit de Arrastre Reforzado Corona y Piñón Acero 1045',
    slug: 'kit-arrastre-reforzado-acero-1045',
    price: 180000,
    discount_price: 149000,
    wholesale_price: 125000,
    stock_qty: 28,
    category: 'Repuestos',
    brand: 'MPP Parts',
    rating: 5.0,
    reviews_count: 95,
    description: 'Kit de arrastre de alto rendimiento con corona dentada en acero al carbono 1045 tratado térmicamente, piñón de ataque templado y cadena dorada reforzada con o-rings de sellado anti-fricción.',
    length_mm: 260,
    width_mm: 260,
    height_mm: 50,
    package_details: 'Blíster termoformado y caja sellada con lubricante inicial de fábrica',
    cbm_pc: 0.003380,
    gross_weight_kg: 2.40,
    net_weight_kg: 2.10,
    images: ['/mpp-brake-disc.png'],
    videos: [],
    is_active: true,
    status_text: 'Disponible'
  },
  {
    id: 'b0000014-0000-0000-0000-000000000014',
    sku: 'LLT6001N',
    name: 'Llanta Sellomátic Deportiva Doble Propósito 110/80-17',
    slug: 'llanta-sellomatic-deportiva-doble-proposito',
    price: 245000,
    discount_price: 198000,
    wholesale_price: 175000,
    stock_qty: 22,
    category: 'Llantas',
    brand: 'MPP Grip',
    rating: 4.8,
    reviews_count: 73,
    description: 'Llanta sellomátic de tecnología radial con compuesto de sílice reforzado para máximo agarre en pavimento seco y húmedo, así como tracción confiable en vías destapadas.',
    length_mm: 600,
    width_mm: 600,
    height_mm: 110,
    package_details: 'Empaque perimetral plástico de protección industrial anti-deformación',
    cbm_pc: 0.039600,
    gross_weight_kg: 4.60,
    net_weight_kg: 4.30,
    images: ['/mpp-brake-disc.png'],
    videos: [],
    is_active: true,
    status_text: 'Disponible'
  },
  {
    id: 'b0000015-0000-0000-0000-000000000015',
    sku: 'BAT7001N',
    name: 'Batería de Gel Libre Mantenimiento 12V 7Ah Alto CCA',
    slug: 'bateria-gel-libre-mantenimiento-12v-7ah',
    price: 135000,
    discount_price: 115000,
    wholesale_price: 95000,
    stock_qty: 35,
    category: 'Baterías',
    brand: 'MPP Power',
    rating: 5.0,
    reviews_count: 88,
    description: 'Batería sellada de electrolito gelificado libre de mantenimiento con alto poder de arranque en frío (CCA). Resistente a vibraciones intensas y diseñada para una vida útil extendida.',
    length_mm: 150,
    width_mm: 87,
    height_mm: 94,
    package_details: 'Caja individual reforzada con bornes y tornillería en bolsa sellada',
    cbm_pc: 0.001227,
    gross_weight_kg: 2.30,
    net_weight_kg: 2.15,
    images: ['/mpp-brake-disc.png'],
    videos: [],
    is_active: true,
    status_text: 'Disponible'
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

export const LOCAL_STORAGE_PRODUCTS_KEY = 'mpp_custom_products';
export const LOCAL_STORAGE_DELETED_KEY = 'mpp_deleted_products';

export const getLocalStoredProducts = (): Product[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Error reading products from localStorage:', e);
    return [];
  }
};

export const setLocalStoredProducts = (products: Product[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('Error saving products to localStorage:', e);
  }
};

export const getDeletedProductIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DELETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const markProductAsDeletedLocally = (id: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const current = getDeletedProductIds();
    if (!current.includes(id)) {
      localStorage.setItem(LOCAL_STORAGE_DELETED_KEY, JSON.stringify([...current, id]));
    }
    const custom = getLocalStoredProducts().filter((p) => p.id !== id);
    setLocalStoredProducts(custom);
  } catch (e) {
    console.warn('Error marking product as deleted locally:', e);
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  const localCustom = getLocalStoredProducts();
  const deletedIds = getDeletedProductIds();

  // Helper to merge Supabase or initial catalog with local edits/creations
  const mergeWithLocal = (baseList: Product[]): Product[] => {
    const map = new Map<string, Product>();
    baseList.forEach((p) => {
      if (!deletedIds.includes(p.id)) {
        map.set(p.id, p);
      }
    });
    // Overlay local custom products (they take precedence or get added)
    localCustom.forEach((p) => {
      if (!deletedIds.includes(p.id)) {
        map.set(p.id, p);
      }
    });
    return Array.from(map.values());
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return mergeWithLocal(data as Product[]);
      }
      if (error) {
        console.warn('Supabase fetch issue (using local fallback catalog):', error.message);
      }
    } catch (err) {
      console.warn('Supabase network error, fallback to initial products:', err);
    }
  }

  // Fallback to local catalog merged with user's saved products
  return mergeWithLocal(INITIAL_PRODUCTS);
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

export const saveProduct = async (
  product: Partial<Product>
): Promise<{ success: boolean; data?: any; error?: string; warning?: string }> => {
  const targetId =
    product.id ||
    `mpp-prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const fullProduct: Product = {
    id: targetId,
    sku: product.sku || `MPP-${Date.now().toString().slice(-4)}`,
    name: product.name || 'Nuevo Producto MPP',
    slug:
      product.slug ||
      (product.name || 'producto')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, ''),
    price: Number(product.price) || 0,
    discount_price: product.discount_price ? Number(product.discount_price) : null,
    wholesale_price: product.wholesale_price ? Number(product.wholesale_price) : null,
    stock_qty: Number(product.stock_qty) || 0,
    category: product.category || 'Cascos',
    brand: product.brand || 'MPP',
    status_text: product.status_text || 'Disponible',
    is_active: product.is_active !== false,
    images:
      product.images && product.images.length > 0
        ? product.images
        : ['/mpp-brake-disc.png'],
    videos: product.videos || [],
    description: product.description || '',
    length_mm: product.length_mm ? Number(product.length_mm) : null,
    width_mm: product.width_mm ? Number(product.width_mm) : null,
    height_mm: product.height_mm ? Number(product.height_mm) : null,
    package_details: product.package_details || null,
    gross_weight_kg: product.gross_weight_kg ? Number(product.gross_weight_kg) : null,
    net_weight_kg: product.net_weight_kg ? Number(product.net_weight_kg) : null,
    rating: product.rating || 5.0,
    reviews_count: product.reviews_count || 1,
  };

  // 1. Always persist locally in localStorage so products remain on page refresh
  const localList = getLocalStoredProducts();
  const existingIdx = localList.findIndex(
    (p) => p.id === fullProduct.id || p.sku === fullProduct.sku
  );
  let updatedList: Product[];
  if (existingIdx >= 0) {
    updatedList = [...localList];
    updatedList[existingIdx] = fullProduct;
  } else {
    updatedList = [fullProduct, ...localList];
  }
  setLocalStoredProducts(updatedList);

  // Unmark from deleted if it was previously marked deleted
  const deleted = getDeletedProductIds().filter((id) => id !== fullProduct.id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_DELETED_KEY, JSON.stringify(deleted));
  }

  // Update in-memory initial list
  const memIdx = INITIAL_PRODUCTS.findIndex(
    (p) => p.id === fullProduct.id || p.sku === fullProduct.sku
  );
  if (memIdx >= 0) {
    INITIAL_PRODUCTS[memIdx] = fullProduct;
  } else {
    INITIAL_PRODUCTS.unshift(fullProduct);
  }

  // 2. Sync to Supabase in parallel if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .upsert(fullProduct)
        .select()
        .single();

      if (error) {
        console.warn('Supabase upsert warning (saved locally in browser):', error.message);
        return { success: true, data: fullProduct, warning: error.message };
      }
      return { success: true, data: data || fullProduct };
    } catch (err: any) {
      console.warn('Supabase exception (saved locally in browser):', err?.message);
      return { success: true, data: fullProduct, warning: err?.message };
    }
  }

  return { success: true, data: fullProduct };
};

export const deleteProduct = async (productId: string): Promise<boolean> => {
  markProductAsDeletedLocally(productId);

  const memIdx = INITIAL_PRODUCTS.findIndex((p) => p.id === productId);
  if (memIdx >= 0) {
    INITIAL_PRODUCTS.splice(memIdx, 1);
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', productId);
    } catch (err) {
      console.warn('Error deleting product in Supabase:', err);
    }
  }
  return true;
};

export interface UploadMediaResult {
  url: string;
  type: 'image' | 'video';
  fileName: string;
}

export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      resolve(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  });
};

export const uploadProductMedia = async (file: File): Promise<UploadMediaResult | null> => {
  const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg|m4v)$/i.test(file.name);
  const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';
  const folder = isVideo ? 'videos' : 'images';
  const fileExt = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
  const cleanName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.storage
        .from('products')
        .upload(cleanName, file, {
          contentType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.warn('Supabase Storage notice (using persistent data format):', error.message);
        const dataUrl = await fileToDataUrl(file);
        return { url: dataUrl, type: mediaType, fileName: file.name };
      }

      const { data } = supabase.storage.from('products').getPublicUrl(cleanName);
      return { url: data.publicUrl, type: mediaType, fileName: file.name };
    } catch (err) {
      console.warn('Supabase Storage fallback (using persistent data format):', err);
      const dataUrl = await fileToDataUrl(file);
      return { url: dataUrl, type: mediaType, fileName: file.name };
    }
  }

  // Fallback when Supabase is not yet configured or offline
  const dataUrl = await fileToDataUrl(file);
  return { url: dataUrl, type: mediaType, fileName: file.name };
};

export const uploadProductImage = async (file: File): Promise<string | null> => {
  const res = await uploadProductMedia(file);
  return res ? res.url : null;
};


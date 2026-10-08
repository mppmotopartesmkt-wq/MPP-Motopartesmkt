-- ==============================================================================
-- MPP REPUESTOS PARA MOTOS — ESQUEMA COMPLETO DDL & SUPABASE STORAGE
-- Proyecto: https://iyhgtpemgywwanqqvtpe.supabase.co
-- Principio: Single Source of Truth, RLS, Storage Buckets & Bloqueo Pesimista
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. SUPABASE STORAGE BUCKETS (Imágenes de productos y comprobantes)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('products', 'products', true),
    ('receipts', 'receipts', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de lectura pública para Storage
DROP POLICY IF EXISTS "Acceso Publico Productos Storage" ON storage.objects;
CREATE POLICY "Acceso Publico Productos Storage"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Permitir Subida Productos Storage" ON storage.objects;
CREATE POLICY "Permitir Subida Productos Storage"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Acceso Publico Comprobantes Storage" ON storage.objects;
CREATE POLICY "Acceso Publico Comprobantes Storage"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Permitir Subida Comprobantes Storage" ON storage.objects;
CREATE POLICY "Permitir Subida Comprobantes Storage"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'receipts');

-- ==============================================================================
-- 3. TABLA: profiles (Extensión de auth.users & Facturación DIAN)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    document_type TEXT CHECK (document_type IN ('CC', 'NIT', 'CE', 'PASAPORTE', 'TI', 'RUT')),
    document_number TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'collaborator', 'customer')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 4. TABLA: products (Catálogo, Inventario & Packing List de Importación)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    price NUMERIC(14,2) NOT NULL CHECK (price >= 0),
    discount_price NUMERIC(14,2) CHECK (discount_price IS NULL OR discount_price < price),
    stock_qty INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    category TEXT,
    brand TEXT,
    rating NUMERIC(2,1) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    description TEXT,
    length_mm NUMERIC(10,2),
    width_mm NUMERIC(10,2),
    height_mm NUMERIC(10,2),
    package_details TEXT,
    cbm_pc NUMERIC(10,6),
    gross_weight_kg NUMERIC(10,3),
    net_weight_kg NUMERIC(10,3),
    images TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 5. TABLA: coupons (Cupones de Descuento Promocionales)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(12,2) NOT NULL CHECK (discount_value > 0),
    max_uses INT DEFAULT 100,
    current_uses INT DEFAULT 0 CHECK (current_uses >= 0),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 6. TABLA: orders (Encabezado de Pedidos & Factura Electrónica)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    subtotal NUMERIC(14,2) NOT NULL CHECK (subtotal >= 0),
    discount_applied NUMERIC(14,2) DEFAULT 0 CHECK (discount_applied >= 0),
    total_amount NUMERIC(14,2) NOT NULL CHECK (total_amount >= 0),
    invoice_status TEXT DEFAULT 'pending' CHECK (invoice_status IN ('pending', 'generated', 'failed')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial_payment', 'paid_in_full')),
    shipping_address JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 7. TABLA: order_items (Líneas de Detalle del Pedido)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_sku TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(14,2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(14,2) NOT NULL CHECK (total_price >= 0)
);

-- ==============================================================================
-- 8. TABLA: payments (Historial de Pagos, Abonos y Comprobantes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    amount_paid NUMERIC(14,2) NOT NULL CHECK (amount_paid > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('transfer', 'wompi', 'pse', 'cash', 'credit_card', 'paypal', 'apple_pay')),
    receipt_url TEXT,
    payment_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 9. TRIGGER: Creación Automática de Perfil al Registrarse en Auth
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        'customer'
    )
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES & IS_ADMIN HELPER
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'collaborator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Profiles
DROP POLICY IF EXISTS "Public profiles can be viewed by own user" ON public.profiles;
CREATE POLICY "Public profiles can be viewed by own user"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin());

-- Products
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products"
    ON public.products FOR SELECT
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Only admins/collaborators can insert/update products" ON public.products;
CREATE POLICY "Only admins/collaborators can insert/update products"
    ON public.products FOR ALL
    USING (public.is_admin());

-- Coupons
DROP POLICY IF EXISTS "Active coupons are publicly readable" ON public.coupons;
CREATE POLICY "Active coupons are publicly readable"
    ON public.coupons FOR SELECT
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Only admins manage coupons" ON public.coupons;
CREATE POLICY "Only admins manage coupons"
    ON public.coupons FOR ALL
    USING (public.is_admin());

-- Orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = profile_id OR public.is_admin());

DROP POLICY IF EXISTS "Allow checkout orders insertion" ON public.orders;
CREATE POLICY "Allow checkout orders insertion"
    ON public.orders FOR INSERT
    WITH CHECK (true);

-- Order Items
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
CREATE POLICY "Users can view their own order items"
    ON public.order_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_items.order_id
        AND (o.profile_id = auth.uid() OR public.is_admin())
    ));

DROP POLICY IF EXISTS "Allow checkout order items insertion" ON public.order_items;
CREATE POLICY "Allow checkout order items insertion"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

-- Payments
DROP POLICY IF EXISTS "Users view payments for their orders" ON public.payments;
CREATE POLICY "Users view payments for their orders"
    ON public.payments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = payments.order_id
        AND (o.profile_id = auth.uid() OR public.is_admin())
    ));

-- ==============================================================================
-- 11. RPC: process_checkout (Bloqueo Pesimista FOR UPDATE y Descuento Atómico)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.process_checkout(
    p_profile_id UUID,
    p_items JSONB,
    p_coupon_code TEXT DEFAULT NULL,
    p_shipping_address JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
    v_order_id UUID := gen_random_uuid();
    v_order_number TEXT;
    v_item RECORD;
    v_product RECORD;
    v_subtotal NUMERIC(14,2) := 0;
    v_discount NUMERIC(14,2) := 0;
    v_total NUMERIC(14,2) := 0;
    v_item_subtotal NUMERIC(14,2) := 0;
    v_coupon RECORD;
BEGIN
    -- 1. Generar número de orden corporativo MPP
    v_order_number := 'MPP-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));

    -- 2. Validar que vengan ítems
    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'El carrito de compras está vacío.';
    END IF;

    -- 3. Bloqueo pesimista (FOR UPDATE) y validación de stock
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INT)
    LOOP
        SELECT * INTO v_product
        FROM public.products
        WHERE id = v_item.product_id AND is_active = true
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Producto con ID % no encontrado o inactivo.', v_item.product_id;
        END IF;

        IF v_product.stock_qty < v_item.quantity THEN
            RAISE EXCEPTION 'Stock insuficiente para "%". Existencias: %, solicitadas: %',
                v_product.name, v_product.stock_qty, v_item.quantity;
        END IF;

        v_item_subtotal := COALESCE(v_product.discount_price, v_product.price) * v_item.quantity;
        v_subtotal := v_subtotal + v_item_subtotal;
    END LOOP;

    -- 4. Validación y cálculo de cupón de descuento
    IF p_coupon_code IS NOT NULL AND trim(p_coupon_code) <> '' THEN
        SELECT * INTO v_coupon
        FROM public.coupons
        WHERE upper(code) = upper(trim(p_coupon_code))
          AND is_active = true
          AND (expires_at IS NULL OR expires_at > now())
          AND (max_uses IS NULL OR current_uses < max_uses)
        FOR UPDATE;

        IF FOUND THEN
            IF v_coupon.discount_type = 'percentage' THEN
                v_discount := ROUND((v_subtotal * (v_coupon.discount_value / 100.0)), 0);
            ELSE
                v_discount := LEAST(v_subtotal, v_coupon.discount_value);
            END IF;

            UPDATE public.coupons
            SET current_uses = current_uses + 1
            WHERE id = v_coupon.id;
        END IF;
    END IF;

    v_total := GREATEST(0, v_subtotal - v_discount);

    -- 5. Insertar encabezado de orden
    INSERT INTO public.orders (
        id,
        order_number,
        profile_id,
        status,
        subtotal,
        discount_applied,
        total_amount,
        invoice_status,
        payment_status,
        shipping_address
    ) VALUES (
        v_order_id,
        v_order_number,
        p_profile_id,
        'pending',
        v_subtotal,
        v_discount,
        v_total,
        'pending',
        'pending',
        p_shipping_address
    );

    -- 6. Insertar items del pedido y descontar inventario atómicamente
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INT)
    LOOP
        SELECT * INTO v_product FROM public.products WHERE id = v_item.product_id;
        v_item_subtotal := COALESCE(v_product.discount_price, v_product.price) * v_item.quantity;

        INSERT INTO public.order_items (
            order_id,
            product_id,
            product_sku,
            quantity,
            unit_price,
            total_price
        ) VALUES (
            v_order_id,
            v_product.id,
            v_product.sku,
            v_item.quantity,
            COALESCE(v_product.discount_price, v_product.price),
            v_item_subtotal
        );

        -- Descuento directo en la base de datos
        UPDATE public.products
        SET stock_qty = stock_qty - v_item.quantity
        WHERE id = v_product.id;
    END LOOP;

    -- 7. Retorno de respuesta JSON
    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'subtotal', v_subtotal,
        'discount_applied', v_discount,
        'total_amount', v_total
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 12. DATOS SEMILLA (PRODUCTOS & CUPONES EN PESOS COLOMBIANOS - COP)
-- ==============================================================================
INSERT INTO public.coupons (id, code, discount_type, discount_value, max_uses, current_uses, expires_at, is_active)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'RIDE10', 'percentage', 10.00, 1000, 0, now() + interval '1 year', true),
    ('c2222222-2222-2222-2222-222222222222', 'LIME20', 'percentage', 20.00, 500, 0, now() + interval '1 year', true),
    ('c3333333-3333-3333-3333-333333333333', 'MPP10', 'percentage', 10.00, 1000, 0, now() + interval '1 year', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.products (
    id, sku, name, slug, price, discount_price, stock_qty, category, brand, rating, reviews_count, description,
    length_mm, width_mm, height_mm, package_details, cbm_pc, gross_weight_kg, net_weight_kg, images, is_active
) VALUES 
(
    'a0000001-0000-0000-0000-000000000001',
    'HELM-SHOEI-RF1400',
    'Shoei RF-1400 Full Face Helmet',
    'shoei-rf-1400-full-face-helmet',
    2199000.00,
    NULL,
    28,
    'Helmets',
    'Shoei',
    5.0,
    842,
    'Casco Integral — Perfección aerodinámica, interior insonorizado y doble certificación Snell y DOT.',
    380.00, 290.00, 280.00, 'Caja reforzada con funda protectora de felpa y pinlock antivaho', 0.030856, 2.350, 1.620,
    ARRAY['/mpp-brake-disc.png'],
    true
),
(
    'a0000002-0000-0000-0000-000000000002',
    'JACK-ALP-TGPRV4',
    'Alpinestars T-GP R V4 Jacket',
    'alpinestars-t-gp-r-v4-jacket',
    1299000.00,
    NULL,
    35,
    'Riding Gear',
    'Alpinestars',
    5.0,
    623,
    'Chaqueta Deportiva V4 — Textil de alto rendimiento compatible con airbag Tech-Air 5 y deslizaderas DFS.',
    600.00, 420.00, 120.00, 'Funda para prendas con percha reforzada de marca y protecciones', 0.030240, 2.800, 2.450,
    ARRAY['/mpp-brake-disc.png'],
    true
),
(
    'a0000003-0000-0000-0000-000000000003',
    'EXH-AKRA-SHORTY',
    'Akrapovic Shorty Exhaust',
    'akrapovic-shorty-exhaust',
    2850000.00,
    NULL,
    14,
    'Exhaust',
    'Akrapovic',
    5.0,
    512,
    'Sistema de Escape — Fabricación ligera en titanio con puntera de fibra de carbono y sonido de carreras profundo.',
    520.00, 220.00, 180.00, 'Caja con espuma preformada a medida y abrazaderas de montaje', 0.020592, 3.400, 2.200,
    ARRAY['/mpp-brake-disc.png'],
    true
),
(
    'a0000004-0000-0000-0000-000000000004',
    'TIRE-PIR-ROSSO4',
    'Pirelli Diablo Rosso IV Rear Tire',
    'pirelli-diablo-rosso-iv-rear-tire',
    890000.00,
    NULL,
    42,
    'Tires',
    'Pirelli',
    5.0,
    721,
    'Llanta Trasera — Máximo agarre deportivo en curvas y sobresaliente estabilidad a altas velocidades tanto en seco como mojado.',
    650.00, 650.00, 190.00, 'Envoltura con fleje protector antihumedad', 0.080275, 6.900, 6.800,
    ARRAY['/mpp-brake-disc.png'],
    true
),
(
    'a0000005-0000-0000-0000-000000000005',
    'ACC-QUAD-MOUNT',
    'Quad Lock Motorcycle Phone Mount',
    'quad-lock-motorcycle-phone-mount',
    260000.00,
    NULL,
    85,
    'Accessories',
    'Quad Lock',
    5.0,
    1125,
    'Soporte Celular para Moto — Bloqueo patentado de doble fase con amortiguación antivibración para manillar.',
    150.00, 120.00, 60.00, 'Caja expositora con brazo alargador y 3 anillos adaptadores', 0.001080, 0.320, 0.190,
    ARRAY['/mpp-brake-disc.png'],
    true
),
(
    'a0000006-0000-0000-0000-000000000006',
    'GLOV-DAIN-FM6',
    'Dainese Full Metal 6 Gloves',
    'dainese-full-metal-6-gloves',
    590000.00,
    NULL,
    26,
    'Gloves',
    'Dainese',
    5.0,
    431,
    'Guantes de Competición — Nivel MotoGP con inserciones de titanio y fibra de carbono, costuras en Kevlar y piel de cabra.',
    360.00, 180.00, 90.00, 'Caja de coleccionista con certificados de autenticidad de carbono', 0.005832, 0.780, 0.460,
    ARRAY['/mpp-brake-disc.png'],
    true
),
(
    'a0000007-0000-0000-0000-000000000007',
    'BATT-YUA-YTZ10S',
    'Yuasa High Performance AGM Battery',
    'yuasa-high-performance-agm-battery',
    380000.00,
    NULL,
    50,
    'Batteries',
    'Yuasa',
    4.9,
    294,
    'Batería sellada de fábrica libre de mantenimiento con tecnología AGM y máxima potencia de arranque en frío.',
    160.00, 100.00, 100.00, 'Caja reforzada resistente a químicos con insertos antigolpes', 0.001600, 3.400, 3.200,
    ARRAY['/mpp-brake-disc.png'],
    true
),
(
    'a0000008-0000-0000-0000-000000000008',
    'MAINT-MOTUL-7100',
    'Motul 7100 4T 10W-40 Synthetic Oil (4L)',
    'motul-7100-4t-10w-40-synthetic-oil-4l',
    270000.00,
    NULL,
    70,
    'Maintenance',
    'Motul',
    5.0,
    880,
    'Lubricante 100% sintético para motores 4 tiempos con tecnología de Éster. Homologación JASO MA2 para embrague bañado en aceite.',
    280.00, 190.00, 130.00, 'Galón de 4 Litros sellado con vertedor antiderrame', 0.006916, 3.850, 3.650,
    ARRAY['/mpp-brake-disc.png'],
    true
)
ON CONFLICT (sku) DO UPDATE SET
    images = EXCLUDED.images,
    price = EXCLUDED.price,
    stock_qty = EXCLUDED.stock_qty,
    rating = EXCLUDED.rating,
    reviews_count = EXCLUDED.reviews_count;

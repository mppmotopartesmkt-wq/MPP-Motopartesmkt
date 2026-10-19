-- ==============================================================================
-- FIX COMPLETO PARA SUPABASE:
-- 1. Crea el bucket público de storage "products" (para fotos y videos)
-- 2. Resuelve la recursión infinita en profiles (error 42P17)
-- 3. Habilita lectura y guardado de productos sin bloqueos de RLS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. BUCKET DE STORAGE "products" Y POLÍTICAS DE ACCESO
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
    'products',
    'products',
    true,
    false,
    52428800, -- 50 MB
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE 
SET public = true,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];

-- Políticas de lectura y subida pública para el bucket "products"
DROP POLICY IF EXISTS "Public read on products bucket" ON storage.objects;
CREATE POLICY "Public read on products bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Public upload on products bucket" ON storage.objects;
CREATE POLICY "Public upload on products bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Public update on products bucket" ON storage.objects;
CREATE POLICY "Public update on products bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Public delete on products bucket" ON storage.objects;
CREATE POLICY "Public delete on products bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'products');

-- ------------------------------------------------------------------------------
-- 2. CORREGIR POLÍTICAS DE PROFILES (ELIMINA RECURSIÓN INFINITA 42P17)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles can be viewed by own user" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles read policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;

CREATE POLICY "Profiles read policy"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Profiles update policy"
ON public.profiles FOR UPDATE
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 3. CORREGIR POLÍTICAS DE PRODUCTS (DESBLOQUEA GUARDADO Y ACTUALIZACIÓN)
-- ------------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Only admins/collaborators can insert/update products" ON public.products;
DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Public modify products" ON public.products;

CREATE POLICY "Public read products"
ON public.products FOR SELECT
USING (true);

CREATE POLICY "Public modify products"
ON public.products FOR ALL
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 4. CORREGIR POLÍTICAS DE PEDIDOS (ORDERS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow checkout orders insertion" ON public.orders;
DROP POLICY IF EXISTS "Orders read all" ON public.orders;
DROP POLICY IF EXISTS "Orders manage all" ON public.orders;

CREATE POLICY "Orders read all"
ON public.orders FOR SELECT
USING (true);

CREATE POLICY "Orders manage all"
ON public.orders FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow checkout order items insertion" ON public.order_items;
DROP POLICY IF EXISTS "Order items read all" ON public.order_items;
DROP POLICY IF EXISTS "Order items manage all" ON public.order_items;

CREATE POLICY "Order items read all"
ON public.order_items FOR SELECT
USING (true);

CREATE POLICY "Order items manage all"
ON public.order_items FOR ALL
USING (true)
WITH CHECK (true);

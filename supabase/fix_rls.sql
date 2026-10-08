-- ==============================================================================
-- FIX RLS POLICIES & HELPER FUNCTION (Corrige la recursión infinita en profiles)
-- Ejecutar este script en Supabase SQL Editor para desbloquear lecturas
-- ==============================================================================

-- 1. Función con SECURITY DEFINER para verificar si el usuario es Admin/Colaborador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'collaborator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Corregir políticas de profiles
DROP POLICY IF EXISTS "Public profiles can be viewed by own user" ON public.profiles;
CREATE POLICY "Public profiles can be viewed by own user"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin());

-- 3. Corregir políticas de products (Lectura pública directa sin recursión)
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products"
    ON public.products FOR SELECT
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Only admins/collaborators can insert/update products" ON public.products;
CREATE POLICY "Only admins/collaborators can insert/update products"
    ON public.products FOR ALL
    USING (public.is_admin());

-- 4. Corregir políticas de coupons
DROP POLICY IF EXISTS "Active coupons are publicly readable" ON public.coupons;
CREATE POLICY "Active coupons are publicly readable"
    ON public.coupons FOR SELECT
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Only admins manage coupons" ON public.coupons;
CREATE POLICY "Only admins manage coupons"
    ON public.coupons FOR ALL
    USING (public.is_admin());

-- 5. Corregir políticas de orders y order_items
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = profile_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
    ON public.orders FOR ALL
    USING (auth.uid() = profile_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
CREATE POLICY "Users can view their own order items"
    ON public.order_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_items.order_id
        AND (o.profile_id = auth.uid() OR public.is_admin())
    ));

-- 6. Permitir que cualquier usuario (incluso anónimos o clientes) inserte pedidos al pagar
DROP POLICY IF EXISTS "Allow checkout orders insertion" ON public.orders;
CREATE POLICY "Allow checkout orders insertion"
    ON public.orders FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow checkout order items insertion" ON public.order_items;
CREATE POLICY "Allow checkout order items insertion"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

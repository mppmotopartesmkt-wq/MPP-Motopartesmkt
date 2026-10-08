-- ==============================================================================
-- UPDATE PRODUCT IMAGES TO NEW BRAKE DISC PHOTO
-- Ejecuta este comando en Supabase SQL Editor si ya tenías productos creados
-- ==============================================================================

UPDATE public.products
SET images = ARRAY['/mpp-brake-disc.png'];

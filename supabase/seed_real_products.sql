-- ==============================================================================
-- MIGRACIÓN & CARGA DE PRODUCTOS REALES (MPP MOTOPARTES)
-- Inventario oficial desde archivo CSV (10 productos iniciales)
-- Ejecutar este script en Supabase SQL Editor
-- ==============================================================================

-- 1. Agregar columnas para videos, precio por mayor y estado si no existen
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS wholesale_price NUMERIC(12,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status_text TEXT DEFAULT 'Disponible';

-- 2. Configurar Bucket de Storage 'products' para fotos y videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'products',
    'products',
    true,
    52428800, -- 50 MB (permite videos cortos y fotos en alta resolución)
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml',
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'video/ogg'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml',
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'video/ogg'
    ];

-- 3. Políticas de acceso público a storage.objects para el bucket 'products'
DROP POLICY IF EXISTS "Public Access to Products Media" ON storage.objects;
CREATE POLICY "Public Access to Products Media"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow Upload to Products Media" ON storage.objects;
CREATE POLICY "Allow Upload to Products Media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow Update to Products Media" ON storage.objects;
CREATE POLICY "Allow Update to Products Media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow Delete from Products Media" ON storage.objects;
CREATE POLICY "Allow Delete from Products Media"
ON storage.objects FOR DELETE
USING (bucket_id = 'products');

-- 4. Inserción de los 10 Productos Reales del Inventario
INSERT INTO public.products (
    id, sku, name, slug, price, discount_price, wholesale_price, stock_qty, category, brand,
    rating, reviews_count, description, length_mm, width_mm, height_mm, package_details,
    cbm_pc, gross_weight_kg, net_weight_kg, images, videos, is_active, status_text
)
VALUES
(
    'b0000001-0000-0000-0000-000000000001',
    'TAN2011N',
    'Tanque Gasolina Boxer CT',
    'tanque-gasolina-boxer-ct-tan2011n',
    200000.00,
    165000.00,
    165000.00,
    25,
    'Tanques',
    'Duvox/Twin',
    5.0,
    148,
    'Tanque de gasolina metálico de alta resistencia para Bajaj Boxer CT 100. Fabricado en lámina de calibre original con tratamiento anticorrosivo interno y pintura electrostática bicapa para máxima durabilidad en climas cálidos y húmedos.',
    540.00, 320.00, 260.00, 'Caja individual de exportación reforzada con plástico burbuja y protectores de esquinas',
    0.044928, 4.200, 3.600,
    ARRAY['/mpp-brake-disc.png'],
    ARRAY[]::TEXT[],
    true,
    'Disponible'
),
(
    'b0000002-0000-0000-0000-000000000002',
    'BX14080068',
    'Farola NMAX Connect LED',
    'farola-n-max-connect-bx14080068',
    350000.00,
    266000.00,
    266000.00,
    15,
    'Farolas',
    'Growsun',
    4.9,
    92,
    'Farola frontal completa con tecnología LED de alto flujo luminoso para Yamaha NMAX Connected (V2). Lente de policarbonato con tratamiento anti-UV resistente al amarillamiento y reflectores parabólicos de alta penetración.',
    380.00, 300.00, 240.00, 'Caja acolchada con moldes de espuma preformada anti-impacto',
    0.027360, 2.100, 1.700,
    ARRAY['/mpp-brake-disc.png'],
    ARRAY[]::TEXT[],
    true,
    'Por agotarse'
),
(
    'b0000003-0000-0000-0000-000000000003',
    '827379',
    'Farola NMAX V1 Original Quality',
    'farola-n-max-v1-827379',
    155000.00,
    NULL,
    155000.00,
    15,
    'Farolas',
    'Gx Motor',
    4.8,
    64,
    'Farola delantera para Yamaha NMAX V1 (2016-2020). Calce directo OEM sin modificaciones en arnés de cableado. Sellado hermético para impedir la entrada de polvo y humedad en días de lluvia.',
    360.00, 290.00, 220.00, 'Caja reforzada con soporte perimetral de amortiguación',
    0.022968, 1.850, 1.500,
    ARRAY['/mpp-brake-disc.png'],
    ARRAY[]::TEXT[],
    true,
    'Por agotarse'
),
(
    'b0000004-0000-0000-0000-000000000004',
    '3928',
    'Defensas NMAX Planas V1, V2 y V3',
    'defensas-n-max-planas-v1v2v3-3928',
    160000.00,
    120000.00,
    120000.00,
    25,
    'Defensas',
    'Nacional / MPP',
    5.0,
    115,
    'Defensas slider planas de protección lateral para Yamaha NMAX (versiones V1, V2 y V3). Estructura en tubería de acero al carbono de alta resistencia con punteras deslizadoras en polímero técnico que absorben el impacto y protegen carenajes.',
    420.00, 280.00, 140.00, 'Empaque con plástico termocontraíble y flejes protectores',
    0.016464, 2.900, 2.600,
    ARRAY['/mpp-brake-disc.png'],
    ARRAY[]::TEXT[],
    true,
    'Disponible'
),
(
    'b0000005-0000-0000-0000-000000000005',
    '2473',
    'Defensas NMAX Largas V1, V2 y V3',
    'defensas-n-max-largas-v1v2v3-2473',
    180000.00,
    120000.00,
    120000.00,
    25,
    'Defensas',
    'Nacional / MPP',
    5.0,
    88,
    'Defensas tubulares largas de máxima cobertura para scooter Yamaha NMAX V1, V2 y V3. Brindan protección integral para posapiés, piso y carenaje inferior en caídas y tráfico denso.',
    480.00, 300.00, 160.00, 'Empaque tubular reforzado con protección anticorrosión',
    0.023040, 3.400, 3.100,
    ARRAY['/mpp-brake-disc.png'],
    ARRAY[]::TEXT[],
    true,
    'Disponible'
),
(
    'b0000006-0000-0000-0000-000000000006',
    '170302',
    'Espejos Retrovisores MT 03 / MT 07 / MT 09',
    'espejos-mt-03-07-09-170302',
    70000.00,
    30000.00,
    30000.00,
    100,
    'Espejos',
    'Champion',
    5.0,
    210,
    'Juego de espejos retrovisores deportivos aerodinámicos estilo Yamaha MT Series (MT-03, MT-07, MT-09). Cristal antirreflejo convexo con visión panorámica y brazo articulado antirvibración.',
    280.00, 140.00, 80.00, 'Blíster plástico rígido sellado de fábrica con adaptadores incluidos',
    0.003136, 0.750, 0.600,
    ARRAY['/mpp-brake-disc.png'],
    ARRAY[]::TEXT[],
    true,
    'Disponible'
),
(
    'b0000007-0000-0000-0000-000000000007',
    '1703186',
    'Espejos Retrovisores Duke 200 / 250 / 390',
    'espejos-duke-200-1703186',
    50000.00,
    40000.00,
    40000.00,
    50,
    'Espejos',
    'Champion',
    4.9,
    134,
    'Par de espejos retrovisores diseño agresivo para KTM Duke 200, 250 y 390. Roscas de 10mm compatibles con la mayoría de motos naked y deportivas del mercado.',
    260.00, 130.00, 75.00, 'Caja expositora por par con protectores de cristal',
    0.002535, 0.680, 0.550,
    ARRAY['/mpp-brake-disc.png'],
    ARRAY[]::TEXT[],
    true,
    'Disponible'
),
(
    'b0000008-0000-0000-0000-000000000008',
    '190404',
    'Espejos Retrovisores XT 660 / Enduro',
    'espejos-xt-660-190404',
    50000.00,
    40000.00,
    40000.00,
    30,
    'Espejos',
    'Nacional / MPP',
    4.8,
    77,
    'Espejos retrovisores redondos de alta visibilidad para Yamaha XT 660, XTZ y motocicletas todo terreno. Mecanismo de articulación giratorio resistente a ramas y caídas en trocha.',
    250.00, 120.00, 80.00, 'Empaque individual por par en caja compacta',
    0.002400, 0.650, 0.520,
    ARRAY['/mpp-brake-disc.png'],
    ARRAY[]::TEXT[],
    true,
    'Por agotarse'
),
(
    'b0000009-0000-0000-0000-000000000009',
    '8489',
    'Carenaje Completo Boxer CT 100',
    'carenaje-completo-boxer-ct100-8489',
    100000.00,
    80000.00,
    80000.00,
    10,
    'Carenajes',
    'Duvox',
    4.9,
    58,
    'Kit de carenaje frontal completo con soporte de farola para Bajaj Boxer CT 100. Fabricado en plástico ABS virgen inyectado para evitar rajaduras por vibración y garantizar ensamble perfecto.',
    450.00, 380.00, 280.00, 'Caja de cartón corrugado reforzado para envíos nacionales',
    0.047880, 2.200, 1.800,
    ARRAY['/mpp-brake-disc.png'],
    ARRAY[]::TEXT[],
    true,
    'Por agotarse'
),
(
    'b0000010-0000-0000-0000-000000000010',
    'FAC2008N',
    'Carenaje Completo Pulsar 180 / 220',
    'carenaje-completo-pulsar-180-fac2008n',
    150000.00,
    125000.00,
    125000.00,
    10,
    'Carenajes',
    'Duvox',
    5.0,
    82,
    'Carenaje frontal deportivo con cúpula y soportes para Bajaj Pulsar 180 y 220. Acabado en pintura de alto brillo resistente al sol y calce directo con tornillos originales.',
    480.00, 400.00, 300.00, 'Caja de protección de doble pared con separadores de cartón',
    0.057600, 2.600, 2.100,
    ARRAY['/mpp-brake-disc.png'],
    ARRAY[]::TEXT[],
    true,
    'Por agotarse'
)
ON CONFLICT (sku) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    price = EXCLUDED.price,
    discount_price = EXCLUDED.discount_price,
    wholesale_price = EXCLUDED.wholesale_price,
    stock_qty = EXCLUDED.stock_qty,
    category = EXCLUDED.category,
    brand = EXCLUDED.brand,
    description = EXCLUDED.description,
    length_mm = EXCLUDED.length_mm,
    width_mm = EXCLUDED.width_mm,
    height_mm = EXCLUDED.height_mm,
    package_details = EXCLUDED.package_details,
    cbm_pc = EXCLUDED.cbm_pc,
    gross_weight_kg = EXCLUDED.gross_weight_kg,
    net_weight_kg = EXCLUDED.net_weight_kg,
    status_text = EXCLUDED.status_text,
    is_active = EXCLUDED.is_active;

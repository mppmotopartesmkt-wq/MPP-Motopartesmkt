-- ==============================================================================
-- MPP REPUESTOS PARA MOTOS — SEED PRODUCTS & COUPONS (PRECIOS COLOMBIANOS - COP)
-- Catálogo oficial de productos, precios en pesos colombianos y cupones
-- ==============================================================================

-- 1. Insert Initial Discount Coupon (from Top Banner)
INSERT INTO public.coupons (id, code, discount_type, discount_value, max_uses, current_uses, expires_at, is_active)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'RIDE10', 'percentage', 10.00, 1000, 0, now() + interval '1 year', true),
    ('c2222222-2222-2222-2222-222222222222', 'LIME20', 'percentage', 20.00, 500, 0, now() + interval '1 year', true),
    ('c3333333-3333-3333-3333-333333333333', 'MPP10', 'percentage', 10.00, 1000, 0, now() + interval '1 year', true)
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Products Catalog con Precios en Pesos Colombianos (COP)
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

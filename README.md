# 🏍️ RIDEZ Motorcycle Store — E-Commerce

E-commerce de alto rendimiento para equipamiento, repuestos y accesorios de motociclismo, construido con **React, Vite, TypeScript, Tailwind CSS y Supabase**.

El diseño es una réplica exacta de la tienda de referencia **RIDEZ**, con los acentos de color naranja sustituidos por **Verde Limón (Neon Lime)**.

---

## 🎨 Paleta de Color
- **Color Primario de Acento:** Verde Limón (`#84cc16` / `#a3e635`)
- **Fondo Principal Oscuro:** `#0a0a0c` / `#111114`
- **Fondo de Catálogo:** Blanco y gris claro para máxima visibilidad de productos

---

## 🏗️ Arquitectura del Proyecto

```
MMP/
├── src/
│   ├── components/       # Componentes modulares de UI
│   │   ├── TopAnnouncementBar.tsx  # Barra superior con cupón RIDE10
│   │   ├── Navbar.tsx              # Logo con alas de velocidad, enlaces y badge
│   │   ├── Hero.tsx                # Hero banner "BUILT FOR RIDERS." en verde limón
│   │   ├── ValuePropsBar.tsx       # 5 pilares de garantía y confianza
│   │   ├── ShopByCategory.tsx      # 8 categorías circulares con "Shop Now"
│   │   ├── BestSellers.tsx         # Carrusel con los 6 productos de la imagen
│   │   ├── ProductCard.tsx         # Tarjeta de producto con estrellas y reviews
│   │   ├── PromoBanners.tsx        # Banners duales "UP TO 20% OFF"
│   │   ├── BrandsBar.tsx           # Logos de marcas oficiales
│   │   ├── Footer.tsx              # Footer completo con pasarelas de pago
│   │   ├── CartDrawer.tsx          # Carrito deslizable con barra de envío gratis
│   │   ├── CheckoutModal.tsx       # Checkout transaccional con datos DIAN
│   │   ├── ProductDetailModal.tsx  # Modal de producto con specs de importación
│   │   ├── SearchModal.tsx         # Buscador en tiempo real
│   │   └── ProfileModal.tsx        # Gestor de perfil y simulador de roles RLS
│   ├── context/
│   │   ├── CartContext.tsx         # Estado global del carrito y cupones
│   │   └── AuthContext.tsx         # Estado global de usuario y roles
│   ├── pages/
│   │   └── Home.tsx                # Página principal completa
│   ├── services/
│   │   ├── supabase.ts             # Cliente de conexión con Supabase
│   │   └── api.ts                  # Servicios RPC, catálogo y validación
│   ├── types/
│   │   └── index.ts                # Modelos y contratos de TypeScript
│   ├── utils/
│   │   └── format.ts               # Formateador de moneda y consecutivos
│   ├── App.tsx                     # Componente raíz
│   ├── main.tsx                    # Punto de entrada
│   └── index.css                   # Tailwind CSS y fuentes
├── supabase/
│   ├── schema.sql                  # DDL de tablas, RLS y función RPC process_checkout
│   ├── seed_products.sql           # Semillas con los productos del catálogo
│   └── products_inventory_seed.csv # Semilla en formato CSV
├── .env.example
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## ⚡ Base de Datos (Supabase / PostgreSQL)

1. **`profiles`**: Extensión de usuarios autenticados con datos DIAN (CC, NIT, teléfono, dirección).
2. **`products`**: Catálogo e inventario con especificaciones logísticas (dimensiones en mm, pesos bruto/neto, CBM).
3. **`coupons`**: Cupones de descuento (`RIDE10` para 10% OFF, `LIME20` para 20% OFF).
4. **`orders`** y **`order_items`**: Pedidos y líneas de compra.
5. **`payments`**: Registro de pagos y abonos (PSE, Wompi, Bancolombia, etc.).
6. **RPC `process_checkout`**:
   - Bloqueo pesimista `SELECT ... FOR UPDATE` para prevenir sobreventas concurrentes.
   - Validación atómica de inventario `stock_qty >= quantity`.
   - Descuento de existencias directo en PostgreSQL.

---

## 🚀 Cómo Ejecutar el Proyecto

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build
```

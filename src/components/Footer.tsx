import React from 'react';
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  Instagram,
  Facebook,
  Youtube,
  Zap,
} from 'lucide-react';

interface FooterProps {
  onSelectCategory: (category: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory }) => {
  return (
    <footer className="bg-dark-950 text-gray-400 text-xs border-t border-dark-800">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* COL 1: LOGO & ABOUT */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center">
              <img
                src="/mpp-logo.png"
                alt="MPP Repuestos para Motos"
                className="h-14 sm:h-16 w-auto object-contain"
              />
            </div>

            <p className="text-gray-400 text-xs leading-relaxed">
              Tu tienda definitiva para repuestos, accesorios y equipamiento prémium para motos. Calidad y pasión sobre dos ruedas.
            </p>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#facebook"
                className="w-8 h-8 rounded-full bg-dark-900 border border-dark-800 flex items-center justify-center text-gray-400 hover:text-lime hover:border-lime transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#instagram"
                className="w-8 h-8 rounded-full bg-dark-900 border border-dark-800 flex items-center justify-center text-gray-400 hover:text-lime hover:border-lime transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#youtube"
                className="w-8 h-8 rounded-full bg-dark-900 border border-dark-800 flex items-center justify-center text-gray-400 hover:text-lime hover:border-lime transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="#tiktok"
                className="w-8 h-8 rounded-full bg-dark-900 border border-dark-800 flex items-center justify-center text-gray-400 hover:text-lime hover:border-lime transition-colors"
                aria-label="TikTok"
              >
                <Zap className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* COL 2: TIENDA */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-wider mb-4">
              TIENDA
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: 'Cascos', cat: 'Helmets' },
                { name: 'Equipación', cat: 'Riding Gear' },
                { name: 'Guantes', cat: 'Gloves' },
                { name: 'Repuestos', cat: 'Parts' },
                { name: 'Accesorios', cat: 'Accessories' },
                { name: 'Llantas', cat: 'Tires' },
                { name: 'Mantenimiento', cat: 'Maintenance' },
                { name: 'Ofertas Especiales', cat: 'Sale' },
              ].map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => onSelectCategory(item.cat)}
                    className={`hover:text-lime transition-colors text-left ${
                      item.cat === 'Sale' ? 'text-lime font-bold' : 'text-gray-400'
                    }`}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 3: SERVICIO AL CLIENTE */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-wider mb-4">
              SERVICIO AL CLIENTE
            </h4>
            <ul className="space-y-2.5">
              {[
                'Centro de Ayuda',
                'Envíos y Entregas',
                'Devoluciones y Reembolsos',
                'Rastrear Pedido',
                'Guía de Tallas',
                'Contáctanos',
              ].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-lime transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 4: EMPRESA */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-wider mb-4">
              EMPRESA
            </h4>
            <ul className="space-y-2.5">
              {[
                'Sobre Nosotros',
                'Blog Motero',
                'Trabaja con Nosotros',
                'Política de Privacidad',
                'Términos y Condiciones',
              ].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-lime transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 5: MINI SELLOS DE CONFIANZA */}
          <div className="space-y-5 border-t lg:border-t-0 pt-6 lg:pt-0 border-dark-800">
            <div className="flex items-start gap-3">
              <Truck className="w-4 h-4 text-lime shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-bold text-xs uppercase tracking-wider">
                  ENVÍO GRATIS
                </p>
                <p className="text-[11px] text-gray-500">En pedidos mayores a $250.000</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <RotateCcw className="w-4 h-4 text-lime shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-bold text-xs uppercase tracking-wider">
                  DEVOLUCIONES FÁCILES
                </p>
                <p className="text-[11px] text-gray-500">30 Días sin Complicaciones</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-lime shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-bold text-xs uppercase tracking-wider">
                  PAGO SEGURO
                </p>
                <p className="text-[11px] text-gray-500">100% Protegido y Confiable</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Headphones className="w-4 h-4 text-lime shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-bold text-xs uppercase tracking-wider">
                  SOPORTE EXPERTO
                </p>
                <p className="text-[11px] text-gray-500">Estamos para Ayudarte</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Legal & Payment Icons */}
      <div className="border-t border-dark-800 py-6 px-4 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-[11px] text-center sm:text-left">
            © 2024 MPP Repuestos para Motos. Todos los derechos reservados.
          </p>

          {/* Payment Badges */}
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-dark-900 border border-dark-800 rounded text-[11px] font-black text-white tracking-widest">
              VISA
            </span>
            <span className="px-2.5 py-1 bg-dark-900 border border-dark-800 rounded text-[11px] font-black text-red-400">
              MC
            </span>
            <span className="px-2.5 py-1 bg-dark-900 border border-dark-800 rounded text-[11px] font-bold text-blue-400">
              AMEX
            </span>
            <span className="px-2.5 py-1 bg-dark-900 border border-dark-800 rounded text-[11px] font-bold text-sky-400">
              PayPal
            </span>
            <span className="px-2.5 py-1 bg-dark-900 border border-dark-800 rounded text-[11px] font-bold text-gray-200">
              Apple Pay
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { Truck, Tag, RotateCcw } from 'lucide-react';

export const TopAnnouncementBar: React.FC = () => {
  return (
    <div className="bg-black text-gray-300 text-xs py-2 px-4 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-lime" />
          <span className="font-medium tracking-wide">ENVÍO GRATIS EN PEDIDOS SUPERIORES A $250.000</span>
        </div>

        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-lime" />
          <span>
            <strong className="text-white">10% DE DESCUENTO</strong> EN TU PRIMER PEDIDO | CÓDIGO:{' '}
            <span className="bg-lime/20 text-lime font-bold px-1.5 py-0.5 rounded border border-lime/30 tracking-wider">
              RIDE10
            </span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5 text-lime" />
          <span className="font-medium tracking-wide">DEVOLUCIONES FÁCILES EN 30 DÍAS</span>
        </div>
      </div>
    </div>
  );
};

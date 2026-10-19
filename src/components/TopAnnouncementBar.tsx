import React from 'react';
import { Truck, Tag, RotateCcw } from 'lucide-react';

export const TopAnnouncementBar: React.FC = () => {
  return (
    <div className="bg-gray-100 text-gray-700 text-xs py-2 px-4 border-b border-gray-200 font-medium">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-black" />
          <span className="font-bold tracking-wide text-gray-900">ENVÍO GRATIS EN PEDIDOS SUPERIORES A $250.000</span>
        </div>

        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-black" />
          <span>
            <strong className="text-black font-black">10% DE DESCUENTO</strong> EN TU PRIMER PEDIDO | CÓDIGO:{' '}
            <span className="bg-lime text-black font-black px-1.5 py-0.5 rounded border border-black/10 tracking-wider">
              RIDE10
            </span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5 text-black" />
          <span className="font-semibold tracking-wide text-gray-700">DEVOLUCIONES FÁCILES EN 30 DÍAS</span>
        </div>
      </div>
    </div>
  );
};

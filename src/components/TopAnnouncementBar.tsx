import React from 'react';
import { Truck, RotateCcw } from 'lucide-react';

export const TopAnnouncementBar: React.FC = () => {
  return (
    <div className="bg-gray-100 text-gray-700 text-xs py-2 px-4 border-b border-gray-200 font-medium">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-black" />
          <span className="font-bold tracking-wide text-gray-900">ENVÍO GRATIS EN PEDIDOS SUPERIORES A $250.000</span>
        </div>

        <div className="flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5 text-black" />
          <span className="font-semibold tracking-wide text-gray-700">DEVOLUCIONES FÁCILES EN 30 DÍAS</span>
        </div>
      </div>
    </div>
  );
};

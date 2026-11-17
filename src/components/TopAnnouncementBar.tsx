import React from 'react';
import { Truck } from 'lucide-react';

export const TopAnnouncementBar: React.FC = () => {
  return (
    <div className="bg-gray-100 text-gray-700 text-xs py-2 px-4 border-b border-gray-200 font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
        <Truck className="w-3.5 h-3.5 text-black" />
        <span className="font-bold tracking-wide text-gray-900">ENVÍO GRATIS EN PEDIDOS SUPERIORES A $250.000</span>
      </div>
    </div>
  );
};

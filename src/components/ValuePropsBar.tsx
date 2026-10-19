import React from 'react';
import { Truck, ShieldCheck, Award, RotateCcw, Headphones } from 'lucide-react';

export const ValuePropsBar: React.FC = () => {
  const props = [
    {
      icon: Truck,
      title: 'ENVÍO GRATIS',
      subtitle: 'En pedidos mayores a $250.000',
    },
    {
      icon: ShieldCheck,
      title: 'PAGO SEGURO',
      subtitle: '100% Protegido y Confiable',
    },
    {
      icon: Award,
      title: 'CALIDAD PRÉMIUM',
      subtitle: 'Solo Primeras Marcas',
    },
    {
      icon: RotateCcw,
      title: 'DEVOLUCIONES FÁCILES',
      subtitle: '30 Días sin Complicaciones',
    },
    {
      icon: Headphones,
      title: 'SOPORTE EXPERTO',
      subtitle: 'Estamos para Ayudarte',
    },
  ];

  return (
    <section className="bg-white border-b border-gray-100 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-4">
          {props.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3.5 group transition-transform duration-200"
              >
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 group-hover:text-black group-hover:bg-lime/20 group-hover:border-lime transition-all shrink-0">
                  <Icon className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 group-hover:text-black transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

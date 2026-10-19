import React, { useState } from 'react';
import { Search, User, ShoppingBag, Menu, X, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  onSelectCategory: (category: string) => void;
  onNavigateToAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenProfile,
  onSelectCategory,
  onNavigateToAdmin,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'TANQUES', category: 'Tanques' },
    { name: 'FAROLAS', category: 'Farolas' },
    { name: 'DEFENSAS', category: 'Defensas' },
    { name: 'ESPEJOS', category: 'Espejos' },
    { name: 'CARENAJES', category: 'Carenajes' },
    { name: 'FRENOS', category: 'Frenos' },
    { name: 'OFERTAS', category: 'Sale', isSpecial: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO MPP */}
          <div
            className="flex items-center gap-3 cursor-pointer group py-2"
            onClick={() => onSelectCategory('All')}
          >
            <img
              src="/mpp-logo-dark.png"
              alt="MPP Repuestos para Motos"
              className="h-14 sm:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => onSelectCategory(link.category)}
                className={`text-xs font-black tracking-wider transition-all uppercase py-1 ${
                  link.isSpecial
                    ? 'bg-lime text-black px-2.5 py-1 rounded-full text-[11px] hover:bg-lime-bright shadow-xs'
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Admin Dashboard Quick Button */}
            {onNavigateToAdmin && (
              <button
                onClick={onNavigateToAdmin}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xs"
                title="Panel de Administración MPP"
              >
                <Shield className="w-3.5 h-3.5 text-lime" />
                <span>Panel Admin</span>
              </button>
            )}

            {/* Search Icon */}
            <button
              onClick={onOpenSearch}
              className="text-gray-700 hover:text-black p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Buscar productos"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Profile / Account Icon */}
            <button
              onClick={onOpenProfile}
              className="text-gray-700 hover:text-black p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              title={profile ? `Perfil: ${profile.full_name}` : 'Mi Cuenta'}
              aria-label="Mi Cuenta"
            >
              <User className="w-5 h-5" />
              {profile && (
                <span className="absolute bottom-1.5 right-1.5 w-2 h-2 bg-lime rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Cart Icon with Lime Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-gray-900 hover:text-black p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              title="Carrito de compras"
              aria-label="Carrito de compras"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-lime text-black font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {totalItems}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-800 hover:text-black p-2"
              aria-label="Menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {onNavigateToAdmin && (
            <button
              onClick={() => {
                onNavigateToAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 text-xs font-black uppercase rounded-lg bg-black text-white flex items-center gap-2 mb-3 shadow-xs"
            >
              <Shield className="w-4 h-4 text-lime" />
              <span>Acceder a Panel Admin</span>
            </button>
          )}

          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                onSelectCategory(link.category);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-2 px-3 text-sm font-bold uppercase rounded-lg transition-colors ${
                link.isSpecial
                  ? 'text-black bg-lime font-black'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-black'
              }`}
            >
              {link.name}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

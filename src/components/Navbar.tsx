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
    <header className="sticky top-0 z-40 bg-black border-b border-neutral-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO MPP */}
          <div
            className="flex items-center gap-3 cursor-pointer group py-2"
            onClick={() => onSelectCategory('All')}
          >
            <img
              src="/mpp-logo.png"
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
                className={`text-xs font-bold tracking-wider transition-all uppercase py-1 ${
                  link.isSpecial
                    ? 'text-lime hover:text-lime-bright drop-shadow-[0_0_8px_rgba(132,204,22,0.5)]'
                    : 'text-gray-300 hover:text-lime'
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3 sm:gap-5">
            
            {/* Admin Dashboard Quick Button */}
            {onNavigateToAdmin && (
              <button
                onClick={onNavigateToAdmin}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime/10 hover:bg-lime text-lime hover:text-black border border-lime/30 font-black text-xs uppercase tracking-wider transition-all shadow-sm"
                title="Panel de Administración MPP"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Panel Admin</span>
              </button>
            )}

            {/* Search Icon */}
            <button
              onClick={onOpenSearch}
              className="text-gray-300 hover:text-lime p-2 rounded-full hover:bg-dark-800 transition-colors"
              title="Buscar productos"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Profile / Account Icon */}
            <button
              onClick={onOpenProfile}
              className="text-gray-300 hover:text-lime p-2 rounded-full hover:bg-dark-800 transition-colors relative"
              title={profile ? `Perfil: ${profile.full_name}` : 'Mi Cuenta'}
              aria-label="Mi Cuenta"
            >
              <User className="w-5 h-5" />
              {profile && (
                <span className="absolute bottom-1.5 right-1.5 w-2 h-2 bg-lime rounded-full ring-2 ring-dark-900" />
              )}
            </button>

            {/* Cart Icon with Lime Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-gray-300 hover:text-lime p-2 rounded-full hover:bg-dark-800 transition-colors relative"
              title="Carrito de compras"
              aria-label="Carrito de compras"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-lime text-black font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-lime/30">
                {totalItems}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-300 hover:text-lime p-2"
              aria-label="Menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-dark-950 border-b border-dark-800 px-4 pt-3 pb-6 space-y-2">
          {onNavigateToAdmin && (
            <button
              onClick={() => {
                onNavigateToAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 text-xs font-black uppercase rounded bg-lime text-black flex items-center gap-2 mb-3"
            >
              <Shield className="w-4 h-4" />
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
              className={`block w-full text-left py-2 px-3 text-sm font-bold uppercase rounded ${
                link.isSpecial
                  ? 'text-lime bg-lime/10'
                  : 'text-gray-300 hover:bg-dark-800 hover:text-lime'
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

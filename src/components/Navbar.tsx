import React, { useState } from 'react';
import { Search, User, ShoppingBag, Menu, X, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  onSelectCategory: (category: string) => void;
  onNavigateToAdmin?: () => void;
  activeNav?: 'inicio' | 'tienda' | 'contacto';
  onNavChange?: (nav: 'inicio' | 'tienda' | 'contacto') => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onExecuteSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenProfile,
  onSelectCategory,
  onNavigateToAdmin,
  activeNav = 'tienda',
  onNavChange,
  searchQuery = '',
  onSearchChange,
  onExecuteSearch,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (nav: 'inicio' | 'tienda' | 'contacto') => {
    if (onNavChange) {
      onNavChange(nav);
    }
    if (nav === 'tienda') {
      onSelectCategory('All');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* 1. LOGO MPR (Matches Ferreinter position on the left) */}
          <div
            className="flex items-center gap-2 cursor-pointer group py-1 shrink-0"
            onClick={() => handleNavClick('tienda')}
          >
            <img
              src="/mpr-logo-dark.png"
              alt="MPR Motopartes y Repuestos"
              className="h-9 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* 2. CENTER NAVIGATION: INICIO | TIENDA | CONTACTO (As in reference image) */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <button
              onClick={() => handleNavClick('inicio')}
              className={`text-xs font-black tracking-wider uppercase transition-all px-3 py-1.5 ${
                activeNav === 'inicio'
                  ? 'border border-black rounded-full text-black bg-transparent'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              INICIO
            </button>

            <button
              onClick={() => handleNavClick('tienda')}
              className={`text-xs font-black tracking-wider uppercase transition-all px-4 py-1.5 ${
                activeNav === 'tienda'
                  ? 'border border-black rounded-full text-black bg-transparent shadow-2xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              TIENDA
            </button>

            <button
              onClick={() => handleNavClick('contacto')}
              className={`text-xs font-black tracking-wider uppercase transition-all px-3 py-1.5 ${
                activeNav === 'contacto'
                  ? 'border border-black rounded-full text-black bg-transparent'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              CONTACTO
            </button>
          </nav>

          {/* 3. RIGHT SECTION: PILL SEARCH BAR + USER + CART + ADMIN */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Pill Search Input with Internal [Q BUSCAR] button (As in reference image) */}
            <div className="hidden sm:flex items-center bg-gray-100/90 rounded-full pl-3.5 pr-1 py-1 border border-gray-200/60 focus-within:border-black focus-within:bg-white transition-all w-52 md:w-64 lg:w-72 shadow-2xs">
              <input
                type="text"
                placeholder="Buscar repuestos..."
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && onExecuteSearch) {
                    onExecuteSearch();
                  }
                }}
                className="bg-transparent text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none w-full"
              />
              <button
                onClick={onExecuteSearch || onOpenSearch}
                className="bg-black hover:bg-neutral-800 text-white rounded-full px-3 py-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs transition-colors shrink-0"
              >
                <Search className="w-3 h-3 text-lime" />
                <span>Buscar</span>
              </button>
            </div>

            {/* Mobile search trigger */}
            <button
              onClick={onOpenSearch}
              className="sm:hidden text-gray-700 hover:text-black p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Buscar productos"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Admin Dashboard Quick Button */}
            {onNavigateToAdmin && (
              <button
                onClick={onNavigateToAdmin}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black hover:bg-neutral-800 text-white font-black text-[11px] uppercase tracking-wider transition-all shadow-xs"
                title="Panel de Administración MPR"
              >
                <Shield className="w-3 h-3 text-lime" />
                <span>Admin</span>
              </button>
            )}

            {/* User Account Icon */}
            <button
              onClick={onOpenProfile}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 hover:text-black transition-colors relative shadow-2xs"
              title={profile ? `Perfil: ${profile.full_name}` : 'Mi Cuenta'}
              aria-label="Mi Cuenta"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              {profile && (
                <span className="absolute bottom-1 right-1 w-2 h-2 bg-lime rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Cart Button (Clean rounded box with shopping bag & counter) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-black hover:bg-neutral-800 text-white flex items-center justify-center relative shadow-xs transition-all hover:scale-105 active:scale-95"
              title="Carrito de compras"
              aria-label="Carrito de compras"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-lime" />
              <span className="absolute -top-1 -right-1 bg-lime text-black font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {totalItems}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-800 hover:text-black p-2"
              aria-label="Menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 space-y-2 shadow-lg">
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

          <div className="flex flex-col gap-1 pb-2 border-b border-gray-100 mb-2">
            <button
              onClick={() => {
                handleNavClick('inicio');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2 px-3 text-xs font-black uppercase rounded-lg ${
                activeNav === 'inicio' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => {
                handleNavClick('tienda');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2 px-3 text-xs font-black uppercase rounded-lg ${
                activeNav === 'tienda' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tienda / Catálogo
            </button>
            <button
              onClick={() => {
                handleNavClick('contacto');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2 px-3 text-xs font-black uppercase rounded-lg ${
                activeNav === 'contacto' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Contacto
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

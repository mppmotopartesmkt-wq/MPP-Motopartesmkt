import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Coupon } from '../types';
import { validateCoupon } from '../services/api';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  coupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  discountAmount: number;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ridez_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem('ridez_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ridez_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('ridez_cart', JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  useEffect(() => {
    try {
      if (coupon) {
        localStorage.setItem('ridez_coupon', JSON.stringify(coupon));
      } else {
        localStorage.removeItem('ridez_coupon');
      }
    } catch (e) {
      console.error(e);
    }
  }, [coupon]);

  useEffect(() => {
    try {
      localStorage.setItem('ridez_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock_qty || 99);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock_qty || 99) }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock_qty || 99) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const applyCoupon = async (code: string) => {
    const validCoupon = await validateCoupon(code);
    if (!validCoupon) {
      return { success: false, message: 'Cupón no válido o expirado.' };
    }
    setCoupon(validCoupon);
    return {
      success: true,
      message: `¡Cupón ${validCoupon.code} aplicado con éxito (${
        validCoupon.discount_type === 'percentage'
          ? `${validCoupon.discount_value}% OFF`
          : `$${validCoupon.discount_value} OFF`
      })!`,
    };
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = items.reduce((acc, item) => {
    const unitPrice = item.product.discount_price ?? item.product.price;
    return acc + unitPrice * item.quantity;
  }, 0);

  let discountAmount = 0;
  if (coupon) {
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round(subtotal * (coupon.discount_value / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(subtotal, coupon.discount_value);
    }
  }

  const totalAmount = Math.max(0, subtotal - discountAmount);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        coupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

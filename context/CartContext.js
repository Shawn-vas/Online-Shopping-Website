'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import productsData from '@/data/products.json';
import couponsData from '@/data/coupons.json';
import historyData from '@/data/purchase-history.json';
import { optimizeDiscounts } from '@/lib/algorithms/greedy';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [discountInfo, setDiscountInfo] = useState({
    appliedCoupons: [],
    discountAmount: 0,
    finalTotal: 0,
    breakdown: []
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('luxe_cart');
    const savedWishlist = localStorage.getItem('luxe_wishlist');
    
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart from localStorage', e);
      }
    }
    
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error('Error parsing wishlist from localStorage', e);
      }
    }
  }, []);

  // Save to localStorage whenever cart/wishlist change + run Greedy Discount Optimizer
  useEffect(() => {
    localStorage.setItem('luxe_cart', JSON.stringify(cart));
    
    // Auto-run greedy discount optimizer
    const result = optimizeDiscounts(cart, couponsData);
    setDiscountInfo(result);
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('luxe_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Actions
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (product) => {
    setWishlist(prevWishlist => {
      const exists = prevWishlist.some(item => item.id === product.id);
      if (exists) {
        return prevWishlist.filter(item => item.id !== product.id);
      } else {
        return [...prevWishlist, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        discountInfo,
        products: productsData,
        coupons: couponsData,
        purchaseHistory: historyData,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        subtotal: getSubtotal()
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

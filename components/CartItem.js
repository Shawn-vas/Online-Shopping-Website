'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, Trash2 } from 'lucide-react';
import styles from './CartItem.module.css';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  const hasDiscount = item.discount > 0;
  const singlePrice = hasDiscount 
    ? Math.round(item.price * (1 - item.discount / 100))
    : item.price;
  
  const itemTotal = singlePrice * item.quantity;

  return (
    <div className={styles.itemRow}>
      {/* Product Image */}
      <div className={styles.imageContainer}>
        <img src={item.image} alt={item.name} className={styles.image} />
      </div>

      {/* Product Details */}
      <div className={styles.details}>
        <span className={styles.category}>{item.category}</span>
        <Link href={`/product/${item.id}`} className={styles.name}>
          {item.name}
        </Link>
        <span className={styles.singlePrice}>
          ₹{singlePrice.toLocaleString('en-IN')} each
        </span>
      </div>

      {/* Quantity Selector */}
      <div className={styles.quantityControls}>
        <button 
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className={styles.qtyBtn}
          aria-label="Decrease quantity"
        >
          <Minus size={14} />
        </button>
        <span className={styles.qtyDisplay}>{item.quantity}</span>
        <button 
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className={styles.qtyBtn}
          aria-label="Increase quantity"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Price Subtotal */}
      <div className={styles.priceSection}>
        <span className={styles.totalPrice}>
          ₹{itemTotal.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Action Remove */}
      <button 
        onClick={() => removeFromCart(item.id)}
        className={styles.removeBtn}
        aria-label="Remove item"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

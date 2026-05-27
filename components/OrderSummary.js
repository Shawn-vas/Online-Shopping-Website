'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import styles from './OrderSummary.module.css';

export default function OrderSummary({ onCheckout }) {
  const { subtotal, discountInfo } = useCart();
  const { discountAmount, finalTotal, breakdown } = discountInfo;
  
  // Luxury brand: shipping is complimentary!
  const shipping = 0; 
  const grandTotal = finalTotal + shipping;

  return (
    <div className={`${styles.card} glass-panel`}>
      <h3 className={`${styles.title} text-label-caps`}>Order Summary</h3>

      <div className={styles.divider}></div>

      <div className={styles.row}>
        <span>Subtotal</span>
        <span>₹{subtotal.toLocaleString('en-IN')}</span>
      </div>

      {discountAmount > 0 && (
        <>
          <div className={`${styles.row} ${styles.discountRow}`}>
            <span>Coupon Discount</span>
            <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
          </div>

          {/* Greedy optimization breakdown */}
          <div className={styles.breakdownContainer}>
            {breakdown.map((item, idx) => (
              <div key={idx} className={styles.breakdownItem}>
                <span className={styles.code}>{item.code} applied</span>
                <span className={styles.savings}>- ₹{item.savings.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className={styles.row}>
        <span>Shipping</span>
        <span className={styles.shippingVal}>Complimentary</span>
      </div>

      <div className={styles.divider}></div>

      <div className={`${styles.row} ${styles.totalRow}`}>
        <span>Total</span>
        <span className={styles.totalPrice}>₹{grandTotal.toLocaleString('en-IN')}</span>
      </div>

      <button 
        onClick={onCheckout}
        disabled={subtotal === 0}
        className={`${styles.checkoutBtn} btn-primary`}
      >
        Proceed to Checkout
      </button>

      <p className={styles.notice}>
        Tax included where applicable. Complimentary signature packaging included.
      </p>
    </div>
  );
}

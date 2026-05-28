'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import CartItem from '@/components/CartItem';
import OrderSummary from '@/components/OrderSummary';
import { ShoppingBag, ArrowLeft, Ticket, Check } from 'lucide-react';
import styles from './page.module.css';

export default function Cart() {
  const router = useRouter();
  const { cart, coupons, discountInfo, clearCart } = useCart();
  const { appliedCoupons } = discountInfo;

  const handleCheckout = () => {
    router.push('/checkout');
  };


  if (cart.length === 0) {
    return (
      <div className={`${styles.emptyContainer} container section-padding`}>
        <ShoppingBag size={48} className={styles.emptyIcon} />
        <h1 className="text-headline-lg" style={{ marginBottom: '20px' }}>
          Your Bag is Empty
        </h1>
        <p className={styles.emptyText}>
          Select from our curated collections to add items to your shopping bag.
        </p>
        <Link href="/shop" className="btn-primary" style={{ marginTop: '24px' }}>
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className={`${styles.cartContainer} container section-padding`}>
      {/* Back link */}
      <div className={styles.backWrapper}>
        <Link href="/shop" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to Collections</span>
        </Link>
      </div>

      <h1 className={`${styles.title} text-headline-lg`}>Your Shopping Bag</h1>

      <div className={styles.layoutGrid}>
        {/* Left Column: Cart items list + Coupons Info */}
        <div className={styles.itemsColumn}>
          <div className={styles.itemsList}>
            {cart.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* Autocoupon Info box */}
          <div className={styles.couponWidget}>
            <div className={styles.couponHeader}>
              <Ticket size={18} className={styles.ticketIcon} />
              <h3 className={`${styles.couponTitle} text-label-caps`}>Complimentary Savings</h3>
            </div>
            <p className={styles.couponDesc}>
              No need to guess code stackings. Our system automatically reviews available offers and applies the most optimal combination to maximize your discounts.
            </p>
            <div className={styles.couponList}>
              {coupons.map((coupon, idx) => {
                const isActive = appliedCoupons.includes(coupon.code);
                return (
                  <div 
                    key={idx} 
                    className={`${styles.couponCard} ${isActive ? styles.couponCardActive : ''}`}
                  >
                    <span className={styles.couponCode}>{coupon.code}</span>
                    <span className={styles.couponDetails}>
                      {coupon.category === 'all' ? 'Storewide' : coupon.category} &bull;{' '}
                      {coupon.type === 'percentage' ? `${coupon.value}% Off` : `₹${coupon.value} Off`}
                    </span>
                    {isActive && <span className={styles.activeTag}>Applied</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className={styles.summaryColumn}>
          <OrderSummary onCheckout={handleCheckout} />
        </div>
      </div>
    </div>
  );
}

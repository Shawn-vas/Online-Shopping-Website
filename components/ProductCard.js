'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const wishlisted = isInWishlist(product.id);

  const hasDiscount = product.discount > 0;
  const discountedPrice = hasDiscount 
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div className={styles.card}>
      <Link href={`/product/${product.id}`} className={styles.link}>
        {/* Image Container with Hover zoom */}
        <div className={styles.imageContainer}>
          <img 
            src={product.image} 
            alt={product.name} 
            className={styles.image} 
            loading="lazy"
          />
          {/* Wishlist Heart Overlay */}
          <button 
            onClick={handleWishlistClick}
            className={`${styles.wishlistButton} ${wishlisted ? styles.wishlisted : ''}`}
            aria-label="Add to wishlist"
          >
            <Heart size={18} fill={wishlisted ? 'var(--primary)' : 'none'} />
          </button>

          {/* Discount Badge */}
          {hasDiscount && (
            <span className={styles.discountBadge}>-{product.discount}%</span>
          )}
        </div>

        {/* Info */}
        <div className={styles.info}>
          <div className={styles.meta}>
            <span className={styles.category}>{product.category}</span>
            <span className={styles.rating}>
              <Star size={12} fill="var(--primary)" color="var(--primary)" />
              {product.rating.toFixed(1)}
            </span>
          </div>

          <h3 className={styles.title}>{product.name}</h3>

          <div className={styles.footerRow}>
            <div className={styles.priceContainer}>
              {hasDiscount ? (
                <>
                  <span className={styles.originalPrice}>₹{product.price.toLocaleString('en-IN')}</span>
                  <span className={styles.price}>₹{discountedPrice.toLocaleString('en-IN')}</span>
                </>
              ) : (
                <span className={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
              )}
            </div>

            <button 
              onClick={handleAddToCartClick}
              className={styles.cartButton}
              aria-label="Add to bag"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

'use client';

import React from 'react';
import ProductCard from './ProductCard';
import styles from './ProductGrid.module.css';

export default function ProductGrid({ products, emptyMessage = 'No products found.' }) {
  if (!products || products.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.emptyText}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

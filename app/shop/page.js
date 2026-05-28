'use client';

import React, { useState, useEffect, use } from 'react';
import { useCart } from '@/context/CartContext';
import { sortProducts, quickSort } from '@/lib/algorithms/sorting';
import { binarySearchRange } from '@/lib/algorithms/searching';
import ProductGrid from '@/components/ProductGrid';
import SortDropdown from '@/components/SortDropdown';
import styles from './page.module.css';

export default function Shop({ searchParams }) {
  // Unwrap searchParams since it's a promise in Next.js 15
  const resolvedSearchParams = use(searchParams);
  const initialCategory = resolvedSearchParams?.category || 'all';

  const { products } = useCart();
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000000);
  const [sortOption, setSortOption] = useState({ key: 'name', order: 'asc' });
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Sync category if searchParams change (e.g. clicking category link from home page or footer)
  useEffect(() => {
    if (resolvedSearchParams?.category) {
      setCategory(resolvedSearchParams.category);
    } else {
      setCategory('all');
    }
  }, [resolvedSearchParams]);

  // Apply DSA searches/sorts whenever parameters change
  useEffect(() => {
    if (!products || products.length === 0) return;

    // 1. First, sort products by price to prepare for binary search range query
    const priceSorted = quickSort(products, 'price', 'asc');

    // 2. O(log n) Range query to find products in [minPrice, maxPrice]
    let rangeFiltered = binarySearchRange(priceSorted, minPrice, maxPrice, 'price');

    // 3. Filter by category if selected (linear filtering on category key)
    if (category !== 'all') {
      rangeFiltered = rangeFiltered.filter(p => p.category === category);
    }

    // 4. Sort the products using our sorting algorithm dispatcher (Quick, Merge, Heap)
    // Internally:
    // - Name sorting uses Merge Sort
    // - Price sorting uses Quick Sort
    // - Ratings sorting uses Heap Sort
    const finalSorted = sortProducts(rangeFiltered, sortOption.key, sortOption.order);

    setFilteredProducts(finalSorted);
  }, [products, category, minPrice, maxPrice, sortOption]);

  const categories = ['all', 'Watches', 'Shoes', 'Perfumes', 'Jackets', 'Wallets', 'Handbags'];

  return (
    <div className={`${styles.shopContainer} container section-padding`}>
      {/* Sidebar Filter Panel */}
      <aside className={styles.sidebar}>
        {/* Category Filter */}
        <div className={styles.widget}>
          <h3 className={`${styles.widgetTitle} text-label-caps`}>Categories</h3>
          <ul className={styles.filterList}>
            {categories.map((cat, idx) => (
              <li key={idx}>
                <button 
                  onClick={() => setCategory(cat)}
                  className={`${styles.filterBtn} ${category === cat ? styles.filterBtnActive : ''}`}
                >
                  {cat === 'all' ? 'All Collections' : cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Price Filter Panel */}
        <div className={styles.widget}>
          <h3 className={`${styles.widgetTitle} text-label-caps`}>Price Range</h3>
          <div className={styles.priceInputs}>
            <div className={styles.priceInputWrapper}>
              <span className={styles.currencySymbol}>₹</span>
              <input 
                type="number" 
                value={minPrice === 0 ? '' : minPrice} 
                placeholder="Min"
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className={styles.priceInput}
              />
            </div>
            <span className={styles.priceSeparator}>to</span>
            <div className={styles.priceInputWrapper}>
              <span className={styles.currencySymbol}>₹</span>
              <input 
                type="number" 
                value={maxPrice === 2000000 ? '' : maxPrice} 
                placeholder="Max"
                onChange={(e) => setMaxPrice(e.target.value === '' ? 2000000 : Number(e.target.value))}
                className={styles.priceInput}
              />
            </div>
          </div>
          <div className={styles.pricePresets}>
            <button onClick={() => { setMinPrice(0); setMaxPrice(50000); }} className={styles.presetBtn}>Under ₹50k</button>
            <button onClick={() => { setMinPrice(50000); setMaxPrice(150000); }} className={styles.presetBtn}>₹50k - ₹150k</button>
            <button onClick={() => { setMinPrice(150000); setMaxPrice(500000); }} className={styles.presetBtn}>₹150k - ₹500k</button>
            <button onClick={() => { setMinPrice(500000); setMaxPrice(2000000); }} className={styles.presetBtn}>₹500k+</button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.catalog}>
        <div className={styles.catalogHeader}>
          <div>
            <h1 className="text-headline-md" style={{ textTransform: 'capitalize' }}>
              {category === 'all' ? 'All Collections' : category}
            </h1>
            <p className={styles.itemCount}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
            </p>
          </div>

          <SortDropdown value={sortOption} onChange={setSortOption} />
        </div>

        <ProductGrid 
          products={filteredProducts} 
          emptyMessage="No products match your filter parameters."
        />
      </main>
    </div>
  );
}

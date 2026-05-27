'use client';

import React, { use, useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { searchProductsByName } from '@/lib/algorithms/searching';
import ProductGrid from '@/components/ProductGrid';
import SearchBar from '@/components/SearchBar';
import styles from './page.module.css';

export default function Search({ searchParams }) {
  // Unwrap searchParams since it's a promise in Next.js 15
  const resolvedSearchParams = use(searchParams);
  const query = resolvedSearchParams?.q || '';

  const { products } = useCart();
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Run searchProductsByName (which uses O(log n) prefix binary search + fuzzy fallback)
    const searchResults = searchProductsByName(products, query);
    setResults(searchResults);
  }, [query, products]);

  return (
    <div className={`${styles.searchContainer} container section-padding`}>
      {/* Search Header Panel */}
      <div className={styles.header}>
        <span className="text-label-caps" style={{ color: 'var(--primary)', marginBottom: '12px', display: 'block' }}>
          Catalog Search
        </span>
        <h1 className="text-headline-lg" style={{ marginBottom: '32px' }}>
          {query ? `Search Results for "${query}"` : 'Search Our Collections'}
        </h1>
        <SearchBar initialValue={query} placeholder="Search watches, coats, perfumes..." />
      </div>

      {/* Search Results list */}
      <main className={styles.resultsSection}>
        {query && (
          <div className={styles.resultsMeta}>
            <p className={styles.metaText}>
              Found {results.length} {results.length === 1 ? 'item' : 'items'} matching your query
            </p>
          </div>
        )}
        
        <ProductGrid 
          products={results} 
          emptyMessage={query ? "No items matched your search criteria. Try different terms." : "Enter a search query to view items."} 
        />
      </main>
    </div>
  );
}

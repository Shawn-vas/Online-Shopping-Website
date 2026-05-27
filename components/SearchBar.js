'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { searchProductsByName } from '@/lib/algorithms/searching';
import { Search, X } from 'lucide-react';
import styles from './SearchBar.module.css';

export default function SearchBar({ initialValue = '', placeholder = 'Search by name, category, or tag...' }) {
  const router = useRouter();
  const { products } = useCart();
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  // Re-sync with initial value if it changes
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Compute suggestions when query changes
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    // Use our binary search prefix logic to find matches
    const results = searchProductsByName(products, query.trim());
    setSuggestions(results.slice(0, 5)); // Limit to top 5 suggestions
  }, [query, products]);

  // Close suggestions dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (productId) => {
    setShowSuggestions(false);
    router.push(`/product/${productId}`);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <div className={styles.inputContainer}>
          <Search className={styles.searchIcon} size={20} />
          <input 
            type="text" 
            placeholder={placeholder} 
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className={styles.searchInput}
          />
          {query && (
            <button type="button" onClick={handleClear} className={styles.clearButton} aria-label="Clear">
              <X size={18} />
            </button>
          )}
        </div>
        <button type="submit" className={styles.submitBtn}>
          Search
        </button>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span className="text-label-caps" style={{ fontSize: '0.65rem', opacity: 0.5 }}>Suggestions</span>
          </div>
          <ul className={styles.suggestionsList}>
            {suggestions.map((product) => (
              <li 
                key={product.id} 
                onClick={() => handleSuggestionClick(product.id)}
                className={styles.suggestionItem}
              >
                <img src={product.image} alt={product.name} className={styles.suggestionImg} />
                <div className={styles.suggestionInfo}>
                  <span className={styles.suggestionName}>{product.name}</span>
                  <span className={styles.suggestionCat}>{product.category}</span>
                </div>
                <span className={styles.suggestionPrice}>₹{product.price.toLocaleString('en-IN')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

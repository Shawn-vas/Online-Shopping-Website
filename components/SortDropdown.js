'use client';

import React from 'react';
import styles from './SortDropdown.module.css';

export default function SortDropdown({ value, onChange }) {
  const handleChange = (e) => {
    const val = e.target.value; // Format: "key-order"
    const [key, order] = val.split('-');
    onChange({ key, order });
  };

  return (
    <div className={styles.container}>
      <label htmlFor="sort-select" className={styles.label}>Sort By</label>
      <div className={styles.selectWrapper}>
        <select 
          id="sort-select"
          value={`${value.key}-${value.order}`}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="name-asc">Alphabetical (A - Z)</option>
          <option value="price-asc">Price (Low - High)</option>
          <option value="price-desc">Price (High - Low)</option>
          <option value="rating-desc">Highest Rated</option>
          <option value="category-asc">Category (A - Z)</option>
        </select>
      </div>
    </div>
  );
}

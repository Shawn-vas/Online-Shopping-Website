'use client';

import React from 'react';
import styles from './BudgetSlider.module.css';

export default function BudgetSlider({ value, onChange, min = 1000, max = 100000, step = 500 }) {
  const handleSliderChange = (e) => {
    onChange(Number(e.target.value));
  };

  const handleInputChange = (e) => {
    let val = Number(e.target.value);
    if (val < min) val = min;
    if (val > max) val = max;
    onChange(val);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <label htmlFor="budget-input" className={`${styles.label} text-label-caps`}>
          Set Shopping Budget
        </label>
        <div className={styles.inputWrapper}>
          <span className={styles.currencySymbol}>₹</span>
          <input 
            id="budget-input"
            type="number" 
            min={min} 
            max={max} 
            step={step}
            value={value}
            onChange={handleInputChange}
            className={styles.numInput}
          />
        </div>
      </div>

      <div className={styles.sliderWrapper}>
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step}
          value={value}
          onChange={handleSliderChange}
          className={styles.rangeInput}
        />
        <div className={styles.rangeLabels}>
          <span>₹{min.toLocaleString('en-IN')}</span>
          <span>₹{max.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}

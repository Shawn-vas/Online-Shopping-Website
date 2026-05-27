'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { knapsackBudget } from '@/lib/algorithms/knapsack';
import ProductGrid from '@/components/ProductGrid';
import BudgetSlider from '@/components/BudgetSlider';
import { Heart, Sparkles, ShoppingCart, Info } from 'lucide-react';
import styles from './page.module.css';

export default function Wishlist() {
  const { wishlist, products, addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' or 'budget'
  const [budget, setBudget] = useState(30000);
  const [optimizedResult, setOptimizedResult] = useState({
    selectedProducts: [],
    totalCost: 0,
    totalValue: 0,
    budgetUtilization: 0
  });

  // Calculate Knapsack whenever budget or wishlist/products change
  useEffect(() => {
    // If wishlist has items, run knapsack on wishlist.
    // If wishlist is empty, fallback to running knapsack on the entire catalog.
    const sourceList = wishlist.length > 0 ? wishlist : products;
    const result = knapsackBudget(sourceList, budget);
    setOptimizedResult(result);
  }, [budget, wishlist, products]);

  const handleAddAllToCart = () => {
    optimizedResult.selectedProducts.forEach(product => {
      addToCart(product, 1);
    });
  };

  return (
    <div className={`${styles.wishlistContainer} container section-padding`}>
      {/* Page Title */}
      <div className={styles.header}>
        <span className="text-label-caps" style={{ color: 'var(--primary)', marginBottom: '12px', display: 'block' }}>
          Personal Collection
        </span>
        <h1 className="text-headline-lg" style={{ marginBottom: '32px' }}>
          Saved Pieces & Curation
        </h1>

        {/* Tab Controls */}
        <div className={styles.tabs}>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`${styles.tabBtn} ${activeTab === 'saved' ? styles.tabBtnActive : ''} text-label-caps`}
          >
            Saved Pieces ({wishlist.length})
          </button>
          <button 
            onClick={() => setActiveTab('budget')}
            className={`${styles.tabBtn} ${activeTab === 'budget' ? styles.tabBtnActive : ''} text-label-caps`}
          >
            Shop by Budget
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <main className={styles.content}>
        {activeTab === 'saved' ? (
          <div>
            <ProductGrid 
              products={wishlist} 
              emptyMessage="You have not saved any pieces yet. Browse collections and add items to your wishlist." 
            />
          </div>
        ) : (
          <div className={styles.budgetLayout}>
            {/* Slider Panel */}
            <div className={styles.sliderPanel}>
              <div className={styles.infoAlert}>
                <Info size={18} className={styles.infoIcon} />
                <p className={styles.infoText}>
                  {wishlist.length > 0 
                    ? "Our algorithm finds the best combination of items from your Wishlist to maximize total rating and discount value within your budget."
                    : "Your Wishlist is currently empty. We are optimizing over our entire catalog to show you the best possible combination of items within your budget!"
                  }
                </p>
              </div>

              <BudgetSlider 
                value={budget} 
                onChange={setBudget} 
                min={5000} 
                max={150000} 
                step={2500} 
              />

              {/* Knapsack Stats Panel */}
              <div className={`${styles.statsPanel} glass-panel`}>
                <div className={styles.statsHeader}>
                  <Sparkles size={16} className={styles.sparkleIcon} />
                  <span className="text-label-caps" style={{ fontSize: '0.65rem' }}>Optimization Stats</span>
                </div>
                
                <div className={styles.statRow}>
                  <span>Optimal Combination Total</span>
                  <span className={styles.statVal}>₹{optimizedResult.totalCost.toLocaleString('en-IN')}</span>
                </div>

                <div className={styles.statRow}>
                  <span>Budget Utilization</span>
                  <span className={styles.statVal}>{optimizedResult.budgetUtilization}%</span>
                </div>

                {/* Progress bar */}
                <div className={styles.progressBarBg}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ width: `${Math.min(100, optimizedResult.budgetUtilization)}%` }}
                  ></div>
                </div>

                <button 
                  onClick={handleAddAllToCart}
                  disabled={optimizedResult.selectedProducts.length === 0}
                  className={`${styles.addAllBtn} btn-primary`}
                >
                  <ShoppingCart size={16} style={{ marginRight: '8px' }} />
                  Add All to Bag
                </button>
              </div>
            </div>

            {/* Results Grid */}
            <div className={styles.resultsGrid}>
              <h3 className={`${styles.resultsTitle} text-label-caps`}>
                Best Selection for ₹{budget.toLocaleString('en-IN')} Budget
              </h3>
              <p className={styles.resultsDesc}>
                Selected {optimizedResult.selectedProducts.length} items to maximize your purchase value.
              </p>
              <ProductGrid 
                products={optimizedResult.selectedProducts} 
                emptyMessage="No items fit within this budget. Try increasing your budget." 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

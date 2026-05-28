'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { getRecommendations } from '@/lib/algorithms/dp';
import ProductGrid from '@/components/ProductGrid';
import styles from './page.module.css';

export default function Home() {
  const { products, purchaseHistory } = useCart();
  
  // Get personalized recommendations using Dynamic Programming (LCS)
  const recommendations = getRecommendations(purchaseHistory, products, 4);

  const categories = [
    { name: 'Watches', image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=400&auto=format&fit=crop', desc: 'Precision objects' },
    { name: 'Shoes', image: 'https://images.unsplash.com/photo-1549298916-b5c9e97092e7?q=80&w=400&auto=format&fit=crop', desc: 'Crafted footwear' },
    { name: 'Perfumes', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=400&auto=format&fit=crop', desc: 'Sensory signatures' },
    { name: 'Jackets', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=400&auto=format&fit=crop', desc: 'Sartorial luxury' },
    { name: 'Wallets', image: 'https://images.unsplash.com/photo-1627124718414-03c267b36f1c?q=80&w=400&auto=format&fit=crop', desc: 'Premium essentials' },
    { name: 'Handbags', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop', desc: 'Structured elegance' }
  ];

  return (
    <div className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`${styles.heroContent} container`}>
          <span className="text-label-caps" style={{ color: 'var(--primary)', marginBottom: '16px', display: 'block' }}>
            LUXE Editorial Boutique
          </span>
          <h1 className="text-display-hero" style={{ marginBottom: '24px' }}>
            Silent Luxury,<br />Refined Choices
          </h1>
          <p className={styles.heroText}>
            A study in contrast: classical geometric proportions, deep obsidian layers, and curated products optimized through computational elegance.
          </p>
          <div className={styles.heroActions}>
            <Link href="/shop" className="btn-primary">
              Explore Collections
            </Link>
          </div>
        </div>
      </section>

      {/* DP Recommendations Section */}
      <section className={`${styles.recommendations} section-padding`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="text-label-caps">Tailored for You</span>
            <h2 className="text-headline-lg">Personalized Selection</h2>
            <p className={styles.sectionSubtext}>
              Curated items matching your previous preferences and interests.
            </p>
          </div>
          <ProductGrid products={recommendations} emptyMessage="No recommendations available." />
        </div>
      </section>

      {/* Categories Section */}
      <section className={`${styles.categoriesSection} section-padding`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="text-label-caps">Exquisite Editions</span>
            <h2 className="text-headline-lg">Shop by Category</h2>
          </div>
          <div className={styles.categoryGrid}>
            {categories.map((cat, idx) => (
              <Link 
                key={idx}
                href={`/shop?category=${encodeURIComponent(cat.name)}`}
                className={styles.categoryCard}
              >
                <div className={styles.catImageWrapper}>
                  <img src={cat.image} alt={cat.name} className={styles.catImage} />
                  <div className={styles.catOverlay}></div>
                </div>
                <div className={styles.catInfo}>
                  <h3 className={styles.catName}>{cat.name}</h3>
                  <span className={styles.catDesc}>{cat.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} container`}>
        <div className={styles.grid}>
          {/* Brand Info */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logo}>
              LUXE
            </Link>
            <p className={styles.tagline}>
              Curated luxury goods featuring structured design, premium materials, and algorithmic perfection.
            </p>
          </div>

          {/* Links Col 1 */}
          <div className={styles.linksCol}>
            <h4 className={`${styles.heading} text-label-caps`}>Shop</h4>
            <ul className={styles.list}>
              <li><Link href="/shop?category=Apparel">Apparel</Link></li>
              <li><Link href="/shop?category=Leather Goods">Leather Goods</Link></li>
              <li><Link href="/shop?category=Timepieces">Timepieces</Link></li>
              <li><Link href="/shop?category=Fragrances">Fragrances</Link></li>
              <li><Link href="/shop?category=Home %26 Living">Home & Living</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className={styles.linksCol}>
            <h4 className={`${styles.heading} text-label-caps`}>Client Care</h4>
            <ul className={styles.list}>
              <li><Link href="/wishlist">Saved Pieces</Link></li>
              <li><Link href="/cart">Shopping Bag</Link></li>
              <li><Link href="/wishlist?tab=budget">Shop by Budget</Link></li>
            </ul>
          </div>

          {/* Links Col 3 */}
          <div className={styles.linksCol}>
            <h4 className={`${styles.heading} text-label-caps`}>About</h4>
            <p className={styles.aboutText}>
              LUXE Editorial Boutique is a showcase of pairing modern web architectures with foundational computer science algorithms to build seamless user flows.
            </p>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} LUXE Editorial Boutique. All rights reserved.</p>
          <div className={styles.legal}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

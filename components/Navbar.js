'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Search, ShoppingBag, Heart, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, wishlist } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className={styles.header}>
      <div className={`${styles.container} container`}>
        {/* Mobile Menu Toggle */}
        <button 
          className={styles.menuToggle} 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <Link href="/" className={styles.logo}>
          LUXE
        </Link>

        {/* Navigation Links */}
        <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ''}`}>
          <Link 
            href="/" 
            className={`${styles.link} ${pathname === '/' ? styles.active : ''} text-label-caps`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/shop" 
            className={`${styles.link} ${pathname === '/shop' ? styles.active : ''} text-label-caps`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Collections
          </Link>
          <Link 
            href="/wishlist" 
            className={`${styles.link} ${pathname === '/wishlist' ? styles.active : ''} text-label-caps`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Wishlist
          </Link>
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <input 
            type="text" 
            placeholder="Search catalog..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton} aria-label="Search">
            <Search size={18} />
          </button>
        </form>

        {/* Icons (Wishlist & Cart) */}
        <div className={styles.actions}>
          <Link href="/wishlist" className={styles.actionLink} aria-label="Wishlist">
            <Heart size={20} className={pathname === '/wishlist' ? styles.activeIcon : ''} />
            {wishlistCount > 0 && (
              <span className={styles.badge}>{wishlistCount}</span>
            )}
          </Link>
          <Link href="/cart" className={styles.actionLink} aria-label="Cart">
            <ShoppingBag size={20} className={pathname === '/cart' ? styles.activeIcon : ''} />
            {cartCount > 0 && (
              <span className={styles.badge}>{cartCount}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

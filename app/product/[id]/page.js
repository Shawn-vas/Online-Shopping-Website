'use client';

import React, { use, useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { binarySearch } from '@/lib/algorithms/searching';
import { quickSort } from '@/lib/algorithms/sorting';
import { getSimilarProducts } from '@/lib/algorithms/dp';
import ProductGrid from '@/components/ProductGrid';
import { Star, ShoppingBag, Heart, Check } from 'lucide-react';
import styles from './page.module.css';

export default function ProductDetail({ params }) {
  // Unwrap params using React.use() in Next.js 15 Client Component
  const resolvedParams = use(params);
  const productId = resolvedParams?.id;

  const { products, addToCart, toggleWishlist, isInWishlist } = useCart();
  const [product, setProduct] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    if (!products || products.length === 0 || !productId) return;

    // Use binary search to find the product by ID
    // First, sort the products catalog by 'id'
    const idSorted = quickSort(products, 'id', 'asc');
    const index = binarySearch(idSorted, productId, 'id');

    if (index !== -1) {
      const foundProduct = idSorted[index];
      setProduct(foundProduct);
      
      // Calculate similar items using DP tags matching (LCS)
      const recommendations = getSimilarProducts(foundProduct, products, 4);
      setSimilarItems(recommendations);
    }
  }, [productId, products]);

  if (!product) {
    return (
      <div className={`${styles.loadingContainer} container`}>
        <div className={styles.spinner}></div>
        <p>Loading piece details...</p>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const hasDiscount = product.discount > 0;
  const discountedPrice = hasDiscount 
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2000);
  };

  return (
    <div className={styles.wrapper}>
      {/* Product Detail Section */}
      <section className={`${styles.detailSection} container section-padding`}>
        <div className={styles.grid}>
          {/* Large Product Image */}
          <div className={styles.imageColumn}>
            <div className={styles.imageContainer}>
              <img src={product.image} alt={product.name} className={styles.image} />
              {hasDiscount && (
                <span className={styles.discountBadge}>-{product.discount}% Edition</span>
              )}
            </div>
          </div>

          {/* Product Details Columns */}
          <div className={styles.infoColumn}>
            <span className={styles.category}>{product.category}</span>
            
            <h1 className={`${styles.name} text-headline-lg`}>{product.name}</h1>

            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star 
                    key={idx} 
                    size={16} 
                    fill={idx < Math.floor(product.rating) ? 'var(--primary)' : 'none'} 
                    color="var(--primary)" 
                  />
                ))}
              </div>
              <span className={styles.ratingText}>{product.rating.toFixed(2)} / 5.00</span>
            </div>

            <div className={styles.priceRow}>
              {hasDiscount ? (
                <div className={styles.priceContainer}>
                  <span className={styles.originalPrice}>₹{product.price.toLocaleString('en-IN')}</span>
                  <span className={styles.price}>₹{discountedPrice.toLocaleString('en-IN')}</span>
                </div>
              ) : (
                <span className={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
              )}
            </div>

            <p className={styles.description}>{product.description}</p>

            {/* Product Tags list */}
            <div className={styles.tagsContainer}>
              {product.tags.map((tag, idx) => (
                <span key={idx} className={styles.tag}>#{tag}</span>
              ))}
            </div>

            <div className={styles.purchaseControls}>
              {/* Quantity Select */}
              <div className={styles.quantityWrapper}>
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className={styles.qtyBtn}
                >
                  -
                </button>
                <span className={styles.qtyVal}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className={styles.qtyBtn}
                >
                  +
                </button>
              </div>

              {/* Add to Cart button */}
              <button 
                onClick={handleAddToCart}
                className={`${styles.addBtn} btn-primary`}
              >
                {addedMessage ? (
                  <>
                    <Check size={18} style={{ marginRight: '8px' }} />
                    Added to Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} style={{ marginRight: '8px' }} />
                    Add to Bag
                  </>
                )}
              </button>

              {/* Wishlist button */}
              <button 
                onClick={() => toggleWishlist(product)}
                className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlistActive : ''}`}
                aria-label="Add to wishlist"
              >
                <Heart size={20} fill={wishlisted ? 'var(--primary)' : 'none'} />
              </button>
            </div>

            {/* Luxury Shipping & Returns info */}
            <div className={styles.shippingInfo}>
              <p>✓ Complimentary Signature Gift Packaging</p>
              <p>✓ Insured express delivery with standard checkout</p>
              <p>✓ Easy returns within 14 days of receipt</p>
            </div>
          </div>
        </div>
      </section>

      {/* DP Suggestions Similar Products Section */}
      <section className={`${styles.similarSection} section-padding`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="text-label-caps">Recommended</span>
            <h2 className="text-headline-lg">You May Also Like</h2>
            <p className={styles.sectionSubtext}>
              Other pieces matching the tag profiles, material traits, and aesthetic characteristics of this piece.
            </p>
          </div>
          <ProductGrid products={similarItems} emptyMessage="No similar pieces available." />
        </div>
      </section>
    </div>
  );
}

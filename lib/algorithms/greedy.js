/**
 * Greedy Algorithm for Coupon / Discount Optimization.
 * The objective is to maximize the discount (value saved) using a Greedy choice property.
 * 
 * Strategy:
 * 1. For each coupon, calculate its potential discount value based on the current cart contents.
 * 2. Filter out coupons that do not meet the minimum purchase requirement.
 * 3. Sort the available coupons in descending order of their discount value (Greedy choice).
 * 4. Select the best coupon.
 * 5. If coupon stacking is allowed (e.g., 1 category-specific + 1 general store-wide coupon),
 *    adjust the cart total and select the next best non-conflicting coupon.
 * 6. Return the chosen coupons, the individual discount amounts, and the final cart total.
 */

export function optimizeDiscounts(cartItems, availableCoupons) {
  if (!cartItems || cartItems.length === 0 || !availableCoupons || availableCoupons.length === 0) {
    return {
      appliedCoupons: [],
      discountAmount: 0,
      finalTotal: calculateSubtotal(cartItems),
      breakdown: []
    };
  }

  const subtotal = calculateSubtotal(cartItems);
  const categoryTotals = calculateCategoryTotals(cartItems);

  // Helper to calculate discount of a single coupon
  function getCouponValue(coupon, currentTotal, currentCategoryTotals) {
    // Check minPurchase condition
    if (currentTotal < coupon.minPurchase) {
      return 0;
    }

    let discount = 0;
    if (coupon.category === 'all') {
      if (coupon.type === 'percentage') {
        discount = currentTotal * (coupon.value / 100);
      } else {
        discount = coupon.value;
      }
    } else {
      // Category specific discount
      const catTotal = currentCategoryTotals[coupon.category] || 0;
      if (catTotal === 0) return 0;

      if (coupon.type === 'percentage') {
        discount = catTotal * (coupon.value / 100);
      } else {
        // Flat discount for category: capped at category total
        discount = Math.min(coupon.value, catTotal);
      }
    }

    // Cap at max discount if specified
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }

    return Math.round(discount);
  }

  // Calculate savings for all valid coupons
  const couponSavings = availableCoupons
    .map(coupon => {
      const savings = getCouponValue(coupon, subtotal, categoryTotals);
      return { ...coupon, savings };
    })
    .filter(c => c.savings > 0);

  // Greedy choice: sort coupons by savings descending
  // Using our own simple sort or JS sort (internally using quickSort logic if needed, but simple array sort is fine)
  couponSavings.sort((a, b) => b.savings - a.savings);

  const appliedCoupons = [];
  let remainingTotal = subtotal;
  let remainingCategoryTotals = { ...categoryTotals };
  let totalDiscount = 0;
  const breakdown = [];

  // Rules: We allow up to 2 coupons to be stacked, but they must be:
  // - 1 Category-specific coupon
  // - 1 Store-wide ("all") coupon
  // Or simply: the two best coupons that are of different categories/scopes.
  
  for (const coupon of couponSavings) {
    if (appliedCoupons.length >= 2) break;

    // Check if we already applied a coupon of the same category scope
    const isCategorySpecific = coupon.category !== 'all';
    const hasCategoryCoupon = appliedCoupons.some(c => c.category !== 'all');
    const hasGeneralCoupon = appliedCoupons.some(c => c.category === 'all');

    if (isCategorySpecific && hasCategoryCoupon) continue;
    if (!isCategorySpecific && hasGeneralCoupon) continue;

    // Re-verify the coupon is still valid under remaining totals
    const actualSavings = getCouponValue(coupon, remainingTotal, remainingCategoryTotals);
    if (actualSavings > 0) {
      appliedCoupons.push(coupon);
      totalDiscount += actualSavings;
      breakdown.push({
        code: coupon.code,
        savings: actualSavings,
        description: coupon.category === 'all' 
          ? `Storewide ${coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`} Off`
          : `${coupon.category} Special ${coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`} Off`
      });

      // Update remaining totals
      remainingTotal -= actualSavings;
      if (isCategorySpecific) {
        remainingCategoryTotals[coupon.category] = Math.max(0, remainingCategoryTotals[coupon.category] - actualSavings);
      } else {
        // Distribute general discount proportionally across categories
        const ratio = remainingTotal / (remainingTotal + actualSavings);
        for (const cat in remainingCategoryTotals) {
          remainingCategoryTotals[cat] = Math.round(remainingCategoryTotals[cat] * ratio);
        }
      }
    }
  }

  return {
    appliedCoupons: appliedCoupons.map(c => c.code),
    discountAmount: totalDiscount,
    finalTotal: Math.max(0, subtotal - totalDiscount),
    breakdown
  };
}

// Helpers
function calculateSubtotal(cartItems) {
  return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function calculateCategoryTotals(cartItems) {
  const totals = {};
  for (const item of cartItems) {
    const cat = item.category;
    totals[cat] = (totals[cat] || 0) + (item.price * item.quantity);
  }
  return totals;
}

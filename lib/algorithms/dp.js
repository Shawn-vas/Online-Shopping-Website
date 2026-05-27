/**
 * Dynamic Programming for Personalized Recommendations.
 * Uses the Longest Common Subsequence (LCS) algorithm to measure tag similarity
 * between catalog products and the user's purchase history.
 * 
 * LCS DP Recurrence:
 * Let X be tags of product A, Y be tags of product B.
 * dp[i][j] = length of LCS of prefix X[0..i-1] and Y[0..j-1].
 * - If X[i-1] === Y[j-1]: dp[i][j] = dp[i-1][j-1] + 1
 * - Else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])
 * Time Complexity: O(M * N) per pair, where M, N are tag counts (typically small).
 */

/**
 * Computes the Longest Common Subsequence length of two tag arrays.
 */
export function lcs(tagsA, tagsB) {
  const m = tagsA.length;
  const n = tagsB.length;
  
  // Create 2D DP array initialized to 0
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (tagsA[i - 1].toLowerCase() === tagsB[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculates the similarity score of a product compared to purchase history.
 */
function calculateProductScore(product, purchaseHistory, allProducts) {
  // If the product is already purchased, we don't want to recommend it as primary recommendation
  if (purchaseHistory.purchasedProductIds.includes(product.id)) {
    return -9999;
  }

  let maxLcsScore = 0;

  // Compare tags with each purchased product's tags
  for (const historicalItem of purchaseHistory.history) {
    const commonTagsCount = lcs(product.tags, historicalItem.tags);
    if (commonTagsCount > maxLcsScore) {
      maxLcsScore = commonTagsCount;
    }
  }

  // Weight Category Match
  let categoryScore = 0;
  if (purchaseHistory.preferredCategories.includes(product.category)) {
    categoryScore = 3; // Boost if category matches preferred category
  }

  // Weight Price Similarity
  let priceScore = 0;
  const avgHistoryPrice = purchaseHistory.history.reduce((sum, item) => sum + item.price, 0) / purchaseHistory.history.length;
  const priceDiffPercent = Math.abs(product.price - avgHistoryPrice) / avgHistoryPrice;
  
  if (priceDiffPercent <= 0.2) {
    priceScore = 2; // Very close to previous purchases price range
  } else if (priceDiffPercent <= 0.5) {
    priceScore = 1; // Moderately close
  }

  // Total Score = (LCS Tag match length * 2) + category score + price score
  return (maxLcsScore * 2) + categoryScore + priceScore;
}

/**
 * Gets personalized recommendations based on purchase history.
 * Returns top N recommended products.
 */
export function getRecommendations(purchaseHistory, allProducts, limit = 5) {
  if (!purchaseHistory || !purchaseHistory.history || purchaseHistory.history.length === 0) {
    // If no history, return top rated products
    return [...allProducts]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  const productsWithScores = allProducts.map(product => {
    const score = calculateProductScore(product, purchaseHistory, allProducts);
    return { ...product, recommendationScore: score };
  });

  // Sort products by recommendationScore descending
  // Filter out products that have been marked -9999 (already purchased)
  return productsWithScores
    .filter(p => p.recommendationScore > -1000)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
}

/**
 * Gets similar products for the product details page.
 * Uses LCS comparison between target product and other products.
 */
export function getSimilarProducts(targetProduct, allProducts, limit = 4) {
  if (!targetProduct) return [];

  const productsWithScores = allProducts
    .filter(p => p.id !== targetProduct.id)
    .map(product => {
      const tagMatchScore = lcs(targetProduct.tags, product.tags);
      const categoryMatch = product.category === targetProduct.category ? 2 : 0;
      return { 
        ...product, 
        similarityScore: tagMatchScore + categoryMatch 
      };
    });

  return productsWithScores
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);
}

/**
 * 0/1 Knapsack Algorithm for Budget-Based Shopping.
 * Chooses the optimal subset of products to maximize "value" (based on ratings and discounts)
 * without exceeding the user's defined budget.
 * 
 * Optimization:
 * Prices and budget are scaled down by dividing by 100.
 * E.g., ₹12,500 becomes a weight of 125. A budget of ₹15,000 becomes a capacity of 150.
 * This keeps the DP table dimensions small, ensuring O(N * (W/100)) runs in microseconds.
 * 
 * Recurrence:
 * Let dp[i][w] be the max value using first i items and capacity w.
 * dp[i][w] = max(dp[i-1][w], dp[i-1][w - weight[i-1]] + value[i-1])
 */

export function knapsackBudget(products, budget) {
  if (!products || products.length === 0 || budget <= 0) {
    return {
      selectedProducts: [],
      totalCost: 0,
      totalValue: 0,
      budgetUtilization: 0
    };
  }

  // Filter products that are cheaper than or equal to the budget
  const eligibleProducts = products.filter(p => p.price <= budget);
  const n = eligibleProducts.length;

  if (n === 0) {
    return {
      selectedProducts: [],
      totalCost: 0,
      totalValue: 0,
      budgetUtilization: 0
    };
  }

  // Scaling factor to keep DP matrix size small and execution speed high
  const SCALE = 100;
  const capacity = Math.floor(budget / SCALE);

  // Prepare weights and values
  // Weight = price / SCALE
  // Value = rating * 10 * (1 + discount/100) -> higher rating + bigger discount = higher value
  const weights = eligibleProducts.map(p => Math.floor(p.price / SCALE));
  const values = eligibleProducts.map(p => {
    const baseValue = p.rating * 10;
    const discountMultiplier = 1 + ((p.discount || 0) / 100);
    return Math.round(baseValue * discountMultiplier);
  });

  // Initialize DP table
  // Size: (n + 1) rows, (capacity + 1) columns
  const dp = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(0));

  // Build the DP table
  for (let i = 1; i <= n; i++) {
    const itemWeight = weights[i - 1];
    const itemVal = values[i - 1];

    for (let w = 0; w <= capacity; w++) {
      if (itemWeight <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - itemWeight] + itemVal);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  // Backtrack to find the selected items
  const selectedProducts = [];
  let w = capacity;
  let totalCost = 0;
  let totalValue = 0;

  for (let i = n; i > 0; i--) {
    // If the value came from the top row, it means this item was NOT selected.
    // If the value is different from the top row, it was selected.
    if (dp[i][w] !== dp[i - 1][w]) {
      const product = eligibleProducts[i - 1];
      selectedProducts.push(product);
      totalCost += product.price;
      totalValue += values[i - 1];
      w -= weights[i - 1];
    }
  }

  // Reverse to get them in original order
  selectedProducts.reverse();

  return {
    selectedProducts,
    totalCost,
    totalValue,
    budgetUtilization: parseFloat(((totalCost / budget) * 100).toFixed(1))
  };
}

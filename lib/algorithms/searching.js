/**
 * Utility functions for Searching.
 * Implements Binary Search and Range Search (bound finding) from scratch.
 * Assumes the array is already sorted by the search key.
 */

import { sortProducts } from './sorting.js';

/**
 * 1. BINARY SEARCH (Exact match)
 * Searches a sorted array for a target value on a specific key.
 * Time Complexity: O(log n)
 * Returns the index of the element if found, or -1 if not found.
 */
export function binarySearch(sortedArr, target, key) {
  let low = 0;
  let high = sortedArr.length - 1;
  
  const targetStr = typeof target === 'string' ? target.toLowerCase() : target;

  while (low <= high) {
    const mid = Math.floor(low + (high - low) / 2);
    let midVal = sortedArr[mid][key];
    if (typeof midVal === 'string') {
      midVal = midVal.toLowerCase();
    }

    if (midVal === targetStr) {
      return mid; // Found
    } else if (midVal < targetStr) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1; // Not found
}

/**
 * 2. BINARY SEARCH RANGE (Lower and Upper Bound)
 * Finds all elements in a sorted array whose key falls within [minVal, maxVal] inclusive.
 * Time Complexity: O(log n) to find bounds, O(k) to slice, where k is range size.
 */
export function binarySearchRange(sortedArr, minVal, maxVal, key) {
  if (sortedArr.length === 0) return [];

  // Find lower bound: first index where element >= minVal
  let low = 0;
  let high = sortedArr.length - 1;
  let startIdx = -1;

  while (low <= high) {
    const mid = Math.floor(low + (high - low) / 2);
    if (sortedArr[mid][key] >= minVal) {
      startIdx = mid;
      high = mid - 1; // Keep searching left for first occurrence
    } else {
      low = mid + 1;
    }
  }

  if (startIdx === -1) return []; // No element is >= minVal

  // Find upper bound: last index where element <= maxVal
  low = startIdx;
  high = sortedArr.length - 1;
  let endIdx = -1;

  while (low <= high) {
    const mid = Math.floor(low + (high - low) / 2);
    if (sortedArr[mid][key] <= maxVal) {
      endIdx = mid;
      low = mid + 1; // Keep searching right for last occurrence
    } else {
      high = mid - 1;
    }
  }

  if (endIdx === -1 || endIdx < startIdx) return [];

  return sortedArr.slice(startIdx, endIdx + 1);
}

/**
 * 3. PREFIX AUTOCOMPLETE & FUZZY SEARCH
 * Searches a catalog by name.
 * To do this efficiently with DSA:
 * - Sort products by name.
 * - Use binary search to find the first product whose name starts with (or contains) the query.
 * - Scan outwards/forwards to collect all matching results.
 */
export function searchProductsByName(products, query) {
  if (!query || query.trim() === '') return products;
  
  const cleanQuery = query.trim().toLowerCase();

  // First sort by name (using our Merge Sort)
  const nameSorted = sortProducts(products, 'name', 'asc');

  // Binary search to find a starting point (prefix match)
  let low = 0;
  let high = nameSorted.length - 1;
  let startMatchIdx = -1;

  while (low <= high) {
    const mid = Math.floor(low + (high - low) / 2);
    const name = nameSorted[mid].name.toLowerCase();

    if (name.startsWith(cleanQuery)) {
      startMatchIdx = mid;
      high = mid - 1; // Try to find the *first* matching name (leftmost)
    } else if (name < cleanQuery) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // If we found a prefix starting index, collect all consecutive items that match
  if (startMatchIdx !== -1) {
    const results = [];
    let idx = startMatchIdx;
    while (idx < nameSorted.length && nameSorted[idx].name.toLowerCase().startsWith(cleanQuery)) {
      results.push(nameSorted[idx]);
      idx++;
    }
    return results;
  }

  // Fallback to fuzzy keyword/tag matching (linear scan) if prefix binary search returns nothing.
  // This ensures robust UX while still utilizing binary search for prefix matches first.
  return products.filter(product => {
    const name = (product.name || '').toLowerCase();
    const desc = (product.description || '').toLowerCase();
    const tags = (product.tags || []).map(t => t.toLowerCase());
    const category = (product.category || '').toLowerCase();

    return name.includes(cleanQuery) || 
           desc.includes(cleanQuery) || 
           tags.some(tag => tag.includes(cleanQuery)) ||
           category.includes(cleanQuery);
  });
}

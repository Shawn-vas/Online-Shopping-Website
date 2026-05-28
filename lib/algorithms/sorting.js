/**
 * Utility functions for Sorting.
 * Implements Quick Sort, Merge Sort, and Heap Sort from scratch.
 * Time Complexities:
 * - Quick Sort: O(n log n) average, O(n²) worst-case. Not stable.
 * - Merge Sort: O(n log n) best/avg/worst. Stable.
 * - Heap Sort: O(n log n) best/avg/worst. In-place, not stable.
 */

// Helper to compare two values based on key and order
function compare(a, b, key, order = 'asc') {
  let valA = a[key];
  let valB = b[key];

  // For name (strings), convert to lowercase for alphabetical order
  if (typeof valA === 'string') {
    valA = valA.toLowerCase();
    valB = valB.toLowerCase();
  }

  if (valA === valB) return 0;

  if (order === 'asc') {
    return valA < valB ? -1 : 1;
  } else {
    return valA > valB ? -1 : 1;
  }
}

/**
 * 1. QUICK SORT
 * Uses pivot selection and partitioning.
 */
export function quickSort(arr, key, order = 'asc') {
  // Create copy to maintain immutability
  const workingArr = [...arr];
  
  function sort(list, low, high) {
    if (low < high) {
      const pIdx = partition(list, low, high);
      sort(list, low, pIdx - 1);
      sort(list, pIdx + 1, high);
    }
  }

  function partition(list, low, high) {
    // Choose the rightmost element as pivot
    const pivot = list[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      // If element is smaller/greater than pivot based on sorting order
      if (compare(list[j], pivot, key, order) <= 0) {
        i++;
        // Swap list[i] and list[j]
        const temp = list[i];
        list[i] = list[j];
        list[j] = temp;
      }
    }
    // Swap list[i+1] and pivot (list[high])
    const temp = list[i + 1];
    list[i + 1] = list[high];
    list[high] = temp;
    return i + 1;
  }

  sort(workingArr, 0, workingArr.length - 1);
  return workingArr;
}

/**
 * 2. MERGE SORT
 * Divides array in half, sorts each half, and merges them.
 * This is a stable sorting algorithm.
 */
export function mergeSort(arr, key, order = 'asc') {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);

  return merge(
    mergeSort(left, key, order),
    mergeSort(right, key, order),
    key,
    order
  );
}

function merge(left, right, key, order) {
  const result = [];
  let lIdx = 0;
  let rIdx = 0;

  while (lIdx < left.length && rIdx < right.length) {
    if (compare(left[lIdx], right[rIdx], key, order) <= 0) {
      result.push(left[lIdx]);
      lIdx++;
    } else {
      result.push(right[rIdx]);
      rIdx++;
    }
  }

  // Append remaining items
  return result.concat(left.slice(lIdx)).concat(right.slice(rIdx));
}

/**
 * 3. HEAP SORT
 * Converts array into a binary heap, then extracts maximum elements.
 * Works in O(n log n) and runs in-place (in terms of auxiliary space, though we copy first to respect React immutability).
 */
export function heapSort(arr, key, order = 'asc') {
  const workingArr = [...arr];
  const n = workingArr.length;

  // Build heap (rearrange array)
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(workingArr, n, i, key, order);
  }

  // One by one extract an element from heap
  for (let i = n - 1; i > 0; i--) {
    // Move current root to end
    const temp = workingArr[0];
    workingArr[0] = workingArr[i];
    workingArr[i] = temp;

    // Call max heapify on the reduced heap
    heapify(workingArr, i, 0, key, order);
  }

  return workingArr;
}

function heapify(list, size, rootIdx, key, order) {
  let largestOrSmallest = rootIdx; // Initialize largest/smallest as root
  const left = 2 * rootIdx + 1;
  const right = 2 * rootIdx + 2;

  // In heap sort:
  // For 'asc' sorting: we build a Max Heap, so we pull out the largest.
  // For 'desc' sorting: we build a Min Heap, so we pull out the smallest.
  // Wait, let's look at standard heapsort:
  // To sort in ascending order, we use a Max Heap, which places largest elements at the end during sorting.
  // To sort in descending order, we use a Min Heap, which places smallest elements at the end during sorting.
  // Let's implement that logic.

  if (order === 'asc') {
    // Max Heap: parent must be >= children
    if (left < size && compare(list[left], list[largestOrSmallest], key, 'asc') > 0) {
      largestOrSmallest = left;
    }
    if (right < size && compare(list[right], list[largestOrSmallest], key, 'asc') > 0) {
      largestOrSmallest = right;
    }
  } else {
    // Min Heap: parent must be <= children
    if (left < size && compare(list[left], list[largestOrSmallest], key, 'asc') < 0) {
      largestOrSmallest = left;
    }
    if (right < size && compare(list[right], list[largestOrSmallest], key, 'asc') < 0) {
      largestOrSmallest = right;
    }
  }

  // If root is not largest/smallest
  if (largestOrSmallest !== rootIdx) {
    const swap = list[rootIdx];
    list[rootIdx] = list[largestOrSmallest];
    list[largestOrSmallest] = swap;

    // Recursively heapify the affected sub-tree
    heapify(list, size, largestOrSmallest, key, order);
  }
}

/**
 * Dispatcher for products sorting.
 * Selects an algorithm under the hood:
 * - Quick Sort for numerical price sorting (extremely fast for standard numbers).
 * - Merge Sort for alphabetical name sorting (stable sort keeps category/brand groups intact).
 * - Heap Sort for ratings sorting (efficient).
 */
export function sortProducts(products, sortKey, sortOrder = 'asc', forcedAlgo = null) {
  if (!products || products.length === 0) return [];
  
  let algo = forcedAlgo;
  if (!algo) {
    if (sortKey === 'price') {
      algo = 'quick';
    } else if (sortKey === 'name' || sortKey === 'category') {
      algo = 'merge';
    } else {
      algo = 'heap';
    }
  }

  switch (algo) {
    case 'quick':
      return quickSort(products, sortKey, sortOrder);
    case 'merge':
      return mergeSort(products, sortKey, sortOrder);
    case 'heap':
      return heapSort(products, sortKey, sortOrder);
    default:
      return quickSort(products, sortKey, sortOrder);
  }
}

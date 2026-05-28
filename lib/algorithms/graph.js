/**
 * Priority Queue implemented with a Min-Heap for Dijkstra's algorithm.
 */
class MinPriorityQueue {
  constructor() {
    this.heap = [];
  }

  enqueue(node, weight) {
    this.heap.push({ node, weight });
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.sinkDown(0);
    return min;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  bubbleUp(index) {
    const element = this.heap[index];
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];

      if (element.weight >= parent.weight) break;

      this.heap[index] = parent;
      this.heap[parentIndex] = element;
      index = parentIndex;
    }
  }

  sinkDown(index) {
    const length = this.heap.length;
    const element = this.heap[index];

    while (true) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let leftChild, rightChild;
      let swap = null;

      if (leftChildIndex < length) {
        leftChild = this.heap[leftChildIndex];
        if (leftChild.weight < element.weight) {
          swap = leftChildIndex;
        }
      }

      if (rightChildIndex < length) {
        rightChild = this.heap[rightChildIndex];
        if (
          (swap === null && rightChild.weight < element.weight) ||
          (swap !== null && rightChild.weight < leftChild.weight)
        ) {
          swap = rightChildIndex;
        }
      }

      if (swap === null) break;

      this.heap[index] = this.heap[swap];
      this.heap[swap] = element;
      index = swap;
    }
  }
}

/**
 * Builds an adjacency list representation of the graph.
 */
function buildGraph(network) {
  const graph = {};
  
  // Initialize nodes
  for (const node of network.nodes) {
    graph[node.id] = { type: node.type, edges: [] };
  }

  // Add edges (undirected)
  for (const edge of network.edges) {
    if (graph[edge.source] && graph[edge.target]) {
      graph[edge.source].edges.push({
        node: edge.target,
        distance: edge.distance,
        cost: edge.cost,
        time: edge.time
      });
      // Add reverse edge
      graph[edge.target].edges.push({
        node: edge.source,
        distance: edge.distance,
        cost: edge.cost,
        time: edge.time
      });
    }
  }

  return graph;
}

/**
 * Dijkstra's Algorithm to find the optimal delivery path from any warehouse to the destination.
 * Uses a blended weight metric: Weight = (Distance * 0.5) + (Cost * 0.5).
 */
export function findOptimalDeliveryPath(network, destinationId) {
  const graph = buildGraph(network);
  
  // If destination is invalid, return null
  if (!graph[destinationId]) {
    return null;
  }

  const distances = {}; // Stores the min blended weight
  const previous = {};
  const actualDistance = {}; // True distance in km
  const actualCost = {}; // True cost in INR
  const actualTime = {}; // True time in hours

  const pq = new MinPriorityQueue();

  // Initialize data structures
  for (const nodeId in graph) {
    if (nodeId === destinationId) {
      distances[nodeId] = 0;
      actualDistance[nodeId] = 0;
      actualCost[nodeId] = 0;
      actualTime[nodeId] = 0;
      pq.enqueue(nodeId, 0);
    } else {
      distances[nodeId] = Infinity;
      actualDistance[nodeId] = Infinity;
      actualCost[nodeId] = Infinity;
      actualTime[nodeId] = Infinity;
    }
    previous[nodeId] = null;
  }

  // Dijkstra's execution
  while (!pq.isEmpty()) {
    const { node: current } = pq.dequeue();

    // Relax edges
    for (const neighbor of graph[current].edges) {
      // Blended weight metric
      const weight = (neighbor.distance * 0.5) + (neighbor.cost * 0.5);
      const candidateDistance = distances[current] + weight;

      if (candidateDistance < distances[neighbor.node]) {
        distances[neighbor.node] = candidateDistance;
        actualDistance[neighbor.node] = actualDistance[current] + neighbor.distance;
        actualCost[neighbor.node] = actualCost[current] + neighbor.cost;
        actualTime[neighbor.node] = actualTime[current] + neighbor.time;
        previous[neighbor.node] = current;
        pq.enqueue(neighbor.node, candidateDistance);
      }
    }
  }

  // Find the warehouse with the minimum distance to the destination
  let bestWarehouse = null;
  let minWeight = Infinity;

  for (const node of network.nodes) {
    if (node.type === 'warehouse') {
      if (distances[node.id] < minWeight) {
        minWeight = distances[node.id];
        bestWarehouse = node.id;
      }
    }
  }

  if (!bestWarehouse || minWeight === Infinity) {
    return null; // No path found
  }

  // Reconstruct path from the best warehouse to the destination
  const path = [];
  let current = bestWarehouse;
  
  while (current !== null) {
    path.push(current);
    if (current === destinationId) break;
    current = previous[current];
  }

  return {
    path,
    totalDistance: actualDistance[bestWarehouse],
    totalCost: actualCost[bestWarehouse],
    totalTime: actualTime[bestWarehouse],
    warehouse: bestWarehouse
  };
}

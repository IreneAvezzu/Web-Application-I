/**
 * Support method to evaluate the shortest paths from a given station to all reachable stations in the graph of stations and connections using breadth-first search.
 * * @param {number} startStationId - ID of starting station
 * @param {Array} stations - List of all stations from the DB
 * @param {Array} connections - List of all connections from the DB
 * @returns {Map<number, number>} A map with pairs (stationId -> distanceInStops)
 */

export function calculateShortestPaths(startStationId, stations, connections) {
  // Build the adjacency list for the graph
  const adjacencyList = new Map();
  
  stations.forEach(s => adjacencyList.set(s.id, []));
  
  connections.forEach(conn => {
    adjacencyList.get(conn.station_start_id).push(conn.station_end_id);
    adjacencyList.get(conn.station_end_id).push(conn.station_start_id);
  });

  // support data structures for BFS
  const distances = new Map();
  const queue = [];

  // initialize starting point
  distances.set(startStationId, 0);
  queue.push(startStationId);

  // BFS loop
  while (queue.length > 0) {
    const current = queue.shift();
    const currentDistance = distances.get(current);

    const neighbors = adjacencyList.get(current) || [];
    for (const neighbor of neighbors) {
      if (!distances.has(neighbor)) { // not visited yet
        distances.set(neighbor, currentDistance + 1);
        queue.push(neighbor);
      }
    }
  }

  return distances;
}
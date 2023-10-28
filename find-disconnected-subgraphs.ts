import { Graph } from "./graph.ts";
import { getNeighbors } from "./nieghbors.ts";

export const findDisconnectedSubGraphs = <
  I,
  V extends { id: I; visited?: boolean; subgraphId?: number }
>(
  graph: Graph<I, V>
): Graph<I, V>[] => {
  const nodeList = [...graph.vertices];
  const nodesToVisit: typeof nodeList = [];

  let currentSubgraphId = 0;

  while (nodeList.length > 0) {
    const nextNodeToVisit = nodeList.shift();
    if (nextNodeToVisit !== undefined) {
      if (!nextNodeToVisit.visited) {
        nextNodeToVisit.visited = true;
        nextNodeToVisit.subgraphId = currentSubgraphId;
        currentSubgraphId++;
        nodesToVisit.push(nextNodeToVisit);
      }
    }
    while (nodesToVisit.length > 0) {
      const node = nodesToVisit.shift()!;
      node.visited = true;
      const neighbors = getNeighbors(graph, node);
      neighbors.forEach((neighbor) => {
        if (neighbor.visited) {
          return;
        }
        neighbor.visited = true;
        neighbor.subgraphId = currentSubgraphId;

        nodesToVisit.push(neighbor);
      });
    }
  }

  const subGraphVertices = new Map<number, V[]>();

  graph.vertices.forEach((tle) => {
    if (tle.subgraphId === undefined) {
      throw new Error(`No subgraph ID found for ${tle.id}`);
    }
    subGraphVertices.set(tle.subgraphId, [
      ...(subGraphVertices.get(tle.subgraphId) ?? []),
      tle,
    ]);
  });

  const subGraphs: Graph<I, V>[] = [];
  subGraphVertices.forEach((vertices, key) => {
    const vertexIds = vertices.map((v) => v.id);
    subGraphs[key] = {
      vertices,
      edges: graph.edges.filter(
        (edge) => vertexIds.includes(edge[0]) && vertexIds.includes(edge[1])
      ),
    };
  });

  return subGraphs;
};

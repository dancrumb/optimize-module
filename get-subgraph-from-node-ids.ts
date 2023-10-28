import { Graph } from "./graph.ts";

export const getSubGraphFromNodeIds = <I, V extends { id: I }>(
  graph: Graph<I, V>,
  nodeIds: I[]
): Graph<I, V> => {
  const nodeMap = new Map(graph.vertices.map((node) => [node.id, node]));
  return {
    vertices: nodeIds.map((id) => nodeMap.get(id)!),
    edges: graph.edges.filter(
      (e) => nodeIds.includes(e[0]) && nodeIds.includes(e[1])
    ),
  };
};

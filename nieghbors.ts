import { Graph } from "./graph.ts";

export const getNeighbors = <I, V extends { id: I } = { id: I }>(
  graph: Graph<I, V>,
  node: V
): (typeof node)[] => {
  const nodeMap = new Map(graph.vertices.map((node) => [node.id, node]));
  return [...graph.edges]
    .filter((e) => e[0] === node.id || e[1] === node.id)
    .map((e) => nodeMap.get(e[0] === node.id ? e[1] : e[0]))
    .filter((n: V | undefined): n is V => n !== undefined);
};

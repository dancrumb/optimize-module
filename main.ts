import * as tsMorph from "https://deno.land/x/ts_morph@19.0.0/mod.ts";
import { findDisconnectedSubGraphs } from "./find-disconnected-subgraphs.ts";
import { generateDependencyGraph } from "./generate-dependency-graph.ts";
import { tarjan } from "./tarjan.ts";
import { getSubGraphFromNodeIds } from "./get-subgraph-from-node-ids.ts";
import { createDotForDigraph } from "./create-dot-for-digraph.ts";

export type TopLevelEntity = {
  id: string;
  file: string;
  startLine: number;
  endLine: number;
  visited?: boolean;
  subgraphId?: number;
  tsNode: tsMorph.Node;
};

const project = new tsMorph.Project({
  tsConfigFilePath: "../Sutro/packages/sutro-common/tsconfig.json",
});

const graph = generateDependencyGraph(project);

console.log(`Found ${graph.vertices.length} top level nodes`);

console.log(`Found ${graph.edges.length} edges`);

const subGraphs = findDisconnectedSubGraphs<
  TopLevelEntity["id"],
  TopLevelEntity
>(graph);

console.log(subGraphs);

// console.log(graph.vertices);

subGraphs.forEach((digraph, subGraphId) => {
  const sccs = tarjan(digraph);
  sccs.forEach((sccNodeIds, idx) => {
    const subgraph = getSubGraphFromNodeIds<string, TopLevelEntity>(
      graph,
      sccNodeIds
    );
    createDotForDigraph({ graph: subgraph, name: `sg${subGraphId}-scc${idx}` });
    const lineEstimate = subgraph.vertices.reduce((count, vertex) => {
      return count + vertex.endLine - vertex.startLine + 1;
    }, 0);

    if (lineEstimate > 1000) {
      throw new Error("FILE TOO BIG");
    }

    console.log(`Subgraph ${subGraphId} SCC ${idx} has ${lineEstimate} lines`);
    sccNodeIds.forEach((nodeId) => {
      const node = subgraph.vertices.find((v) => v.id === nodeId);
      if (node) {
        console.log("\n");
        console.log(
          `  ${node.id} ${node.file}:${node.startLine}-${node.endLine}`
        );
        console.log(`${node.tsNode.getText()}`);
      }
    });
  });
});

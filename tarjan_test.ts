import { Graph } from "./graph.ts";
import { tarjan } from "./tarjan.ts";

const graph: Graph<number> = {
  vertices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => ({ id })),
  edges: [
    [0, 1],
    [1, 4],
    [1, 6],
    [1, 7],
    [2, 4],
    [2, 6],
    [2, 7],
    [3, 4],
    [3, 6],
    [3, 7],
    [4, 2],
    [4, 3],
    [5, 2],
    [5, 3],
    [6, 5],
    [6, 8],
    [7, 5],
    [7, 8],
    [10, 10],
    [10, 11],
  ],
};

const sccs = tarjan(graph);

console.log({ sccs });

console.log("\n digraph {");
sccs.forEach((scc, idx) => {
  console.log(`\tsubgraph cluster_${idx} {`);
  scc.forEach((node) => console.log(`\t\t${node};`));
  console.log("\t}");
});
console.log("\n");
graph.edges.forEach(([from, to]) => {
  console.log(`\t${from} -> ${to};`);
});

console.log("}\n");

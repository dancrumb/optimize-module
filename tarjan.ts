import { Graph } from "./graph.ts";

export type Node<I> = {
  index?: number;
  lowlink: number;
  onStack: boolean;
  id: I;
};

// algorithm tarjan is
//     input: graph G = (V, E)
//     output: set of strongly connected components (sets of vertices)
export const tarjan = <I>(graph: Graph<I>): I[][] => {
  const { edges } = graph;
  const nodes: Node<I>[] = graph.vertices.map((v) => ({
    id: v.id,
    index: undefined,
    lowlink: 0,
    onStack: false,
  }));

  const sccs: I[][] = [];
  //     index := 0
  //     S := empty stack
  let index = 0;
  const S: Node<I>[] = [];

  //     for each v in V do
  for (const node of nodes) {
    //         if v.index is undefined then
    //             strongconnect(v)
    if (node.index === undefined) {
      strongConnect(node);
    }
  }

  function getSuccessors(from: Node<I>) {
    return edges.filter((e) => e[0] === from.id).map((e) => e[1]);
  }

  //     function strongconnect(v)
  function strongConnect(v: Node<I>) {
    //         // Set the depth index for v to the smallest unused index
    //         v.index := index
    //         v.lowlink := index
    v.index = index;
    v.lowlink = index;

    //         index := index + 1
    index++;

    //         S.push(v)
    S.push(v);
    //         v.onStack := true
    v.onStack = true;

    //         // Consider successors of v
    //         for each (v, w) in E do
    getSuccessors(v).forEach((wId: I) => {
      const w = nodes.find((n) => n.id === wId) ?? {
        index: undefined,
        lowlink: 0,
        onStack: false,
        id: wId,
      };

      //             if w.index is undefined then
      if (w.index === undefined) {
        //                 // Successor w has not yet been visited; recurse on it
        //                 strongconnect(w)
        strongConnect(w);
        //                 v.lowlink := min(v.lowlink, w.lowlink)
        v.lowlink = Math.min(v.lowlink, w.lowlink);
      } else if (w.onStack) {
        //             else if w.onStack then
        //                 // Successor w is in stack S and hence in the current SCC
        //                 // If w is not on stack, then (v, w) is an edge pointing to an SCC already found and must be ignored
        //                 // Note: The next line may look odd - but is correct.
        //                 // It says w.index not w.lowlink; that is deliberate and from the original paper
        //                 v.lowlink := min(v.lowlink, w.index)
        v.lowlink = Math.min(v.lowlink, w.index);
      }
    });
    //         // If v is a root node, pop the stack and generate an SCC
    if (v.lowlink === v.index) {
      //         if v.lowlink = v.index then
      //             start a new strongly connected component
      const scc: I[] = [];
      //             repeat
      let w: Node<I> | undefined;
      do {
        //                 w := S.pop()
        w = S.pop()!;
        //                 w.onStack := false
        w.onStack = false;
        //                 add w to current strongly connected component
        scc.push(w.id);
        //             while w ≠ v
      } while (w !== v);
      //             output the current strongly connected component
      sccs.push(scc);
    }
  }
  return sccs;
};

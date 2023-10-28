export type Graph<I, V extends { id: I } = { id: I }> = {
  vertices: (V & { id: I })[];
  edges: [I, I][];
};

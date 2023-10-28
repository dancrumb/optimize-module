import { Graph } from "./graph.ts";

export const createDotForDigraph = <I extends string, V extends { id: I }>({
  graph,
  name,
}: {
  graph: Graph<I, V>;
  name: string;
}) => {
  const encoder = new TextEncoder();

  const file = Deno.openSync(`./${name}-${graph.edges.length}.dot`, {
    write: true,
    create: true,
  });
  const writeToFile = (line: string) =>
    file.writeSync(encoder.encode(`${line}\n`));

  writeToFile("digraph {");
  const nodeNumbers = new Map(
    graph.vertices.map((node, idx) => [node.id, idx])
  );
  graph.vertices.forEach((node) => {
    writeToFile(
      `\t"${nodeNumbers.get(node.id)}" [label="${node.id.split(":").at(-1)}"];`
    );
  });

  graph.edges.forEach(([from, to]) => {
    writeToFile(`\t"${nodeNumbers.get(from)}" -> "${nodeNumbers.get(to)}";`);
  });

  writeToFile("}\n");
  file.close();
};

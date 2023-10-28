import { debug } from "https://deno.land/x/debug@0.2.0/mod.ts";
import * as tsMorph from "https://deno.land/x/ts_morph@19.0.0/mod.ts";
import { Node } from "https://deno.land/x/ts_morph@19.0.0/mod.ts";
import { Graph } from "./graph.ts";
import { TopLevelEntity } from "./main.ts";

const DEBUG = debug("graph:generate");

type ExtractGraphVertex<G> = G extends Graph<infer _, infer V> ? V : never;

const addEdge = <I>(
  graph: Graph<I>,
  from: ExtractGraphVertex<Graph<I>>,
  to: ExtractGraphVertex<Graph<I>>
) => {
  const isDuplicate = graph.edges.some(
    (e) => e[0] === from.id && e[1] === to.id
  );
  if (isDuplicate) {
    return;
  }
  graph.edges.push([from.id, to.id]);
};

const getNodeId = (n: Node) => {
  const file = n.getSourceFile();
  const fileName = file.getBaseName();

  return `${fileName}::${n.getStartLineNumber()}::${n.getEndLineNumber()}::${getSymbol(
    n
  )}`;
};

const getTopLevelContainer = (r: Node) => {
  const ancestors = r.getAncestors();
  if (Node.isSourceFile(ancestors.at(-1)) === false) {
    throw new Error("Node is not from a SourceFile");
  }
  const topLevel = ancestors.at(-2);
  if (topLevel === undefined) {
    throw new Error("Could not find container");
  }
  if (Node.isVariableStatement(topLevel)) {
    const decls = topLevel.getDeclarations();
    if (decls.length === 1) {
      return decls[0];
    }
  }
  return topLevel;
};

const getSymbol = (n: Node) => {
  if (Node.isExportDeclaration(n)) {
    const specifier = n.getModuleSpecifier();
    if (specifier) {
      return specifier.getText();
    }
  }
  if (Node.isVariableStatement(n)) {
    const decl = n.getDeclarations()[0];
    return decl?.getSymbol()?.getEscapedName() ?? "<NONE>";
  }
  return n.getSymbol()?.getEscapedName() ?? "<NONE>";
};

export const generateDependencyGraph = (
  project: tsMorph.Project
): Graph<TopLevelEntity["id"], TopLevelEntity> => {
  const languageService = project.getLanguageService();
  const sourceFiles = project.getSourceFiles();

  const graph: Graph<TopLevelEntity["id"], TopLevelEntity> = {
    vertices: [],
    edges: [],
  };
  let entityCount = 0;

  sourceFiles.forEach((file) => {
    DEBUG(`${file.getBaseName()} ${file.getScriptKind()}`);
    const topLevelEntities = file
      .getChildSyntaxListOrThrow()
      .getChildren()
      .filter(
        (c) =>
          !Node.isImportDeclaration(c) &&
          !Node.isCommentNode(c) &&
          !Node.isExportDeclaration(c) &&
          !Node.isExportAssignment(c) &&
          !Node.isExpressionStatement(c)
      );
    DEBUG(`\tThere are ${topLevelEntities.length} entities`);
    topLevelEntities.forEach((topLevelEntity) => {
      entityCount++;
      graph.vertices.push({
        id: getNodeId(topLevelEntity),
        file: file.getBaseName(),
        startLine: topLevelEntity.getStartLineNumber(),
        endLine: topLevelEntity.getEndLineNumber(),
        tsNode: topLevelEntity,
      });

      const symb = getSymbol(topLevelEntity);
      const refs = languageService
        .findReferencesAsNodes(topLevelEntity)
        .filter((r) => {
          const topLevelContainer = getTopLevelContainer(r);
          return (
            (Node.isImportDeclaration(topLevelContainer) ||
              Node.isExportDeclaration(topLevelContainer)) === false
          );
        });
      DEBUG(
        `\t\t${symb} (${topLevelEntity.getKindName()}): ${refs.length} refs`
      );
      refs.forEach((r) => {
        const topLevelContainer = getTopLevelContainer(r);
        if (topLevelContainer === topLevelEntity) {
          return;
        }
        DEBUG(
          `\t\t\t${getSymbol(
            topLevelContainer
          )}(${topLevelContainer?.getKindName()})`
        );
        DEBUG(
          `\t\t\t\t${r.getSourceFile().getBaseName()} ${r.getStartLineNumber()}`
        );

        addEdge(
          graph,
          { id: getNodeId(topLevelContainer) },
          { id: getNodeId(topLevelEntity) }
        );
      });
    });
  });

  return graph;
};

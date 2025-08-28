import { visit } from "unist-util-visit";

// wrap every <table> in a scrollable container
export function wrapTables() {
  return (tree: any) => {
    visit(tree, 'element', (node: any, index: number | null, parent: any) => {
      if (!parent || typeof index !== 'number') return;
      if (node.tagName !== 'table') return;

      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-wrap'] },
        children: [node],
      };
    });
  };
}
// lib/mdToHtmlBlog.ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Schema } from 'hast-util-sanitize';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import { wrapTables } from './wrapTablesWithScroll';

function removeUserContentPrefix() {
  return (tree: any) => {
    visit(tree, 'element', (node: any) => {
      if (['h1','h2','h3','h4','h5','h6'].includes(node.tagName) && node.properties?.id) {
        node.properties.id = String(node.properties.id).replace(/^user-content-/, '');
      }
    });
  };
}

const schema: Schema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'div',                 // allow wrapper
    'table','thead','tbody','tr','th','td','hr','pre','code','a'
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a || []), ['href','target','rel','name']],
    td: [...(defaultSchema.attributes?.td || []), ['colspan'], ['rowspan'], ['align']],
    th: [...(defaultSchema.attributes?.th || []), ['colspan'], ['rowspan'], ['align']],
    code: [...(defaultSchema.attributes?.code || []), ['className']],
    div: [...(defaultSchema.attributes?.div || []), ['className']], // allow class on wrapper
    h1: [...(defaultSchema.attributes?.h1 || []), ['id']],
    h2: [...(defaultSchema.attributes?.h2 || []), ['id']],
    h3: [...(defaultSchema.attributes?.h3 || []), ['id']],
    h4: [...(defaultSchema.attributes?.h4 || []), ['id']],
    h5: [...(defaultSchema.attributes?.h5 || []), ['id']],
    h6: [...(defaultSchema.attributes?.h6 || []), ['id']],
  },
};

export function mdToHtml(md: string): string {
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { properties: { className: ['anchor'] } })
    .use(rehypeSanitize, schema)
    .use(removeUserContentPrefix)
    .use(wrapTables)
    .use(rehypeStringify)
    .processSync(md);

  return String(file);
}

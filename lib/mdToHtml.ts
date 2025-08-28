import { unified } from 'unified';                        // Jadro procesora
import remarkParse from 'remark-parse';                   // Parsovanie MD → MDAST
import remarkGfm from 'remark-gfm';                       // GFM: tabuľky, checkboxy…
import remarkRehype from 'remark-rehype';                 // MD → HTML AST
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'; // Sanitize HTML / Sanitácia HTML
import { Schema } from 'hast-util-sanitize';              // Typ schémy
import rehypeStringify from 'rehype-stringify';           // HAST → HTML string / HTML reťazec
import { wrapTables } from './wrapTablesWithScroll';

// Rozširenie sanitacii: povoľ tabuľky
const schema: Schema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'table','thead','tbody','tr','th','td',
    'hr', 'pre', 'code'
  ],
  attributes: {
    ...defaultSchema.attributes,
    // Povoľ colspan/rowspan pre bunky/hlavičky
    td: [...(defaultSchema.attributes?.td || []), ['colspan'], ['rowspan']],
    th: [...(defaultSchema.attributes?.th || []), ['colspan'], ['rowspan']],
    code: [
      ...defaultSchema.attributes.code || [],
      ['className']
    ]
  },
};

export function mdToHtml(md: string): string {
  console.log(md)
  return String(
    unified()
      .use(remarkParse)          // Parsuj markdown
      .use(remarkGfm)            // GitHub flavor (tables, strikethrough, tasks)
      .use(remarkRehype)         // MD → HTML
      .use(rehypeSanitize, schema) // Safe HTML
      .use(wrapTables)
      .use(rehypeStringify)      // HTML string
      .processSync(md)           // Synchrónne spracovanie
  );
}
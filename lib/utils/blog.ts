// lib/utils/blog.ts
export function stripHtml(html: string) {
  return String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function makeExcerpt(html: string, max = 200) {
  const txt = stripHtml(html);
  return txt.length <= max ? txt : txt.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

export function extractCover(html: string): string | null {
  const m = String(html || '').match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

export function slugify(s: string) {
  return String(s || '')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

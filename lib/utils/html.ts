// lib/utils/html.ts
/** Doplní class pre <img> v blogovom HTML + lazy-load. */
export function enhancePostHtml(html: string) {
  let s = String(html || '');

  // doplniť loading="lazy" ak chýba
  s = s.replace(/<img(?![^>]*\bloading=)/gi, '<img loading="lazy"');

  // ak už class existuje → vlož 'blog-img' na začiatok
  s = s.replace(
    /<img([^>]*?)\bclass=["']([^"']*)["']([^>]*?)>/gi,
    (_m, pre, cls, post) => `<img${pre} class="blog-img ${cls}"${post}>`
  );

  // ak class neexistuje → pridaj celú class atribút
  s = s.replace(/<img((?:(?!class=)[^>])*)>/gi, '<img class="blog-img"$1>');

  return s;
}

export function isLikelyHtml(s: string) {
  return /<\/?[a-z][\s\S]*>/i.test(String(s || ''));
}

function escapeHtml(s: string) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Z „holého“ textu spraví HTML s odsekmi a <br> pre jedno-riadkové zlomy. */
export function textToHtml(text: string) {
  const t = String(text || '').trim();
  if (!t) return '';
  return t
    .split(/\n{2,}/)            // prázdny riadok = nový odsek
    .map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
    .join('\n');
}
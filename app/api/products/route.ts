// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { requireAdmin } from '@/app/api/_helpers';

function toInt(v: any, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : d;
}

function str(v: any) {
  return String(v ?? '').trim();
}

function toArray(x: any): string[] {
  if (!x) return [];
  if (Array.isArray(x)) return x.map(String).map((s) => s.trim()).filter(Boolean);
  try {
    const arr = JSON.parse(String(x));
    if (Array.isArray(arr)) return arr.map(String).map((s) => s.trim()).filter(Boolean);
  } catch {}
  return String(x)
    .split(/\r?\n|,\s*/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function normalize(body: any) {
  const images = toArray(body.images);
  const data = {
    slug: str(body.slug),
    name: str(body.name),
    category: str(body.category),
    mode: str(body.mode),
    blurb: str(body.blurb),
    content: str(body.content), // Markdown
    tags: str(body.tags),
    image: str(body.image) || '/images/products/placeholder.jpg',
    images: JSON.stringify(images),
    wlen: toInt(body.wlen),
    power: toInt(body.power),
    price: toInt(body.price),
    salePrice: body.salePrice ? toInt(body.salePrice) : null,
    vatPercent: toInt(body.vatPercent ?? 20, 20),
    currency: str(body.currency || 'EUR'),
    availability: str(body.availability || 'in_stock'),
  };

  for (const k of ['slug', 'name', 'category', 'mode']) {
    if (!(data as any)[k]) throw new Error(`Missing field: ${k}`);
  }

  if (!(data.wlen > 0) || !(data.power > 0)) {
    throw new Error('wlen/power musia byť čísla > 0');
  }
  
  return data;
}

function view(row: any) {
  if (!row) return row;
  let imgs: any = [];
  try {
    imgs = JSON.parse(row.images || '[]');
  } catch {
    imgs = [];
  }
  return { ...row, images: Array.isArray(imgs) ? imgs : [] };
}

// GET /api/products  (zoznam)
export async function GET() {
  const items = await query<any>('SELECT * FROM Product ORDER BY createdAt DESC');
  return NextResponse.json(items.map(view));
}

// POST /api/products  (vytvoriť)
export async function POST(req: Request) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;

  try {
    const body = await req.json();
    const d = normalize(body);

    // kontrola unikátneho slugu
    const ex = await query<any>('SELECT id FROM Product WHERE slug = ?', [d.slug]);
    if (ex.length) {
      return NextResponse.json({ error: 'Slug už existuje.' }, { status: 409 });
    }

    const cols = [
      'slug',
      'name',
      'category',
      'mode',
      'blurb',
      'content',
      'tags',
      'image',
      'images',
      'wlen',
      'power',
      'price',
      'salePrice',
      'vatPercent',
      'currency',
      'availability',
    ];
    const vals = [
      d.slug,
      d.name,
      d.category,
      d.mode,
      d.blurb,
      d.content,
      d.tags,
      d.image,
      d.images,
      d.wlen,
      d.power,
      d.price,
      d.salePrice,
      d.vatPercent,
      d.currency,
      d.availability,
    ];

    await execute(
      `INSERT INTO Product (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`,
      vals
    );
    const row = (await query<any>('SELECT * FROM Product WHERE slug = ? LIMIT 1', [d.slug]))[0];
    return NextResponse.json(view(row), { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Chyba' }, { status: 400 });
  }
}

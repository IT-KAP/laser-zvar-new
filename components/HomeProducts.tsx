import Link from "next/link";
import PriceTag from "@/components/PriceTag";
import { query } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";

type Row = {
  id: number;
  slug: string;
  name: string;
  category?: string;
  image?: string;
  images?: string;
  price: number;
  salePrice?: number | null;
  vatPercent: number;
};

async function getRandomProducts(limit = 3): Promise<Row[]> {
  // 1) Rýchla kontrola počtu (ak je málo riadkov, netreba random okno)
  const [{ c }] = await query<{ c: number }>("SELECT COUNT(*) AS c FROM Product");
  if (c === 0) return [];
  if (c <= limit) {
    const all = await query<Row>("SELECT * FROM Product ORDER BY id DESC LIMIT ?", [limit]);
    return all;
  }

  // 2) Nájdeme ID rozsah (robíme v 1 dotaze)
  const [{ minId, maxId }] = await query<{ minId: number; maxId: number }>(
    "SELECT MIN(id) AS minId, MAX(id) AS maxId FROM Product"
  );

  // Bezpečnosť na jeden riadok rozsahu
  if (minId === null || maxId === null) return [];

  // 3) Náhodný začiatok
  const r = Math.floor(Math.random() * (maxId - minId + 1)) + minId;

  // 4) Načítaj okno od r nahor
  let rows: Row[] = await query<Row>(
    "SELECT * FROM Product WHERE id >= ? ORDER BY id ASC LIMIT ?",
    [r, limit]
  );

  // 5) Ak nestačí, zober „zabalene“ od začiatku
  if (rows.length < limit) {
    const missing = limit - rows.length;
    const wrap = await query<Row>(
      "SELECT * FROM Product WHERE id < ? ORDER BY id ASC LIMIT ?",
      [r, missing]
    );
    rows = rows.concat(wrap);
  }

  // 6) Ľahko premiešaj poradie (aby nebolo stále vzostupné)
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }

  return rows.slice(0, limit);
}

export default async function HomeProducts() {
  noStore(); // žiadne kešovanie – nech je to náhodné pri každom načítaní

  const rows = await getRandomProducts(3);

  const items = rows.map((p: any) => {
    // vyber cover: `image` alebo prvý z `images` (JSON), inak placeholder
    let cover: string | undefined = p.image;
    if (!cover) {
      try {
        const imgs = JSON.parse(p.images || "[]");
        if (Array.isArray(imgs) && imgs[0]) cover = imgs[0];
      } catch {}
    }
    return { ...p, cover: cover || "/images/products/placeholder.jpg" };
  });

  if (!items.length) return null;

  return (
    <section className="container section">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-semibold">Vybrané produkty</h2>
        <Link href="/produkty" className="btn btn-outline">
          Všetky produkty
        </Link>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p: any) => (
          <Link
            key={p.id}
            href={`/produkt/${p.slug}`}
            className="card overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Obrázok – celý produkt, bez orezania (aspect 4:3, padding) */}
            <div className="bg-slate-900/60 rounded-t-2xl border-b border-slate-700/40">
              <div className="relative w-full pt-[75%] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.cover}
                  alt={p.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-contain p-4"
                />
              </div>
            </div>

            <div className="p-4 grid gap-1">
              <div className="kicker">{String(p.category || "").toUpperCase()}</div>
              <div className="font-semibold leading-snug">{p.name}</div>
              <PriceTag
                price={p.price}
                salePrice={p.salePrice ?? undefined}
                vatPercent={p.vatPercent}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

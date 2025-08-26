import Link from "next/link";
import Top from "@/components/Top";
import PriceTag from "@/components/PriceTag";
import SafeImg from "@/components/SafeImg";
import { query } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import StarRating from "@/components/StarRating";


export const dynamic = "force-dynamic";

type Row = {
  id: number;
  slug: string;
  name: string;
  category?: string | null;
  image?: string | null;
  images?: string | string[] | null;
  price: number;
  salePrice?: number | null;
  vatPercent: number;
  ratingAvg?: number | null;
  ratingCount?: number | null;
  blurb?: string | null;
};


/** Vyber spoľahlivo cover z image / images a oprav relatívnu cestu. */
function pickCover(p: Row): string {
  let cover = (p.image ?? "").toString().trim();

  if (!cover) {
    try {
      const arr = Array.isArray(p.images) ? p.images : JSON.parse((p.images ?? "[]").toString());
      if (Array.isArray(arr) && arr[0]) cover = String(arr[0]).trim();
    } catch { /* ignore */ }
  }

  if (cover && !/^https?:\/\//i.test(cover) && !cover.startsWith("/")) cover = "/" + cover;
  return cover || "/images/products/placeholder.jpg";
}


export default async function ProductsPage() {
  noStore();
  const rows = await query<Row>("SELECT * FROM Product ORDER BY createdAt DESC");

  return (
    <Top>
      <div className="container section">
        <div className="kicker">Katalóg</div>
        <h1 className="text-3xl font-semibold">Produkty</h1>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => {
            const cover = pickCover(p);

            return (
              <Link
                key={p.id}
                href={`/produkt/${p.slug}`}
                className="card overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Obrázok – JEDEN ratio wrapper (bez ďalších spacerov nad ním) */}
                <div className="bg-slate-900/60 rounded-t-2xl border-b border-slate-700/40">
                  {/* 16:9; ak chceš vyšší náhľad, zmeň na pt-[60%] alebo pt-[66.66%] */}
                  <div className="relative w-full pt-[56.25%] overflow-hidden">
                    <SafeImg
                      src={cover}
                      alt={p.name}
                      className="absolute inset-0 w-full h-full object-contain p-3"
                    />
                  </div>
                </div>

                {/* Text časti karty */}
                <div className="p-4 grid gap-1">
                  <div className="kicker">{String(p.category || "").toUpperCase()}</div>
                  <div className="font-semibold leading-snug line-clamp-2">{p.name}</div>
                  <StarRating value={Number(p.ratingAvg || 0)} count={Number(p.ratingCount || 0)} readOnly size={16} />
                  
{p.blurb && (
  <p className="text-sm text-slate-400 line-clamp-2 mt-1">{p.blurb}</p>
)}
                  <PriceTag
                    price={p.price}
                    salePrice={p.salePrice ?? undefined}
                    vatPercent={p.vatPercent}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Top>
  );
}

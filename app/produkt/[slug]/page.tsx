import { headers } from "next/headers";
import { mdToHtml } from "@/lib/mdToHtml";
import Link from "next/link";
import Top from "@/components/Top";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

async function getProduct(slug:string){
  const base = getBaseUrl();
  const res = await fetch(new URL(`/api/products?slug=${encodeURIComponent(slug)}`, base), { cache: "no-store" });
  if(!res.ok) return null;
  const list = await res.json();
  // ak tvoja list route nepodporuje ?slug, môžeš mať /api/products/by-slug/[slug]
  const item = Array.isArray(list) ? list.find((x:any)=>x.slug===slug) : null;
  return item || null;
}

export default async function ProductPage({ params }:{ params:{ slug:string } }){
  const p = await getProduct(params.slug);
  if(!p) return <div className="container section"><Link href="/products" className="btn btn-outline">← Naspäť</Link><p className="mt-6">Produkt sa nenašiel.</p></div>;

  const html = mdToHtml(p.content || "");

  return (
    <Top>
    <div className="container section">
      <Link href="/produkty" className="btn btn-outline">← Späť na produkty</Link>

      <div className="grid lg:grid-cols-2 gap-8 mt-6">
        {/* Galéria / obrázok */}
        <div className="card p-0 overflow-hidden">
          <img src={p.image} alt={p.name} className="w-full h-auto object-contain" />
        </div>

        {/* Hlavné info */}
        <div>
          <h1 className="text-3xl font-semibold">{p.name}</h1>
          <div className="mt-2 text-sm text-muted-foreground">{p.category?.toUpperCase()} • {p.mode}</div>
          <div className="mt-3 text-2xl font-bold">{p.price} {p.currency || 'EUR'}</div>
          {p.salePrice && <div className="text-sm text-rose-400">Akciová cena: {p.salePrice} {p.currency||'EUR'}</div>}
          {p.blurb && <p className="mt-3 text-muted-foreground">{p.blurb}</p>}
        </div>
      </div>

      {/* OBSAH (Markdown) */}
      <article className="md-body mt-8 prose prose-invert max-w-none mt-10" dangerouslySetInnerHTML={{ __html: html || "<p><em>Bez popisu.</em></p>" }} />

      {/* prípadne ďalšie sekcie… */}
    </div>
    </Top>
  );
}

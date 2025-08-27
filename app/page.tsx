import Top from "@/components/Top";
import Link from "next/link";
import HomeProducts from "@/components/HomeProducts";
export default function Home(){
  return (<Top>
    <main>
      <section className="container section grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="kicker">Vláknové • CO₂ • YAG</div>
          <h1 className="mt-3 text-5xl font-semibold leading-tight">Priemyselné lasery novej generácie</h1>
          <p className="mt-5 text-lg text-slate-300/90 max-w-prose">Rezanie, zváranie, gravírovanie, čistenie – škálovateľné riešenia s nízkou údržbou. Integrované bezpečne, rýchlo a precízne.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link className="btn btn-primary" href="/kontakt">Získať konzultáciu</Link>
            <Link className="btn btn-outline" href="/produkty">Pozrieť produkty</Link>
          </div>
        </div>
        <div className="card overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/products/laser.jpeg" alt="Fiber LZR 3000" className="w-full h-full object-cover" />
        </div>
      </section>
      <HomeProducts />
    </main>
  </Top>);
}

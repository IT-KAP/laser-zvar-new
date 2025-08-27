import Top from "@/components/Top";
export default function Kontakt(){
  const action = process.env.NEXT_PUBLIC_FORMSPREE || "https://formspree.io/f/mkgzarvq";
  return (<Top>
    <div className="container section grid md:grid-cols-2 gap-8">
      <div>
        <div className="kicker">Kontakt</div>
        <h1 className="text-3xl font-semibold">Napíšte nám</h1>
        <p className="text-slate-400 mt-2">Získajte rýchlu konzultáciu k vašej aplikácii a materiálom.</p>
        <form action={action} method="POST" className="grid gap-3 mt-6 card p-5">
          <input className="input" name="name" placeholder="Meno" required />
          <input className="input" name="email" type="email" placeholder="Email" required />
          <input className="input" name="phone" placeholder="Telefón" />
          <textarea className="textarea h-32" name="message" placeholder="Správa" required />
          <button className="btn btn-primary" type="submit">Odoslať</button>
        </form>
      </div>
      <div className="card p-6">
        <div className="font-semibold">ITKAP-SK s.r.o.</div>
        <div className="text-slate-400 text-sm">Priemyselné lasery na zváranie, čistenie, rezanie, gravírovanie a iné</div>
        <div className="text-slate-400 text-sm">Výroba a údržba strojných zariadení</div>
        <div className="mt-4 text-sm">Adresa: Bancíkovej 1/A, 821 03 Bratislava</div>
        <div className="mt-4 text-sm">IČO: 44 009 224</div>
        <div className="mt-4 text-sm">IČDPH: SK2022550750</div>
        <div className="mt-4 text-sm">Prevádzky: Košice, Pri bitúnku 5 | Prešov, Čapajevová 40</div>
        <div className="mt-4 text-sm">THINKSY: Tolstého 3, 040 01 Košice</div>
        <div className="mt-4 text-sm"><a href="mailto:info@itkap.sk">Email: info@itkap.sk</a></div>
        <div className="text-sm"><a href="tel:+421911150171">Tel.: +421 911 150 171</a></div>
      </div>
    </div>
  </Top>);
}

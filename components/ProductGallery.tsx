'use client';
import { useState, useMemo } from 'react';
import Lightbox from './Lightbox';

export default function ProductGallery({ images }: { images: string[] }) {
  const list = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const u of images || []) {
      const s = String(u || '').trim();
      if (s && !seen.has(s)) { seen.add(s); out.push(s); }
    }
    if (!out.length) out.push('/images/products/placeholder.jpg');
    return out;
  }, [images]);

  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const active = list[idx];

  return (
    <div className="w-full">
      {/* hlavný obrázok */}
      <div
        className="bg-slate-900/60 rounded-2xl border border-slate-700/40 cursor-zoom-in"
        onClick={()=> setOpen(true)}
        aria-label="Zväčšiť obrázok"
      >
        <div className="relative w-full pt-[75%] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={active} alt="produkt" className="absolute inset-0 w-full h-full object-contain p-4" />
        </div>
      </div>

      {/* náhľady */}
      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto snap-x no-scrollbar">
          {list.map((u, i) => (
            <button
              key={u + i}
              onClick={() => setIdx(i)}
              className={`shrink-0 rounded-xl border transition-colors snap-start ${
                i === idx ? 'border-cyan-500/60 bg-slate-900/70' : 'border-slate-700/40 bg-slate-900/50'
              }`}
              aria-label={`Náhľad ${i + 1}`}
            >
              <div className="relative h-20 w-28 md:h-24 md:w-32 overflow-hidden rounded-[10px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="absolute inset-0 w-full h-full object-contain p-1.5" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* LIGHTBOX */}
      {open && (
        <Lightbox
          images={list}
          index={idx}
          onChange={(n)=>setIdx(n)}
          onClose={()=>setOpen(false)}
        />
      )}
    </div>
  );
}


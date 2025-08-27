'use client';
import { useMemo, useState } from 'react';

type Props = {
  value: number;           // priemer 0..5
  count?: number;          // počet hodnotení
  productId?: number;      // ak je a readOnly=false -> umožní odoslať
  readOnly?: boolean;
  size?: number;           // px veľkosť hviezdy
  className?: string;
};

const Star = ({ filled }: { filled: number }) => {
  // filled: 0..1 (podiel výplne)
  return (
    <span className="relative inline-block align-middle" style={{ width: 20, height: 20 }}>
      <svg viewBox="0 0 24 24" className="absolute inset-0 text-slate-600/60" width="20" height="20">
        <path fill="currentColor" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
      </svg>
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${Math.max(0, Math.min(1, filled)) * 100}%` }}>
        <svg viewBox="0 0 24 24" className="text-yellow-400" width="20" height="20">
          <path fill="currentColor" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      </div>
    </span>
  );
};

export default function StarRating({ value, count, productId, readOnly, size = 20, className }: Props) {
  const safe = Math.max(0, Math.min(5, Number(value || 0)));
  const [hover, setHover] = useState<number | null>(null);
  const current = hover ?? safe;
  const stars = useMemo(() => {
    const s = [];
    for (let i = 0; i < 5; i++) {
      const left = Math.max(0, Math.min(1, current - i));
      s.push(<Star key={i} filled={left} />);
    }
    return s;
  }, [current]);

async function rate(star: number) {
  if (readOnly || !productId) return;
  const res = await fetch(`/api/products/${productId}/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stars: star }),
  });
  const data = await res.json();
  if (!res.ok) { alert(data?.error || 'Chyba hodnotenia'); return; }

  // lokálne aktualizuj priemer a počet
  setHover(null);
  // ak máš v komponente lokálny stav pre zobrazenie:
  // setLocalAvg(data.ratingAvg); setLocalCount(data.ratingCount);
  alert('Ďakujeme za hodnotenie!');
}



  return (
    <div className={`inline-flex items-center gap-2 ${className || ''}`} style={{ fontSize: size }}>
      <div
        className={`inline-flex items-center gap-0.5 ${readOnly || !productId ? 'cursor-default' : 'cursor-pointer'}`}
        onMouseLeave={() => setHover(null)}
      >
        {[0,1,2,3,4].map(i => (
          <span
            key={i}
            onMouseEnter={() => !readOnly && productId && setHover(i + 1)}
            onClick={() => rate(i + 1)}
          >
            <Star filled={Math.max(0, Math.min(1, current - i))} />
          </span>
        ))}
      </div>
      <span className="text-sm text-slate-400 align-middle">
        {safe.toFixed(1)}{typeof count === 'number' ? ` · ${count}` : ''}
      </span>
    </div>
  );
}

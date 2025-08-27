'use client';
import { useEffect, useRef, useState } from 'react';

export default function Lightbox({
  images,
  index,
  onClose,
  onChange,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onChange: (next: number) => void;
}) {
  const [i, setI] = useState(index);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const start = useRef<{ x: number; y: number } | null>(null);

  function resetView(){ setScale(1); setPos({x:0,y:0}); }
  function prev(){ const n=(i-1+images.length)%images.length; setI(n); onChange(n); resetView(); }
  function next(){ const n=(i+1)%images.length; setI(n); onChange(n); resetView(); }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; };
  }, [i]);

  function toggleZoom(e: React.MouseEvent) {
    e.preventDefault();
    if (scale > 1) { setScale(1); setPos({ x: 0, y: 0 }); }
    else { setScale(2.5); }
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const s = Math.min(4, Math.max(1, scale + (e.deltaY > 0 ? -0.2 : 0.2)));
    setScale(s);
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    start.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!start.current || scale === 1) return;
    setPos({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
  }
  function onPointerUp(){ start.current = null; }

  // swipe na mobile (pri scale===1)
  const swipe = useRef<{ x:number, t:number } | null>(null);
  function onTouchStart(e: React.TouchEvent){ swipe.current = { x:e.touches[0].clientX, t:Date.now() }; }
  function onTouchEnd(e: React.TouchEvent){
    if(!swipe.current || scale!==1) return;
    const dx = e.changedTouches[0].clientX - swipe.current.x;
    const dt = Date.now() - swipe.current.t;
    if(Math.abs(dx)>60 && dt<500){ dx>0 ? prev() : next(); }
    swipe.current = null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm"
      role="dialog" aria-modal="true"
    >
      {/* CLOSE – vždy navrchu */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-30 btn btn-outline"
        aria-label="Zavrieť"
      >
        ✕
      </button>

      {/* ŠÍPKY – nad obrazom */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20"
            aria-label="Predchádzajúci"
          >
            ←
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20"
            aria-label="Nasledujúci"
          >
            →
          </button>
        </>
      )}

      {/* OBRÁZOK – vrstva pod tlačidlami (z-10) */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center select-none"
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        // zabráni klikom „preskákať“ na overlay
        onClick={(e)=>e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[i]}
          alt=""
          onDoubleClick={toggleZoom}
          onClick={toggleZoom}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="max-h-[88vh] max-w-[92vw] cursor-zoom-in"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transition: start.current ? 'none' : 'transform .15s ease',
          }}
        />
      </div>

      {/* THUMBS – nad obrazom */}
      {images.length > 1 && (
        <div className="absolute left-0 right-0 bottom-3 z-20 mx-auto flex gap-2 justify-center">
          {images.map((u, idx)=>(
            <button key={u+idx} type="button"
              onClick={()=>{ const n=idx; setI(n); onChange(n); resetView(); }}
              className={`h-12 w-16 rounded-md overflow-hidden border ${i===idx?'border-cyan-400':'border-white/30'} bg-white/10`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

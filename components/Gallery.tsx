'use client';
import { useEffect, useRef, useState } from 'react';

type Props = {
  images: string[];
  intervalMs?: number; // autoplay interval
};

export default function Gallery({ images, intervalMs = 3500 }: Props){
  const list = (images || []).filter(Boolean);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const deltaX = useRef(0);
  const timer = useRef<any>(null);

  useEffect(() => {
    if (!playing || list.length <= 1) return;
    timer.current = setInterval(() => {
      setIdx(i => (i + 1) % list.length);
    }, intervalMs);
    return () => clearInterval(timer.current);
  }, [playing, list.length, intervalMs]);

  useEffect(() => {
    if (!playing || list.length <= 1) return;
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setIdx(i => (i + 1) % list.length);
    }, intervalMs);
    return () => clearInterval(timer.current);
  }, [idx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function prev(){ setIdx(i => (i - 1 + list.length) % list.length); }
  function next(){ setIdx(i => (i + 1) % list.length); }

  function onPointerDown(e: React.PointerEvent){
    if (!trackRef.current) return;
    trackRef.current.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    deltaX.current = 0;
    setPlaying(false);
  }
  function onPointerMove(e: React.PointerEvent){
    if (startX.current == null) return;
    deltaX.current = e.clientX - startX.current;
    if (trackRef.current){
      const w = trackRef.current.clientWidth || 1;
      trackRef.current.style.transform = `translateX(${(-idx * 100) + (deltaX.current / w) * 100}%)`;
    }
  }
  function onPointerUp(_e: React.PointerEvent){
    if (trackRef.current){
      trackRef.current.style.transform = '';
    }
    if (startX.current != null){
      const moved = deltaX.current;
      const threshold = (trackRef.current?.clientWidth || 300) * 0.15;
      if (moved > threshold) prev();
      else if (moved < -threshold) next();
    }
    startX.current = null;
    deltaX.current = 0;
  }

  if (!list.length) return null;

  return (
    <div className="grid gap-3 select-none">
      <div
        className="relative overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-900/60"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Track */}
        <div
          ref={trackRef}
          className="whitespace-nowrap transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${-idx * 100}%)` }}
        >
          {list.map((u, i) => (
            <div key={u + '-' + i} className="inline-block align-top w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt={'img-' + i} className="w-full h-full object-contain block" />
            </div>
          ))}
        </div>

        {/* Arrows */}
        {list.length > 1 && (
          <>
            <button
              aria-label="Predchádzajúci"
              onClick={() => { setPlaying(false); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 text-white grid place-items-center hover:bg-black/70"
            >‹</button>
            <button
              aria-label="Ďalší"
              onClick={() => { setPlaying(false); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 text-white grid place-items-center hover:bg-black/70"
            >›</button>
          </>
        )}

        {/* Dots */}
        {list.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
            {list.map((_, i) => (
              <button
                key={'dot-'+i}
                className={`h-2 w-2 rounded-full ${i===idx?'bg-white':'bg-white/40'}`}
                onClick={() => { setPlaying(false); setIdx(i); }}
                aria-label={'Slide ' + (i+1)}
              />
            ))}
          </div>
        )}

        {/* Play/Pause */}
        {list.length > 1 && (
          <button
            onClick={() => setPlaying(p => !p)}
            className="absolute top-2 right-2 text-xs btn btn-outline px-2 py-1"
          >
            {playing ? 'Pause' : 'Play'}
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {list.length > 1 && (
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
          {list.map((u, i) => (
            <button
              key={'thumb-'+i}
              onClick={() => { setPlaying(false); setIdx(i); }}
              className={`card p-1 ${i===idx ? 'ring-2 ring-cyan-400' : ''}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt={'thumb-'+i} className="h-16 w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

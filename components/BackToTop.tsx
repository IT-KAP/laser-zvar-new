'use client';
import { useEffect, useState } from 'react';

export default function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 rounded-full p-3
                 bg-white/10 hover:bg-white/20 border border-white/20
                 backdrop-blur text-white shadow-md"
      aria-label="Hore"
      title="Hore"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 5l-6 6m6-6l6 6" stroke="currentColor" strokeWidth="1.9"
              strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

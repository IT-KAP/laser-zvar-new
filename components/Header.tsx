'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PriceControls from './PriceControls';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Potrebné pre createPortal na klientovi
  useEffect(() => setMounted(true), []);

  // Lock scroll pozadia pri otvorenom menu (mobil)
  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      root.style.overflow = 'hidden';
      root.style.touchAction = 'none';
    } else {
      root.style.overflow = '';
      root.style.touchAction = '';
    }
    return () => {
      root.style.overflow = '';
      root.style.touchAction = '';
    };
  }, [open]);

  // ESC a resize: zavrieť panel
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onResize = () => setOpen(false);
    window.addEventListener('keydown', onEsc);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onEsc);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
      {/* Riadok headeru */}
      <div className="relative flex h-14 md:h-20 items-center">
        {/* === LOGO – MOBIL: vystredené === */}
        <Link
          href="/"
          aria-label="ITKAP – domov"
          className="absolute left-1/2 -translate-x-1/2 z-10 md:hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ITKAP_Logo_A_BracketSpark.svg"
            alt="ITKAP"
            className="h-8 w-auto"
          />
        </Link>

        {/* === LOGO – DESKTOP: vľavo full-bleed === */}
        <Link
          href="/"
          aria-label="ITKAP – domov"
          className="hidden md:block shrink-0 pl-[env(safe-area-inset-left)] px-3"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ITKAP_Logo_A_BracketSpark.svg"
            alt="ITKAP"
            className="h-12 lg:h-14 w-auto"
          />
        </Link>

        {/* Pravá časť (nav / hamburger) */}
        <div className="flex-1">
          <div className="container flex items-center justify-end gap-3 md:gap-6">
            {/* Desktop navigácia */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/produkty" className="text-slate-300 hover:text-white/90">Produkty</Link>
              <Link href="/blog" className="text-slate-300 hover:text-white/90">Blog</Link>
              <Link href="/kontakt" className="text-slate-300 hover:text-white/90">Kontakt</Link>
              <Link href="https://itkap.sk" className="text-slate-300 hover:text-white/90">ITKAP</Link>
              <PriceControls />
            </nav>

            {/* Hamburger – len na mobile, vpravo */}
            <button
              type="button"
              aria-label="Menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-700/60 text-slate-200 hover:bg-slate-900"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobilný panel mimo headeru (portal) */}
      {mounted && open &&
        createPortal(<MobileDrawer onClose={() => setOpen(false)} />, document.body)
      }
    </header>
  );
}

/* ===== Mobilná zásuvka / hamburger menu ===== */
function MobileDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] md:hidden">
      {/* tmavý overlay */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* zásuvka sprava – nepriehľadná, vlastný scroll */}
      <aside
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        className="absolute right-0 top-0 h-full w-[88%] max-w-[420px]
                   bg-slate-950 shadow-2xl ring-1 ring-slate-800
                   flex flex-col overflow-y-auto
                   pt-[env(safe-area-inset-top)]"
      >
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800">
          <span className="text-slate-300 text-sm">Menu</span>
          <button
            aria-label="Zavrieť menu"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="m-auto">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Žiadny .container – priamy padding bez veľkých odsadení */}
        <nav className="p-4 space-y-3">
          <MobileLink href="/produkty" onDone={onClose}>Produkty</MobileLink>
          <MobileLink href="/blog" onDone={onClose}>Blog</MobileLink>
          <MobileLink href="/kontakt" onDone={onClose}>Kontakt</MobileLink>
          <MobileLink href="https://itkap.sk" onDone={onClose}>ITKAP</MobileLink>
          < PriceControls />
        </nav>

        <div className="mt-auto p-4 text-xs text-slate-500">
          © {new Date().getFullYear()} ITKAP-SK – Všetky práva vyhradené.
        </div>
      </aside>
    </div>
  );
}

function MobileLink({
  href,
  children,
  onDone,
}: {
  href: string;
  children: React.ReactNode;
  onDone?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onDone}
      className="block rounded-xl px-4 py-3 text-base text-slate-200
                 bg-slate-900 hover:bg-slate-800
                 border border-slate-800"
    >
      {children}
    </Link>
  );
}

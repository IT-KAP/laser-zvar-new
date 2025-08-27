function MobileLink({
  href, children, onDone,
}: { href: string; children: React.ReactNode; onDone?: () => void }) {
  return (
    <a
      href={href}
      onClick={onDone}
      className="block rounded-xl px-4 py-3 text-base text-slate-200
                 bg-slate-900 hover:bg-slate-800
                 border border-slate-800"
    >
      {children}
    </a>
  );
}
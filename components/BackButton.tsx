'use client';
import { useRouter } from 'next/navigation';

export default function BackButton({
  className = '',
  href,                        // voliteľný fallback (napr. /produkty alebo /blog)
  children = 'Naspäť',
}: { className?: string; href?: string; children?: React.ReactNode }) {
  const router = useRouter();

  function goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else if (href) {
      router.push(href);
    } else {
      router.push('/');
    }
  }

  return (
    <button type="button" onClick={goBack} className={`btn btn-outline ${className}`}>
      ← {children}
    </button>
  );
}

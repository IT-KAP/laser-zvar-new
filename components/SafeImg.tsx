'use client';
import { useState } from 'react';

type Props = {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  draggable?: boolean;
};

/** Obrázok s fallbackom na placeholder – event handler ostáva v client komponente. */
export default function SafeImg({
  src,
  alt,
  className,
  loading = 'lazy',
  draggable = false,
}: Props) {
  const [broken, setBroken] = useState(false);
  const finalSrc = broken ? '/images/products/placeholder.jpg' : src;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finalSrc}
      alt={alt}
      loading={loading}
      draggable={draggable}
      className={className}
      onError={() => setBroken(true)}
    />
  );
}

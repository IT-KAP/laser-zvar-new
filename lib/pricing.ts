import type { Currency } from '@/components/pricing/PricingContext';
export function rates(){ return {
  EUR: 1,
  USD: Number(process.env.NEXT_PUBLIC_RATE_USD ?? '1.10'),
  CZK: Number(process.env.NEXT_PUBLIC_RATE_CZK ?? '25.00'),
  PLN: Number(process.env.NEXT_PUBLIC_RATE_PLN ?? '4.35'),
  HUF: Number(process.env.NEXT_PUBLIC_RATE_HUF ?? '390')
} as Record<Currency, number>; }
export function fromEur(v:number, cur:Currency){ const r=rates()[cur]??1; return Math.round(v*r); }

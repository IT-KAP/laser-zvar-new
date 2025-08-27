'use client';
import { usePricing } from '@/components/pricing/PricingContext';
import { fromEur } from '@/lib/pricing';
function fmt(v:number, cur:string){ try {return new Intl.NumberFormat('sk-SK',{style:'currency',currency:cur,maximumFractionDigits:0}).format(v);} catch {return v+' '+cur;} }
function withVAT(v:number, vat:number, on:boolean){ return on?Math.round(v*(1+(vat||0)/100)):v; }
export default function PriceTag({ price, salePrice, vatPercent=20 }:{ price:number; salePrice?:number|null; vatPercent?:number }){
  const { withVat, currency } = usePricing();
  const base = withVAT(fromEur(price, currency), vatPercent, withVat);
  const sale = salePrice ? withVAT(fromEur(salePrice, currency), vatPercent, withVat) : null;
  return <div className="flex items-baseline gap-2">{sale && sale>0 ? (<><span className="text-lg font-semibold">{fmt(sale,currency)}</span><span className="text-sm line-through opacity-70">{fmt(base,currency)}</span></>) : (<span className="text-lg font-semibold">{fmt(base,currency)}</span>)}<span className="text-xs opacity-70">{withVat?'s DPH':'bez DPH'}</span></div>;
}

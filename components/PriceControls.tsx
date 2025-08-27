'use client';
import { usePricing } from '@/components/pricing/PricingContext';
export default function PriceControls(){
  const { withVat,setWithVat,currency,setCurrency } = usePricing();
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="inline-flex items-center gap-2">
        <span className="opacity-70">DPH:</span>
        <button className={`btn btn-outline px-3 py-1 ${!withVat?'ring-2 ring-cyan-500':''}`} onClick={()=>setWithVat(false)}>bez</button>
        <button className={`btn btn-outline px-3 py-1 ${withVat?'ring-2 ring-cyan-500':''}`} onClick={()=>setWithVat(true)}>s</button>
      </div>
      <div className="inline-flex items-center gap-2">
        <span className="opacity-70">Mena:</span>
        <select className="select !py-1 !px-2" value={currency} onChange={(e)=>setCurrency(e.target.value as any)}>
          {['EUR','USD','CZK','PLN','HUF'].map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
}

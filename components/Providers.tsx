'use client';
import { PricingProvider } from '@/components/pricing/PricingContext';
export default function Providers({ children }:{ children: React.ReactNode }){
  return <PricingProvider>{children}</PricingProvider>;
}

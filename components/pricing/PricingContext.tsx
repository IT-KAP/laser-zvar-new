'use client';
import { createContext, useContext, useEffect, useState } from 'react';
export type Currency = 'EUR'|'USD'|'CZK'|'PLN'|'HUF';
type Ctx = { withVat:boolean; currency:Currency; setWithVat:(v:boolean)=>void; setCurrency:(c:Currency)=>void; };
const C = createContext<Ctx>({ withVat:true, currency:'EUR', setWithVat:()=>{}, setCurrency:()=>{} });
export function PricingProvider({ children }:{ children:React.ReactNode }){
  const [withVat,setWithVat]=useState(true); const [currency,setCurrency]=useState<Currency>('EUR');
  useEffect(()=>{ const v=localStorage.getItem('pv'); const c=localStorage.getItem('pc'); if(v!==null)setWithVat(v==='1'); if(c)setCurrency(c as Currency); },[]);
  useEffect(()=>{ localStorage.setItem('pv',withVat?'1':'0'); localStorage.setItem('pc',currency); },[withVat,currency]);
  return <C.Provider value={{withVat,currency,setWithVat,setCurrency}}>{children}</C.Provider>;
}
export function usePricing(){ return useContext(C); }

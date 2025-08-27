import Link from "next/link";

export default function Footer() {
  return (
     <footer className="mt-16 border-t border-slate-800 bg-slate-950">
      <div className="py-8 md:py-10">
        {/* Na mobile stĺpec, od md riadok */}
        <div className="flex flex-col md:flex-row items-start gap-6 md:gap-0">
          <div className="flex-1">
            {/* grid 1,2,3 */}
            <div className="container grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <div className="text-sm font-medium text-slate-200 mb-3">Navigácia</div>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/produkty" className="text-slate-400 hover:text-white/90">Produkty</Link></li>
                  <li><Link href="/blog" className="text-slate-400 hover:text-white/90">Blog</Link></li>
                  <li><Link href="/kontakt" className="text-slate-400 hover:text-white/90">Kontakt</Link></li>
                </ul>
              </div>
              

              <div className="text-ml text-slate-400 text-balance">
                Priemyselné lasery & automatizácia – vláknové, CO₂, YAG/diódové riešenia.
              </div>

             

              <div className="flex flex-col items-start md:items-end gap-4">
                <div className="text-sm font-medium text-slate-200 mb-3">Kontakt</div>
                <div><a className="hover:text-white/90" href="mailto:info@itkap.sk">info@itkap.sk</a></div>
                <div><a className="hover:text-white/90" href="tel:+421911150171">+421 911 150 171</a></div>
                
                
            </div>    
                     
            </div>

            

            <div className="container mt-8 text-xs text-white/50">
              © {new Date().getFullYear()} ITKAP-SK. Všetky práva vyhradené.


              
            </div>

            
          </div>

          
        </div>
        
      </div>

      
    </footer>
  );
}

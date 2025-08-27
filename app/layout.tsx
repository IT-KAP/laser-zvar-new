import "./globals.css";
import Providers from "@/components/Providers";
import BackToTop from "@/components/BackToTop";

export const metadata = { title: "ITKAP • Priemyselné lasery", description: "Vláknové, CO₂ a YAG lasery pre priemysel" };
export default function RootLayout({ children }:{ children: React.ReactNode }){
  return (<html lang="sk"><body><Providers>{children}</Providers><BackToTop /></body></html>);
}

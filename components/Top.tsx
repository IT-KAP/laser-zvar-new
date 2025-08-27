import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Top({ children }:{ children: React.ReactNode }){
  return (<>
    <Header/>
    {children}
    <Footer/>
  </>);
}

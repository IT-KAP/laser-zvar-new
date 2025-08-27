import Link from "next/link";
import Top from "@/components/Top";
export default function AdminHome(){
  return (<Top>
    <div className="container section">
      <h1 className="text-3xl font-semibold">Admin</h1>
      <div className="mt-6 grid sm:grid-cols-2 gap-6">
        <Link href="/" className="card p-6 card-hover">Domov</Link>
        <Link href="/admin/products" className="card p-6 card-hover">Produkty</Link>
        <Link href="/admin/blog" className="card p-6 card-hover">Blog</Link>
      </div>
    </div>
  </Top>);
}

import { headers } from 'next/headers';
import Link from 'next/link';

type PostCard = { id:number; slug:string; title:string; excerpt?:string; coverImage?:string; createdAt?:string; tags?:string; };

function abs(path:string){
  const h=headers(); const host=h.get('x-forwarded-host')??h.get('host')??'localhost:3000'; const proto=h.get('x-forwarded-proto')??'http';
  return `${proto}://${host}${path}`;
}

async function getPosts():Promise<PostCard[]>{
  const res=await fetch(abs('/api/posts?published=1'),{cache:'no-store'});
  if(!res.ok) return [];
  return res.json();
}

export default async function BlogPage(){
  const posts=await getPosts();
  return (
    <div className="container section">
      <Link href="/" className="btn btn-outline">← Späť na hlavnú</Link>

      <h1 className="text-3xl md:text-4xl font-semibold mt-6">Blog</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {posts.map(p=>{
          const date=p.createdAt?new Date(p.createdAt).toLocaleDateString('sk-SK',{day:'numeric',month:'long',year:'numeric'}):'';
          return (
            <Link key={p.id} href={`/blog/${p.slug}`} className="card hover:scale-[1.01] transition">
              <div className="rounded-xl overflow-hidden bg-black/20 border border-white/10">
                <div className="w-full aspect-[16/9] bg-black/20">
                  <img src={p.coverImage || '/images/blog/placeholder.jpg'} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="text-xs text-white/60">{date}</div>
                  <div className="font-medium mt-1 line-clamp-2">{p.title}</div>
                  {p.excerpt && <div className="text-sm text-white/70 mt-2 line-clamp-3">{p.excerpt}</div>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// app/blog/[slug]/page.tsx
import { headers } from 'next/headers';
import Link from 'next/link';
import { mdToHtml } from '@/lib/mdToHtmlBlog';
import ScrollToHash from '@/components/scrollToHash/ScrollToHash';

type Post = {
  markdown: string;
  body: string; id:number; slug:string; title:string; coverImage?:string; tags?:string; content?:string; createdAt?:string; 
};

function abs(path: string) { 
  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${host}${path}`;
}

async function getPost(slug: string): Promise<Post|null> {
  const res = await fetch(abs(`/api/posts/by-slug/${encodeURIComponent(slug)}`), { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function BlogDetail({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) return (
    <div className="container section">
      <Link href="/blog" className="btn btn-outline">← Naspäť na blog</Link>
      <h1 className="text-2xl mt-6">Článok sa nenašiel.</h1>
    </div>
  );

  // fallback ak by DB mala iný názov poľa
  const md = post.content ?? post.body ?? post.markdown ?? '';
  const html = mdToHtml(String(md));
  const date = post.createdAt ? new Date(post.createdAt).toLocaleDateString('sk-SK',{day:'numeric',month:'long',year:'numeric'}) : '';

  return (
    <div className="container section">
      <ScrollToHash />
      <Link href="/blog" className="btn btn-outline">← Naspäť na blog</Link>

      <h1 className="text-3xl md:text-4xl font-semibold mt-6">{post.title}</h1>
      <div className="text-sm text-white/60 mt-2">{date}{post.tags ? ' • ' : ''}{post.tags}</div>

      {post.coverImage && (
        <div className="mt-6 rounded-2xl overflow-hidden border border-white/10 bg-black/20">
          <img src={post.coverImage} alt={post.title} className="w-full max-h-[60vh] object-contain" />
        </div>
      )}
      
      {/* ← tu je to dôležité: používame dangerouslySetInnerHTML */}
      <article className="md-body mt-8" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
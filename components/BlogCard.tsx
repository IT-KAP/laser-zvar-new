import Link from "next/link";
import Image from "next/image";

const COVER_PLACEHOLDER = "/images/blog/placeholder.jpg";

export type BlogCardProps = {
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string | null;
  createdAt?: string;
  readMins?: number;
};

export default function BlogCard({
  slug, title, excerpt, coverImage, createdAt, readMins
}: BlogCardProps) {
  const cover = coverImage || COVER_PLACEHOLDER;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40 hover:bg-slate-950 transition-colors">
      {/* Obrázok s pevnou výškou a object-cover */}
      <div className="relative aspect-[16/9]">
        <Image
          src={cover}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          priority={false}
          onError={(e) => {
            (e.target as HTMLImageElement).src = COVER_PLACEHOLDER;
          }}
        />
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-100 group-hover:text-white">
          <Link href={`/blog/${slug}`} prefetch={false}>{title}</Link>
        </h3>

        {excerpt && (
          <p className="mt-2 line-clamp-3 text-slate-400">{excerpt}</p>
        )}

        <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
          {createdAt && <time dateTime={createdAt}>{new Date(createdAt).toLocaleDateString()}</time>}
          {createdAt && readMins && <span>•</span>}
          {readMins ? <span>{readMins} min</span> : null}
        </div>
      </div>
    </article>
  );
}

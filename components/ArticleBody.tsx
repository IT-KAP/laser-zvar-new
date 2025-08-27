type Props = { html?: string | null; };

export default function ArticleBody({ html }: Props) {
  if (!html) return null;

  return (
    <div
      className="prose prose-invert max-w-none prose-headings:scroll-mt-24
                 prose-p:text-slate-300 prose-li:text-slate-300
                 prose-strong:text-slate-100 prose-a:text-sky-400 hover:prose-a:text-sky-300
                 prose-img:rounded-xl prose-img:border prose-img:border-slate-800
                 prose-hr:border-slate-800"
      // obsah očakávame HTML; ak je to markdown, renderuj ho na backende
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

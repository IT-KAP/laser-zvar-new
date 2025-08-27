'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownEditor({
  value, onChange, className='',
}: { value: string; onChange: (v:string)=>void; className?: string; }) {
  const [tab, setTab] = useState<'edit'|'preview'>('edit');

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={()=>setTab('edit')}
          className={`btn btn-sm ${tab==='edit'?'btn-primary':'btn-outline'}`}
        >Editor</button>
        <button
          type="button"
          onClick={()=>setTab('preview')}
          className={`btn btn-sm ${tab==='preview'?'btn-primary':'btn-outline'}`}
        >Náhľad</button>
      </div>

      {tab==='edit' ? (
        <textarea
          className="textarea h-64"
          value={value}
          onChange={(e)=>onChange(e.target.value)}
          placeholder="Píš Markdown... (nadpisy #, zoznamy -, obrázky ![](), odkazy []())"
        />
      ) : (
        <div className="prose prose-invert max-w-none border border-slate-800 rounded-xl p-4 bg-slate-950/40">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {value || '*Žiadny obsah…*'}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

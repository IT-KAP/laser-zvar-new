'use client';
import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

export default function RichEditor({
  value, onChange, placeholder = 'Napíšte článok…'
}: { value?: string; onChange: (html: string)=>void; placeholder?: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit, Link.configure({ openOnClick: false }),
      Image, Placeholder.configure({ placeholder })
    ],
    content: value || '',
    editorProps: { attributes: { class: 'prose prose-invert max-w-none min-h-[16rem] focus:outline-none p-4' } },
    onUpdate({ editor }) { onChange(editor.getHTML()); }
  });

  useEffect(()=>{ if(editor && value!==undefined && value!==editor.getHTML()){ editor.commands.setContent(value||'', { emitUpdate: false }); } }, [value, editor]);
  if (!editor) return <div className="card p-4">Načítavam editor…</div>;

  return (
    <div className="card">
      <div className="flex flex-wrap gap-2 p-2 border-b border-slate-700/50">
        {[
          ['B','toggleBold'], ['I','toggleItalic'], ['H2','toggleHeading',2], ['H3','toggleHeading',3],
          ['•','toggleBulletList'], ['1.','toggleOrderedList'], ['"','toggleBlockquote'],
        ].map(([label,cmd,level]: any)=>(
          <button key={label}
            onClick={()=> (editor as any).chain().focus()[cmd](level?{level}:undefined).run()}
            className="btn btn-outline text-xs px-2 py-1">{label}</button>
        ))}
        <button className="btn btn-outline text-xs px-2 py-1"
          onClick={()=>{
            const url = prompt('URL odkazu:');
            if(!url) return; editor.chain().focus().setLink({ href: url }).run();
          }}>Link</button>
        <button className="btn btn-outline text-xs px-2 py-1"
          onClick={()=>{
            const url = prompt('URL obrázka:');
            if(!url) return; editor.chain().focus().setImage({ src: url }).run();
          }}>Obrázok</button>
        <div className="ml-auto flex gap-2">
          <button className="btn btn-outline text-xs px-2 py-1" onClick={()=>editor.chain().focus().undo().run()}>Undo</button>
          <button className="btn btn-outline text-xs px-2 py-1" onClick={()=>editor.chain().focus().redo().run()}>Redo</button>
          <button className="btn btn-outline text-xs px-2 py-1" onClick={()=>editor.commands.clearContent()}>Vymazať</button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

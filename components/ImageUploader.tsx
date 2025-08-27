'use client';
export default function ImageUploader({
  value, onChange,
}:{ value?:string; onChange:(url:string)=>void }){
  return (
    <div className="grid gap-2">
      <input
        className="input flex-1"
        value={value||''}
        onChange={(e)=>onChange(e.target.value)}
        placeholder="URL alebo /images/products/xyz.jpg"
      />
      {value && (
        <div className="card p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" className="h-28 object-contain" />
        </div>
      )}
    </div>
  );
}

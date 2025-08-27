export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
export async function POST(req:Request){
  try{
    const form=await req.formData(); const file=form.get('file') as File|null; if(!file) return NextResponse.json({error:'No file'},{status:400});
    const buf=Buffer.from(await file.arrayBuffer());
    const folder=process.env.CLOUDINARY_UPLOAD_FOLDER||'itkap';
    const up:any=await new Promise((resolve,reject)=>{ const s=cloudinary.uploader.upload_stream({folder,resource_type:'image'},(err,res)=>{ if(err)reject(err); else resolve(res); }); s.end(buf); });
    return NextResponse.json({ url: up.secure_url });
  }catch(e:any){ return NextResponse.json({error:e?.message||'Upload failed'},{status:500}); }
}

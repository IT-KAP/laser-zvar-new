import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { mdToHtml } from "@/lib/mdToHtml";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const row = (await query<any>(
    'SELECT id, slug, title, excerpt, coverImage, tags, content, createdAt FROM posts WHERE slug=? AND published=1 LIMIT 1',
    [params.slug]
  ))[0];
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(row);
}
import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireAdmin } from "@/app/api/_helpers";

/** ---------- helpers ---------- */
const str = (v: any) => String(v ?? "").trim();
const toBool = (v: any) =>
  v === true || v === 1 || v === "1" || v === "true" || v === "on";

function normTags(input: any): { csv: string; arr: string[] } {
  if (!input) return { csv: "", arr: [] };
  let arr: string[] = [];
  if (Array.isArray(input)) arr = input.map(str);
  else arr = String(input).split(/[,;]\s*|\r?\n/).map(str);
  arr = Array.from(new Set(arr.filter(Boolean))).slice(0, 20); // dedupe + limit
  return { csv: arr.join(","), arr };
}

function view(row: any) {
  if (!row) return row;
  return {
    ...row,
    tags: row.tags ? String(row.tags).split(",").filter(Boolean) : [],
    published: !!row.published,
  };
}

/** ---------- GET /api/posts/[id] ---------- */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Bad id" }, { status: 400 });
  }
  const rows = await query<any>("SELECT * FROM posts WHERE id=? LIMIT 1", [id]);
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(view(rows[0]));
}

/** ---------- PUT /api/posts/[id] ---------- */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  // admin check (hlavička x-admin-key)
  const unauth = requireAdmin(req);
  if (unauth) return unauth;

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Bad id" }, { status: 400 });
  }

  try {
    const body = await req.json();

    const slug = str(body.slug);
    const title = str(body.title);
    const excerpt = str(body.excerpt);
    const coverImage = str(body.coverImage);
    const content = str(body.content); // Markdown text
    const published = toBool(body.published) ? 1 : 0;
    const { csv: tagsCsv } = normTags(body.tags);

    // basic validation
    if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    if (!title) return NextResponse.json({ error: "Missing title" }, { status: 400 });
    if (!content) return NextResponse.json({ error: "Missing content" }, { status: 400 });

    // slug conflict (pri zmene slugu)
    const conflict = await query<any>(
      "SELECT id FROM posts WHERE slug=? AND id<>? LIMIT 1",
      [slug, id]
    );
    if (conflict.length) {
      return NextResponse.json({ error: "Slug už existuje" }, { status: 409 });
    }

    // update
    await execute(
      `UPDATE posts SET
         slug=?,
         title=?,
         excerpt=?,
         coverImage=?,
         tags=?,
         content=?,
         published=?,
         updatedAt=NOW()
       WHERE id=?`,
      [slug, title, excerpt, coverImage, tagsCsv, content, published, id]
    );

    const row = (await query<any>("SELECT * FROM posts WHERE id=? LIMIT 1", [id]))[0];
    return NextResponse.json(view(row));
  } catch (err: any) {
    console.error("PUT /posts/:id error:", err?.code || err?.message || err);
    return NextResponse.json(
      { error: "Chyba ukladania" },
      { status: 500 }
    );
  }
}

/** ---------- DELETE /api/posts/[id] ---------- */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Bad id" }, { status: 400 });
  }
  await execute("DELETE FROM posts WHERE id=? LIMIT 1", [id]);
  return NextResponse.json({ ok: true });
}

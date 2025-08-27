import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireAdmin } from "@/app/api/_helpers";

// Utils
function s(v: any) { return String(v ?? "").trim(); }
function toBool(v: any) {
  if (typeof v === "boolean") return v;
  const x = String(v ?? "").toLowerCase();
  return x === "1" || x === "true" || x === "yes";
}

// Prijmeme obsah z viacerých kľúčov, berieme prvý neprázdny
function pickContent(b: any): string {
  const keys = ["content", "markdown", "md", "body", "text"];
  for (const k of keys) {
    const v = b?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function normalize(b: any) {
  const slug = s(b.slug);
  const title = s(b.title);
  const excerpt = s(b.excerpt);
  const coverImage = s(b.coverImage);
  const tags = s(b.tags);
  const content = pickContent(b);
  const published = toBool(b.published) ? 1 : 0;

  if (!slug) throw new Error("Missing slug");
  if (!title) throw new Error("Missing title");
  if (!content) throw new Error("Missing content");

  return { slug, title, excerpt, coverImage, tags, content, published };
}

// Pomocná – vráti peknú odpoveď s detailom chyby
function bad(err: any, status = 400) {
  const msg = typeof err === "string" ? err : err?.message || "Bad Request";
  return NextResponse.json({ error: msg }, { status });
}

async function readJson(req: Request) {
  // Zoberieme raw telo, aby sme vedeli diagnostikovať aj nevalidný JSON
  const raw = await req.text();
  try {
    const parsed = JSON.parse(raw);
    // Log pre debug – uvidíš v serverovej konzole:
    console.log("POSTS API body keys:", Object.keys(parsed));
    console.log("POSTS API content sample:", (pickContent(parsed) || "").slice(0, 80));
    return parsed;
  } catch (e) {
    console.error("Invalid JSON body:", raw.slice(0, 200));
    throw new Error("Invalid JSON body");
  }
}

// GET /api/posts?published=1 – ak by si chcel, nechávam bez zmeny
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const publishedOnly = searchParams.get("published") === "1";
  const rows = await query<any>(
    publishedOnly
      ? "SELECT * FROM posts WHERE published=1 ORDER BY createdAt DESC"
      : "SELECT * FROM posts ORDER BY createdAt DESC"
  );
  return NextResponse.json(rows);
}

// POST /api/posts
export async function POST(req: Request) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth; // 401

  try {
    const body = await readJson(req);
    const d = normalize(body);

    const ex = await query<any>("SELECT id FROM posts WHERE slug=? LIMIT 1", [d.slug]);
    if (ex.length) return NextResponse.json({ error: "Slug už existuje." }, { status: 409 });

    await execute(
      `INSERT INTO posts (slug,title,excerpt,coverImage,tags,content,published,createdAt,updatedAt)
       VALUES (?,?,?,?,?,?,?,NOW(),NOW())`,
      [d.slug, d.title, d.excerpt, d.coverImage, d.tags, d.content, d.published]
    );

    const row = (await query<any>("SELECT * FROM posts WHERE slug=? LIMIT 1", [d.slug]))[0];
    return NextResponse.json(row, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/posts error:", e);
    return bad(e, 400);
  }
}

// PUT /api/posts
export async function PUT(req: Request) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;

  try {
    const body = await readJson(req);
    if (!body.id) throw new Error("Missing id");

    const d = normalize(body);

    await execute(
      `UPDATE posts
         SET slug=?, title=?, excerpt=?, coverImage=?, tags=?, content=?, published=?,
             updatedAt = NOW()
       WHERE id=?`,
      [d.slug, d.title, d.excerpt, d.coverImage, d.tags, d.content, d.published, Number(body.id)]
    );

    const row = (await query<any>("SELECT * FROM posts WHERE id=? LIMIT 1", [Number(body.id)]))[0];
    return NextResponse.json(row);
  } catch (e: any) {
    console.error("PUT /api/posts error:", e);
    return bad(e, 400);
  }
}

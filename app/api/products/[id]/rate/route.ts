import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  noStore();
  try {
    const body = await req.json().catch(() => ({}));
    const stars = Number(body?.stars);
    const comment = typeof body?.comment === "string" ? body.comment.trim() : null;

    if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
      return NextResponse.json({ error: "Hodnotenie musí byť 1 až 5" }, { status: 400 });
    }

    // existuje produkt?
    const prod = (await query<any>("SELECT id, ratingAvg, ratingCount FROM Product WHERE id=? LIMIT 1", [params.id]))[0];
    if (!prod) return NextResponse.json({ error: "Produkt sa nenašiel" }, { status: 404 });

    // ulož jednotl. rating (voliteľné)
    const ip = (headers().get("x-forwarded-for") || "").split(",")[0] || "";
    await execute("INSERT INTO ProductRating (productId, stars, comment, ip) VALUES (?,?,?,?)",
      [params.id, Math.round(stars), comment, ip]);

    // prepočítaj agregát
    const newCount = Number(prod.ratingCount) + 1;
    const newAvg = (Number(prod.ratingAvg) * Number(prod.ratingCount) + stars) / newCount;
    await execute("UPDATE Product SET ratingAvg=?, ratingCount=? WHERE id=?",
      [newAvg.toFixed(2), newCount, params.id]);

    return NextResponse.json({ ok: true, ratingAvg: Number(newAvg.toFixed(2)), ratingCount: newCount });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Chyba hodnotenia" }, { status: 500 });
  }
}

// pomocný import pre IP (ak používaš) – vlož hore k importom
import { headers } from "next/headers";

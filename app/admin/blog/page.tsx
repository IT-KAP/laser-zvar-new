"use client";

import { useEffect, useMemo, useState } from "react";
import Top from "@/components/Top";
import Link from "next/link";
import { mdToHtml } from "@/lib/mdToHtmlBlog";

/* ──────────────────────────────────────────────
   Typy
────────────────────────────────────────────── */
type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  tags: string | null;
  content: string;
  published: 0 | 1;
  createdAt?: string;
  updatedAt?: string;
};

type FormState = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  tags: string;
  content: string; // Markdown
  published: boolean;
};

/* ──────────────────────────────────────────────
   Mini Markdown → HTML (bez externej knižnice)
────────────────────────────────────────────── */
function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// function mdToHtml(md: string): string {
//   const esc = escapeHtml(md);

//   // code blocks ```
//   let html = esc.replace(/```([\s\S]*?)```/g, (_m, p1) => {
//     return `<pre class="rounded-lg bg-[#111827] p-3 overflow-auto"><code>${p1}</code></pre>`;
//   });

//   // headings
//   html = html
//     .replace(/^\s*######\s+(.*)$/gm, "<h6 class='font-semibold text-sm mt-4'>$1</h6>")
//     .replace(/^\s*#####\s+(.*)$/gm, "<h5 class='font-semibold text-base mt-4'>$1</h5>")
//     .replace(/^\s*####\s+(.*)$/gm, "<h4 class='font-semibold text-lg mt-5'>$1</h4>")
//     .replace(/^\s*###\s+(.*)$/gm, "<h3 class='font-semibold text-xl mt-6'>$1</h3>")
//     .replace(/^\s*##\s+(.*)$/gm, "<h2 class='font-bold text-2xl mt-8'>$1</h2>")
//     .replace(/^\s*#\s+(.*)$/gm, "<h1 class='font-bold text-3xl mt-10'>$1</h1>");

//   // inline
//   html = html
//     .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
//     .replace(/\*(.+?)\*/g, "<em>$1</em>")
//     .replace(/`([^`]+?)`/g, "<code class='px-1 rounded bg-[#111827]'>$1</code>");

//   // links
//   html = html.replace(
//     /\[([^\]]+?)\]\((https?:\/\/[^\s)]+)\)/g,
//     `<a href="$2" target="_blank" rel="noopener" class="underline decoration-dotted">$1</a>`
//   );

//   // lists
//   html = html.replace(
//     /(^|\n)([-*]\s.*(?:\n[-*]\s.*)*)/g,
//     (_m, p1, p2) => {
//       const items = p2
//         .split("\n")
//         .map((ln: string) => ln.trim())
//         .filter((ln: string) => ln.startsWith("- ") || ln.startsWith("* "))
//         .map((ln: string) => `<li class="ml-6 list-disc">${ln.slice(2)}</li>`)
//         .join("");
//       return `${p1}<ul class="my-2">${items}</ul>`;
//     }
//   );

//   // paragraphs
//   html = html
//     .split(/\n{2,}/)
//     .map((blk) => {
//       if (/^<h\d|^<ul|^<pre/.test(blk)) return blk;
//       return `<p class="my-3 leading-relaxed">${blk.replace(/\n/g, "<br/>")}</p>`;
//     })
//     .join("");

//   return html;
// }

/* ──────────────────────────────────────────────
   Komponent
────────────────────────────────────────────── */
export default function AdminBlogPage() {
  const [rows, setRows] = useState<Post[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState<string>("");
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  const [form, setForm] = useState<FormState>({
    slug: "",
    title: "",
    excerpt: "",
    coverImage: "/images/blog/placeholder.jpg",
    tags: "",
    content: "",
    published: false,
  });

  // Admin key z localStorage
  useEffect(() => {
    const k = typeof window !== "undefined" ? localStorage.getItem("adm") || "" : "";
    setKey(k);
  }, []);

  // Načítať zoznam článkov
  async function load() {
    try {
      const res = await fetch("/api/posts?published=0", { cache: "no-store" });
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      alert("Nepodarilo sa načítať články.");
    }
  }
  useEffect(() => {
    load();
  }, []);

  // Markdown → HTML (náhľad)
  const previewHtml = useMemo(() => mdToHtml(form.content || ""), [form.content]);

  // Reset
  function resetForm() {
    setForm({
      slug: "",
      title: "",
      excerpt: "",
      coverImage: "/images/blog/placeholder.jpg",
      tags: "",
      content: "",
      published: false,
    });
    setEditing(null);
    setTab("edit");
  }

  // Upraviť
  function editRow(p: Post) {
    setForm({
      slug: p.slug || "",
      title: p.title || "",
      excerpt: p.excerpt || "",
      coverImage: p.coverImage || "/images/blog/placeholder.jpg",
      tags: p.tags || "",
      content: p.content || "",
      published: p.published === 1,
    });
    setEditing(p.id);
    setTab("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Zmazať
  async function delRow(id: number) {
    if (!id) return;
    if (!confirm("Naozaj zmazať článok?")) return;

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-key": key,
        },
      });

      let msg = "Chyba mazania";
      try {
        const d = await res.clone().json();
        if (d?.error) msg = d.error;
      } catch {}

      if (!res.ok) {
        alert(`${msg} (${res.status})`);
        return;
      }

      // ak si zmazal práve editovaný, resetni form
      if (editing === id) resetForm();

      await load();
    } catch (e) {
      console.error(e);
      alert("Chyba komunikácie pri mazaní.");
    }
  }

  // Uložiť
  async function save() {
    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      excerpt: form.excerpt,
      coverImage: form.coverImage,
      tags: form.tags,
      content: (form.content ?? "").trim(),
      published: !!form.published,
      ...(editing ? { id: editing } : {}),
    };

    if (!payload.slug) return alert("Zadaj slug.");
    if (!payload.title) return alert("Zadaj titulok.");
    if (!payload.content) return alert("Obsah (content) je prázdny.");

    setBusy(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        "x-admin-key": key,
      };

      const res = await fetch("/api/posts", {
        method: editing ? "PUT" : "POST",
        headers,
        body: JSON.stringify(payload),
      });

      let msg = editing ? "Chyba pri ukladaní" : "Chyba pri vytváraní";
      try {
        const d = await res.clone().json();
        if (d?.error) msg = d.error;
      } catch {}

      if (!res.ok) {
        alert(`${msg} (${res.status})`);
        return;
      }

      localStorage.setItem("adm", key);
      await load();
      resetForm();
    } catch (e) {
      console.error(e);
      alert("Chyba komunikácie.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Top>
    <div className="container section">
       <Link href="/admin" className="btn btn-outline">← Späť na admin</Link>
      <h1 className="text-2xl font-semibold">Admin – Blog</h1>

      <div className="mt-4 grid md:grid-cols-2 gap-6">
        {/* Formulár */}
        <div className="grid gap-3">
          <div>
            <label className="block mb-1">Admin password (ENV ADMIN_PASSWORD)</label>
            <input
              className="input"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="itkap-admin-123"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1">Slug</label>
              <input
                className="input"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="laserove-cistenie-navod"
              />
            </div>
            <div>
              <label className="block mb-1">Titulok</label>
              <input
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Laserová čistička – návod"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1">Excerpt (krátky popis)</label>
            <input
              className="input"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Krátky úvod …"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1">Cover image (URL)</label>
              <input
                className="input"
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                placeholder="/images/blog/placeholder.jpg"
              />
            </div>
            <div>
              <label className="block mb-1">Tags (čiarkou oddelené)</label>
              <input
                className="input"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="welding,cleaning"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              Publikované
            </label>

            <div className="ml-auto flex gap-2">
              <button
                className={`btn ${tab === "edit" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setTab("edit")}
                type="button"
              >
                Editor
              </button>
              <button
                className={`btn ${tab === "preview" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setTab("preview")}
                type="button"
              >
                Náhľad
              </button>
            </div>
          </div>

          {tab === "edit" ? (
            <textarea
              className="textarea h-64"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder={`# Nadpis článku\n\nKrátky úvodný odstavec…\n\n- bod 1\n- bod 2\n\n**Tučné** a *kurzíva*, kód: \`ls -la\``}
            />
          ) : (
            <div
              className="md-body mt-8 prose prose-invert max-w-none card p-4 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          )}

          <div className="flex gap-3">
            <button
              className="btn btn-primary"
              onClick={save}
              disabled={busy}
              type="button"
            >
              {editing ? "Uložiť zmeny" : "Pridať článok"}
            </button>
            {editing && (
              <button className="btn btn-outline" onClick={resetForm} type="button">
                Zrušiť úpravu
              </button>
            )}
          </div>
        </div>

        {/* Zoznam článkov */}
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>ID</th>
                <th>Názov</th>
                <th>Slug</th>
                <th>Publ.</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="align-top">
                  <td className="pr-2">{p.id}</td>
                  <td className="pr-2">{p.title}</td>
                  <td className="pr-2">{p.slug}</td>
                  <td className="pr-2">{p.published ? "✓" : "–"}</td>
                  <td className="text-right">
                    <button
                      className="btn btn-outline mr-2"
                      onClick={() => editRow(p)}
                      type="button"
                    >
                      Upraviť
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => delRow(p.id)}
                      type="button"
                    >
                      Zmazať
                    </button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={5} className="text-neutral-400 py-4">
                    Žiadne články.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </Top>
  );
}

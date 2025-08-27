'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import Link from 'next/link';
import { mdToHtml } from "@/lib/mdToHtml";

type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  mode: string;
  blurb: string;
  content?: string; // Markdown obsah
  tags: string;
  image: string;
  images: string[] | string;
  wlen: number;
  power: number;
  price: number;
  salePrice: number | null;
  vatPercent: number;
  currency: string;
  availability: string;
  createdAt?: string;
  updatedAt?: string;
};

/* ----------------------- pomocné utily ----------------------- */
function toInt(v: any, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : d;
}
function str(v: any) {
  return String(v ?? '').trim();
}
function parseImagesText(s: string) {
  return (s || '')
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
}
function toImagesText(v: any) {
  try {
    const arr = Array.isArray(v) ? v : JSON.parse(v || '[]');
    return (arr || []).join('\n');
  } catch {
    return '';
  }
}

/** Bezpečné JSON čítanie – funguje aj keď je telo prázdne alebo je to HTML chyba */
async function safeJson(res: Response) {
  const txt = await res.text();
  if (!txt) return null;
  try {
    return JSON.parse(txt);
  } catch {
    // nie je JSON (napr. HTML error) – vráť surový text, nech vieme čo sa deje
    return txt;
  }
}

/* ----------------------- komponent --------------------------- */
export default function AdminProducts() {
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [rows, setRows] = useState<Product[]>([]);
  const [key, setKey] = useState<string>(
    typeof window !== 'undefined' ? localStorage.getItem('adm') || '' : ''
  );
  const [editing, setEditing] = useState<number | null>(null);

  const [form, setForm] = useState<any>({
    slug: '',
    name: '',
    category: 'co2',
    mode: 'CW',
    blurb: '',
    content: '', // Markdown obsah produktu
    tags: '',
    image: '/images/products/placeholder.jpg',
    imagesText: '',
    wlen: 10600,
    power: 100,
    price: 0,
    salePrice: 0,
    vatPercent: 20,
    currency: 'EUR',
    availability: 'in_stock',
  });

  const previewHtml = useMemo(() => mdToHtml(form.content || ""), [form.content]);


  /* ---------- galerka / náhľady obrázkov ---------- */
  const gallery = useMemo(() => {
    const arr = parseImagesText(form.imagesText);
    const main = (form.image || '').trim();
    const set = new Set<string>([main, ...arr].filter(Boolean));
    return Array.from(set);
  }, [form.image, form.imagesText]);

  /* ---------- načítanie dát (robustné) ---------- */
  async function load() {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      const data = await safeJson(res);

      if (!res.ok) {
        const msg =
          typeof data === 'string'
            ? data.slice(0, 200)
            : data?.error || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      const list = Array.isArray(data) ? data : [];
      setRows(list);
    } catch (err: any) {
      console.error('Načítanie /api/products zlyhalo:', err);
      alert('Nepodarilo sa načítať produkty: ' + (err?.message || err));
      setRows([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* ---------- ukladanie / mazanie ---------- */
  function buildPayload() {
    return {
      slug: str(form.slug),
      name: str(form.name),
      category: str(form.category),
      mode: str(form.mode),
      blurb: str(form.blurb),
      content: str(form.content), // Markdown
      image: str(form.image) || '/images/products/placeholder.jpg',
      images: parseImagesText(form.imagesText),
      wlen: toInt(form.wlen),
      power: toInt(form.power),
      price: toInt(form.price),
      salePrice: form.salePrice ? toInt(form.salePrice) : null,
      vatPercent: toInt(form.vatPercent ?? 20, 20),
      currency: str(form.currency || 'EUR'),
      availability: str(form.availability || 'in_stock'),
      tags: str(form.tags),
    };
  }

  async function save() {
    const payload = buildPayload();
    const headers = {
      'Content-Type': 'application/json',
      'x-admin-key': key || '',
    };

    try {
      const res = editing
        ? await fetch(`/api/products/${editing}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload),
          })
        : await fetch('/api/products', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          });

      const data = await safeJson(res);
      if (!res.ok) {
        const msg =
          typeof data === 'string'
            ? data.slice(0, 200)
            : data?.error || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      localStorage.setItem('adm', key || '');
      // reset form
      setForm({
        slug: '',
        name: '',
        category: 'co2',
        mode: 'CW',
        blurb: '',
        content: '',
        tags: '',
        image: '/images/products/placeholder.jpg',
        imagesText: '',
        wlen: 10600,
        power: 100,
        price: 0,
        salePrice: 0,
        vatPercent: 20,
        currency: 'EUR',
        availability: 'in_stock',
      });
      setEditing(null);
      await load();
      alert('Produkt uložený.');
    } catch (err: any) {
      alert('Chyba ukladania: ' + (err?.message || err));
    }
  }

  async function del(id: number) {
    if (!confirm('Zmazať produkt?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': key || '' },
      });
      const data = await safeJson(res);
      if (!res.ok) {
        const msg =
          typeof data === 'string'
            ? data.slice(0, 200)
            : data?.error || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      await load();
    } catch (err: any) {
      alert('Chyba mazania: ' + (err?.message || err));
    }
  }

  function editRow(p: Product) {
    setEditing(p.id);
    setForm({
      slug: p.slug || '',
      name: p.name || '',
      category: p.category || 'co2',
      mode: p.mode || 'CW',
      blurb: p.blurb || '',
      content: p.content || '',
      tags: p.tags || '',
      image: p.image || '/images/products/placeholder.jpg',
      imagesText: toImagesText(p.images),
      wlen: p.wlen ?? 10600,
      power: p.power ?? 100,
      price: p.price ?? 0,
      salePrice: p.salePrice ?? 0,
      vatPercent: p.vatPercent ?? 20,
      currency: p.currency || 'EUR',
      availability: p.availability || 'in_stock',
    });
  }

  /* ----------------------- UI --------------------------- */
  return (
    <div className="container section">
       <Link href="/admin" className="btn btn-outline">← Späť na admin</Link>
      <h1 className="text-2xl font-semibold">Produkty</h1>

      <div className="mt-3 max-w-md">
        <label className="block text-sm opacity-80 mb-1">Admin password (ENV ADMIN_PASSWORD)</label>
        <input
          className="input w-full"
          placeholder="admin key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* FORM */}
        <div className="grid gap-3">
          {(['slug', 'name', 'category', 'mode', 'blurb', 'tags'] as const).map((k) => (
            <div key={k}>
              <label className="block text-sm opacity-80 mb-1">{k}</label>
              <input
                className="input w-full"
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm opacity-80 mb-1">image (hlavný)</label>
            <ImageUploader
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
            />
          </div>

          <div>
            <label className="block text-sm opacity-80 mb-1">images (1 URL na riadok)</label>
            <textarea
              className="textarea h-28 w-full"
              value={form.imagesText}
              onChange={(e) => setForm({ ...form, imagesText: e.target.value })}
              placeholder="/images/products/1.jpg\n/images/products/2.jpg"
            />
          </div>

          {gallery.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {gallery.map((u) => (
                <div key={u} className="card p-2">
                  <img src={u} alt="img" className="h-16 w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm opacity-80 mb-1">wlen (nm)</label>
              <input
                className="input w-full"
                type="number"
                value={form.wlen}
                onChange={(e) => setForm({ ...form, wlen: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm opacity-80 mb-1">power (W)</label>
              <input
                className="input w-full"
                type="number"
                value={form.power}
                onChange={(e) => setForm({ ...form, power: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm opacity-80 mb-1">price (€)</label>
              <input
                className="input w-full"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm opacity-80 mb-1">salePrice (€)</label>
              <input
                className="input w-full"
                type="number"
                value={form.salePrice}
                onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm opacity-80 mb-1">vatPercent (%)</label>
              <input
                className="input w-full"
                type="number"
                value={form.vatPercent}
                onChange={(e) => setForm({ ...form, vatPercent: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm opacity-80 mb-1">currency</label>
              <input
                className="input w-full"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm opacity-80 mb-1">availability</label>
              <select
                className="select w-full"
                value={form.availability}
                onChange={(e) => setForm({ ...form, availability: e.target.value })}
              >
                <option value="in_stock">Na sklade</option>
                <option value="lead_time_2w">Dodanie 2 týždne</option>
                <option value="lead_time_4w">Dodanie 4 týždne</option>
                <option value="discontinued">Ukončené</option>
              </select>
            </div>
          </div>
          
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

          {/* Markdown obsah produktu */}
          {tab === "edit" ? (
            <textarea
              className="textarea h-48 w-full font-mono"
              placeholder="## Popis\n- bod 1\n- bod 2"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          ) : (
            <div
              className="md-body mt-8 prose prose-invert max-w-none card p-4 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          )}

          <div className="flex gap-3">
            <button className="btn btn-primary" onClick={save}>
              {editing ? 'Uložiť' : 'Pridať produkt'}
            </button>
            {editing && (
              <button className="btn btn-outline" onClick={() => setEditing(null)}>
                Zrušiť
              </button>
            )}
          </div>
        </div>

        {/* Zoznam predmetov */}
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>ID</th>
                <th>Názov</th>
                <th>Slug</th>
                <th>Cena</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="align-top">
                  <td className="pr-2">{p.id}</td>
                  <td className="pr-2">{p.name}</td>
                  <td className="pr-2">{p.slug}</td>
                  <td className="pr-2">{p.price} €</td>
                  <td className="text-right w-[200px]">
                    <button
                      className="btn btn-outline mr-2"
                      onClick={() => editRow(p)}
                      type="button"
                    >
                      Upraviť
                    </button>
                    <button 
                      className="btn btn-outline" 
                      onClick={() => del(p.id)}
                      type="button"
                    >
                      Zmazať
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="opacity-70 py-6">
                    Zatiaľ žiadne produkty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

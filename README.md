# ITKAP – čistý kód pre MAMP MySQL (bez Prisma)

Minimal Next.js (App Router) + Tailwind, napojený priamo na **MAMP MySQL** cez `mysql2/promise`.
Obsah: frontend (produkty, blog, kontakt), admin (produkty+blog), upload cez Cloudinary, Formspree.

## Inštalácia
```bash
cp .env.local.example .env.local   # uprav MAMP prístupy (127.0.0.1:8889, root/root)
npm i
# vytvor DB tabuľky cez phpMyAdmin (import sql/schema.sql) a voliteľne sql/seed.sql
npm run dev
```

## Admin (jednoduché heslo)
- /admin → zadaj `ADMIN_PASSWORD` do poľa (posiela sa cez `x-admin-key`)
- CRUD ide cez API `/api/products` a `/api/posts`

## Env pre upload/form
- `CLOUDINARY_*` pre `/api/upload` (voliteľné)
- `NEXT_PUBLIC_FORMSPREE` už nastavené

## Produkcia
- MAMP je lokálne. V produkcii nastav `MYSQL_*` na managed MySQL (Railway/PlanetScale) a deployni.
# laser

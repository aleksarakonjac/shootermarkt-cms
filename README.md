# Shootermarkt CMS

Odvojeni Payload CMS za članke, urednike i media fajlove. Ne sadrži sportske podatke niti javne Shootermarkt rute.

## Lokalno pokretanje

1. Kopirati `.env.example` u `.env.local` i uneti **zaseban** `CMS_DATABASE_URL` i `PAYLOAD_SECRET`.
2. Instalirati pakete: `corepack pnpm install`.
3. Generisati Payload import mapu: `corepack pnpm payload:generate-importmap`.
4. Pokrenuti: `corepack pnpm dev` i otvoriti `/cms/admin`.

## Pre povezivanja na Vercel

- Povezati `Media` sa trajnim Supabase Storage adapterom.
- Kreirati CMS bazu i eksplicitnu migraciju Payload tabela.
- Preneti postojeće članke i slike iz starog CMS-a.
- Tek tada povezati domen `cms.shootermarkt.rs`.

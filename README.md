# Cer'Amica di Bruna Tumminia

Sito ufficiale per le ceramiche artistiche di Bruna Tumminia.

## Stack tecnologico

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (immagini opere)
- **Auth**: Supabase Auth
- **Hosting**: Vercel
- **Pagamenti** (futuro): Stripe

## Struttura del progetto

```
ceramica-nextjs/
├── app/
│   ├── page.tsx              # Homepage
│   ├── layout.tsx            # Layout root
│   ├── galleria/             # Galleria pubblica
│   ├── artista/              # Chi sono
│   ├── contatti/             # Contatti
│   ├── shop/                 # Shop (futuro)
│   └── admin/                # Pannello admin
│       ├── page.tsx          # Login
│       ├── galleria/         # Gestione opere
│       ├── categorie/        # Gestione categorie
│       └── testi/            # Modifica testi
├── components/
│   ├── ui/                   # Header, Footer
│   ├── home/                 # Sezioni homepage
│   ├── gallery/              # Galleria pubblica
│   └── admin/                # Componenti admin
├── lib/
│   └── supabase.ts           # Client Supabase + tipi
├── styles/
│   └── globals.css           # CSS globale + variabili
└── public/                   # Logo e immagini statiche
```

## Setup locale

1. Clona il repository
2. `npm install`
3. Copia `.env.example` in `.env.local` e compila i valori
4. `npm run dev`

## Deploy

Il sito si deploya automaticamente su Vercel ad ogni push sul branch `main`.

## Variabili d'ambiente necessarie su Vercel

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (quando attivi lo shop)
- `STRIPE_SECRET_KEY` (quando attivi lo shop)

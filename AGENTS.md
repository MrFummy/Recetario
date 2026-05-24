# Mi Recetario — Agent Rules

## Stack
- React + TypeScript + Vite (SPA, no SSR, no Next.js)
- Tailwind CSS v4
- Supabase JS client (no backend, direct queries)
- Target: static build for Nginx home server

## Secrets
- NEVER hardcode credentials
- All keys go in .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- Supabase project: gtqqqmethhakpybnuxin
- Supabase URL: https://gtqqqmethhakpybnuxin.supabase.co

## Code rules
- TypeScript strict mode, no `any`
- Files under 300 lines
- After each major feature: open browser and screenshot as artifact
---
type: "query"
date: "2026-07-26T09:28:33.233245+00:00"
question: "Por que Supabase JS client with no backend layer aparece semanticamente similar a n8n webhook recipe ingestion?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["Supabase JS client with no backend layer", "n8n webhook recipe ingestion", "Anadir Receta module (PDF upload form)", "Supabase database (direct JS client)", "Secrets policy: no hardcoded credentials"]
---

# Q: Por que Supabase JS client with no backend layer aparece semanticamente similar a n8n webhook recipe ingestion?

## Answer

Expanded from original query via vocab: [supabase, client, backend, layer, webhook, ingestion, recipe, database, form, pdf, catalogo, upload]. Then traversed BFS depth=2 (72 nodes) plus shortest-path.

Path is 1 hop: "Supabase JS client with no backend layer" --semantically_similar_to [INFERRED 0.7]--> "n8n webhook recipe ingestion". No structural link exists (no import, no call), which is why it is INFERRED and not EXTRACTED.

The inference fired because both nodes are the same architectural answer applied to opposite directions of the same Supabase database. Read path: Stack -> Supabase JS client with no backend layer -> Supabase project gtqqqmethhakpybnuxin. Write path: Anadir Receta module (PDF upload form) -> n8n webhook recipe ingestion -> shares_data_with -> Supabase database (direct JS client). Both bypass an app-owned server.

Code verification found the graph UNDERCOUNTED n8n. README documents one webhook (ingestion); the code has three hardcoded: nueva-receta (src/components/AddRecipeForm.tsx:6), eliminar-receta (src/hooks/useRecipes.ts:108), compartir-receta (src/hooks/useRecipes.ts:129). Delete and share webhooks are undocumented.

This also resolves the AMBIGUOUS edge "Secrets policy: no hardcoded credentials" -> "Supabase JS client with no backend layer". Supabase credentials correctly use env vars (src/lib/supabase.ts:3-4, VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY), but the three n8n endpoint URLs are hardcoded string literals. The secrets policy is honored for Supabase and violated for n8n. n8n is a de-facto backend layer that AGENTS.md claims does not exist.

## Outcome

- Signal: useful

## Source Nodes

- Supabase JS client with no backend layer
- n8n webhook recipe ingestion
- Anadir Receta module (PDF upload form)
- Supabase database (direct JS client)
- Secrets policy: no hardcoded credentials
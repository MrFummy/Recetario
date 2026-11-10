-- Marca de «ya avisé al admin» de cada sugerencia. El flujo de n8n «Aviso de sugerencias» sondea
-- las que la tienen nula, la reclama con un PATCH atómico y manda un mensaje por Telegram:
-- como mucho un aviso por sugerencia. Mismo patrón que `recetas.aviso_enviado_en`.
alter table public.sugerencias add column if not exists avisada_en timestamptz;

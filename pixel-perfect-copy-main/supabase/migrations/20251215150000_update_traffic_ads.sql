-- Add new columns to traffic_ads table to support detailed traffic data
ALTER TABLE public.traffic_ads 
ADD COLUMN IF NOT EXISTS date_stop DATE,
ADD COLUMN IF NOT EXISTS account_id TEXT,
ADD COLUMN IF NOT EXISTS campaign_id TEXT,
ADD COLUMN IF NOT EXISTS adset_id TEXT,
ADD COLUMN IF NOT EXISTS adset_name TEXT,
ADD COLUMN IF NOT EXISTS ad_id TEXT,
ADD COLUMN IF NOT EXISTS objective TEXT,
ADD COLUMN IF NOT EXISTS alcance NUMERIC,
ADD COLUMN IF NOT EXISTS frequencia NUMERIC,
ADD COLUMN IF NOT EXISTS cpm_all NUMERIC,
ADD COLUMN IF NOT EXISTS ctr_all NUMERIC,
ADD COLUMN IF NOT EXISTS cpc_all NUMERIC,
ADD COLUMN IF NOT EXISTS views_pagina_destino INTEGER,
ADD COLUMN IF NOT EXISTS custo_por_view_pagina_destino NUMERIC,
ADD COLUMN IF NOT EXISTS id_geral TEXT;

-- Create an index on id_geral to facilitate upserts/lookups
CREATE INDEX IF NOT EXISTS idx_traffic_ads_id_geral ON public.traffic_ads(id_geral);

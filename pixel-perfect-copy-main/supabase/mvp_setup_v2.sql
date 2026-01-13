-- ==============================================================================
-- MVP Setup V2 - FULL SCHEMA & DATA
-- ==============================================================================

-- 0. SCHEMA DEFINITIONS (Create tables if they don't exist)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    date TIMESTAMP WITH TIME ZONE,
    name TEXT,
    email TEXT,
    phone TEXT,
    funil TEXT,
    utm_source TEXT,
    utm_campaign TEXT,
    status TEXT
);

CREATE TABLE IF NOT EXISTS public.traffic_ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    date_start DATE,
    campaign_name TEXT,
    ad_name TEXT,
    valor_investido NUMERIC,
    impressoes INTEGER,
    cliques_no_link INTEGER,
    ctr_link NUMERIC,
    link_cpc NUMERIC
);

CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    cpf TEXT,
    income NUMERIC,
    assets NUMERIC,
    profile TEXT,
    status TEXT,
    consultant_id UUID REFERENCES auth.users(id) -- Assuming linking to auth users or profiles
);

CREATE TABLE IF NOT EXISTS public.insurances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_id UUID REFERENCES public.clients(id),
    consultant_id UUID REFERENCES auth.users(id),
    product_name TEXT,
    premium_value NUMERIC,
    start_date DATE,
    status TEXT,
    policy_number TEXT
);

CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    consultant_id UUID REFERENCES auth.users(id),
    insurance_id UUID REFERENCES public.insurances(id),
    description TEXT,
    type TEXT,
    level TEXT,
    amount NUMERIC,
    competence DATE,
    status TEXT
);

-- 1. SECURITY (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leads MVP" ON leads;
DROP POLICY IF EXISTS "Traffic MVP" ON traffic_ads;
DROP POLICY IF EXISTS "Clients MVP" ON clients;
DROP POLICY IF EXISTS "Insurances MVP" ON insurances;
DROP POLICY IF EXISTS "Commissions MVP" ON commissions;

CREATE POLICY "Leads MVP" ON leads FOR ALL USING (true);
CREATE POLICY "Traffic MVP" ON traffic_ads FOR ALL USING (true);
CREATE POLICY "Clients MVP" ON clients FOR ALL USING (true);
CREATE POLICY "Insurances MVP" ON insurances FOR ALL USING (true);
CREATE POLICY "Commissions MVP" ON commissions FOR ALL USING (true);

-- 2. SEED DATA (DO block for variables)
DO $$
DECLARE
    v_profile_id uuid;
    v_client_id uuid;
    v_insurance_id uuid;
BEGIN
    -- Get or Create a Profile (If none, we can't link, but let's assume one exists or we just use NULL if allowed)
    SELECT id INTO v_profile_id FROM profiles LIMIT 1;
    
    -- If no profile exists, try to get ANY user ID or just proceed with nulls if constraints allow.
    -- For MVP, if no profile, we might skip linking.
    
    IF v_profile_id IS NOT NULL THEN
        
        -- CLIENTS
        INSERT INTO public.clients (name, email, phone, income, assets, profile, status, consultant_id)
        VALUES 
            ('Cliente Exemplo', 'cliente@exemplo.com', '11999998888', 15000.00, 500000.00, 'moderado', 'ativo', v_profile_id)
        ON CONFLICT DO NOTHING;
        
        SELECT id INTO v_client_id FROM public.clients WHERE email = 'cliente@exemplo.com' LIMIT 1;

        -- LEADS
        INSERT INTO public.leads (date, name, email, phone, funil, utm_source, utm_campaign, status)
        VALUES
            (now(), 'Lead Teste 1', 'lead1@test.com', '11900001111', 'Novo', 'Google', 'MVP', 'Novo'),
            (now(), 'Lead Teste 2', 'lead2@test.com', '11900002222', 'Qualificacao', 'Facebook', 'MVP', 'Em Andamento');

        -- TRAFFIC ADS
        INSERT INTO public.traffic_ads (date_start, campaign_name, ad_name, valor_investido, impressoes, cliques_no_link, ctr_link, link_cpc)
        VALUES
            ('2024-12-01', 'Campanha MVP', 'Ad Teste', 100.00, 1000, 50, 5.0, 2.0);

        -- INSURANCES
        INSERT INTO public.insurances (client_id, consultant_id, product_name, premium_value, start_date, status, policy_number)
        VALUES
            (v_client_id, v_profile_id, 'Seguro MVP', 200.00, '2024-01-01', 'ativo', 'MVP-001')
        ON CONFLICT DO NOTHING;

        SELECT id INTO v_insurance_id FROM public.insurances WHERE policy_number = 'MVP-001' LIMIT 1;

        -- COMMISSIONS
        INSERT INTO public.commissions (consultant_id, insurance_id, description, type, level, amount, competence, status)
        VALUES
            (v_profile_id, v_insurance_id, 'Comissao MVP', 'Adesao', 'Direto', 50.00, '2024-01-01', 'aprovado');

    END IF;
END $$;

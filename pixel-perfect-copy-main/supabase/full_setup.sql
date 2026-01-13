-- ==============================================================================
-- 1. SECURITY & PERMISSIONS (Row Level Security)
-- ==============================================================================

-- ENABLE RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- DROP existing policies to avoid conflicts (optional, but good for "full setup")
DROP POLICY IF EXISTS "Leads are viewable by authenticated users." ON leads;
DROP POLICY IF EXISTS "Authenticated users can insert leads." ON leads;
DROP POLICY IF EXISTS "Authenticated users can update leads." ON leads;
DROP POLICY IF EXISTS "Traffic Ads are viewable by authenticated users." ON traffic_ads;
DROP POLICY IF EXISTS "Clients are viewable by authenticated users." ON clients;
DROP POLICY IF EXISTS "Insurances are viewable by authenticated users." ON insurances;
DROP POLICY IF EXISTS "Commissions are viewable by authenticated users." ON commissions;

-- CREATE PERMISSIVE POLICIES (Allow all authenticated users to View/Edit)
-- NOTE: In a real production app with multiple tenants, you would restrict by user_id or company_id.

-- LEADS
CREATE POLICY "Leads are viewable by authenticated users." ON leads
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert leads." ON leads
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update leads." ON leads
    FOR UPDATE USING (auth.role() = 'authenticated');

-- TRAFFIC ADS
CREATE POLICY "Traffic Ads are viewable by authenticated users." ON traffic_ads
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert traffic_ads." ON traffic_ads
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CLIENTS
CREATE POLICY "Clients are viewable by authenticated users." ON clients
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert clients." ON clients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update clients." ON clients
    FOR UPDATE USING (auth.role() = 'authenticated');

-- INSURANCES
CREATE POLICY "Insurances are viewable by authenticated users." ON insurances
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert insurances." ON insurances
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- COMMISSIONS
CREATE POLICY "Commissions are viewable by authenticated users." ON commissions
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert commissions." ON commissions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- ==============================================================================
-- 2. SEED DATA (Populate tables with test values)
-- ==============================================================================

-- We use a DO block to define variables and ensure cleaner execution
DO $$
DECLARE
    v_profile_id uuid;
    v_client_ricardo uuid;
    v_client_fernanda uuid;
    v_insurance_life uuid;
    v_insurance_prof uuid;
BEGIN
    -- 1. Get a profile ID to associate data with (uses the first found profile)
    SELECT id INTO v_profile_id FROM profiles LIMIT 1;
    
    -- If no profile exists, we can't link data, but we'll try to proceed or just warn
    IF v_profile_id IS NULL THEN
        RAISE NOTICE 'No profile found. Data will be inserted without specific consultant links where possible, or might fail if constraints exist.';
    END IF;

    -- 2. INSERT CLIENTS
    -- We insert and capturing IDs for relationships
    INSERT INTO public.clients (name, email, phone, income, assets, profile, status, consultant_id)
    VALUES 
        ('Ricardo Ferreira', 'ricardo@cliente.com', '11999998888', 15000.00, 500000.00, 'moderado', 'ativo', v_profile_id),
        ('Fernanda Oliveira', 'fernanda@cliente.com', '11988887777', 22000.00, 1200000.00, 'arrojado', 'ativo', v_profile_id),
        ('João da Silva', 'joao@prospecto.com', '11977776666', 5000.00, 50000.00, 'conservador', 'prospecto', v_profile_id),
        ('Mariana Santos', 'mariana@exemplo.com', '11966665555', 35000.00, 2000000.00, 'arrojado', 'ativo', v_profile_id),
        ('Pedro Alcantara', 'pedro@teste.com', '21999991111', 12000.00, 300000.00, 'moderado', 'ativo', v_profile_id)
    ON CONFLICT DO NOTHING; -- Avoid duplicates if running multiple times

    -- Retrieve IDs for relationships (simple lookup)
    SELECT id INTO v_client_ricardo FROM public.clients WHERE email = 'ricardo@cliente.com' LIMIT 1;
    SELECT id INTO v_client_fernanda FROM public.clients WHERE email = 'fernanda@cliente.com' LIMIT 1;

    -- 3. INSERT LEADS (Comprehensive list)
    INSERT INTO public.leads (date, name, email, phone, funil, utm_source, utm_campaign, utm_medium, utm_term, status)
    VALUES
        (now(), 'Carlos Lead', 'carlos@lead.com', '11955554444', 'Novo', 'Facebook', 'BlackFriday', 'cpc', 'investimentos', 'Novo'),
        (now() - interval '2 days', 'Ana Lead', 'ana@lead.com', '11944443333', 'Contato', 'Google', 'Institucional', 'search', 'seguros', 'Em Andamento'),
        (now() - interval '5 days', 'Pedro Lead', 'pedro@lead.com', '11933332222', 'Proposta', 'Instagram', 'Stories', 'social', 'previdencia', 'Quente'),
        (now() - interval '10 days', 'Julia Interessada', 'julia@mail.com', '11922221111', 'Novo', 'Linkedin', 'Outbound', 'message', NULL, 'Novo'),
        (now() - interval '12 days', 'Marcos Duvidoso', 'marcos@mail.com', '21988880000', 'Qualificacao', 'Google', 'Search_Generic', 'search', 'planejamento', 'Novo'),
        (now() - interval '1 hour', 'Lucas Agora', 'lucas@now.com', '11977779999', 'Novo', 'Direct', NULL, NULL, NULL, 'Novo');

    -- 4. INSERT TRAFFIC ADS (Simulating Meta/Google Ads data)
    INSERT INTO public.traffic_ads (date_start, campaign_name, ad_name, valor_investido, impressoes, cliques_no_link, ctr_link, link_cpc, views_pagina_destino, custo_por_view_pagina_destino)
    VALUES
        ('2024-11-01', 'Campanha Black Friday', 'Img_01_Promo', 150.00, 5000, 120, 2.40, 1.25, 100, 1.50),
        ('2024-11-02', 'Campanha Institucional', 'Video_Depoimento', 200.00, 8000, 95, 1.18, 2.10, 80, 2.50),
        ('2024-11-03', 'Campanha Leads', 'Carrossel_Beneficios', 300.00, 12000, 250, 2.08, 1.20, 200, 1.50),
        ('2024-11-04', 'Campanha Retargeting', 'Video_Lembrete', 100.00, 3000, 50, 1.66, 2.00, 40, 2.50),
        ('2024-11-05', 'Campanha Black Friday', 'Img_02_Urgency', 180.00, 6000, 150, 2.50, 1.20, 130, 1.38),
        ('2024-11-06', 'Campanha Leads', 'Img_ebook_v1', 250.00, 9000, 180, 2.00, 1.39, 150, 1.67);

    -- 5. INSERT INSURANCES
    INSERT INTO public.insurances (client_id, consultant_id, product_name, premium_value, start_date, status, policy_number)
    VALUES
        (v_client_ricardo, v_profile_id, 'Seguro de Vida M1', 250.00, '2024-01-15', 'ativo', 'POL-001'),
        (v_client_fernanda, v_profile_id, 'Seguro Profissional', 450.00, '2024-02-20', 'ativo', 'POL-002'),
        (v_client_fernanda, v_profile_id, 'Previdência Privada', 1000.00, '2024-03-10', 'analise', 'PROP-003'),
        (v_client_ricardo, v_profile_id, 'Seguro Residencial', 80.00, '2024-06-05', 'ativo', 'POL-004'),
        (v_client_ricardo, v_profile_id, 'Responsabilidade Civil', 300.00, '2024-07-01', 'cancelado', 'POL-005')
    ON CONFLICT DO NOTHING;

    -- Capture Insurance IDs for Commissions (Linking by Policy Number for simplicity in this block)
    SELECT id INTO v_insurance_life FROM public.insurances WHERE policy_number = 'POL-001' LIMIT 1;
    SELECT id INTO v_insurance_prof FROM public.insurances WHERE policy_number = 'POL-002' LIMIT 1;

    -- 6. INSERT COMMISSIONS
    INSERT INTO public.commissions (consultant_id, insurance_id, description, type, level, amount, competence, status)
    VALUES
        (v_profile_id, v_insurance_life, 'Venda Seguro - Ricardo', 'Adesao', 'Direto', 62.50, '2024-11-01', 'aprovado'),
        (v_profile_id, v_insurance_prof, 'Recorrência - Fernanda', 'Recorrencia', 'Direto', 45.00, '2024-11-01', 'pendente'),
        (v_profile_id, v_insurance_life, 'Recorrência - Ricardo', 'Recorrencia', 'Direto', 25.00, '2024-12-01', 'pendente'),
        (v_profile_id, NULL, 'Bonus Trimestral', 'Adesao', 'Direto', 1500.00, '2024-10-01', 'aprovado');

END $$;

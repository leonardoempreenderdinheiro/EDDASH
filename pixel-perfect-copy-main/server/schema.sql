
-- Create Profiles Table (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    company TEXT, -- 'Ed Capital', 'Ed Seguros', etc.
    role TEXT DEFAULT 'Consultor', -- 'Master', 'Socio', 'Gestor', 'Consultor'
    status TEXT DEFAULT 'pending', -- 'active', 'pending', 'inactive'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
    source TEXT, -- 'Facebook', 'Google', 'Organic', etc.
    consultant_id UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Goals Table (Metas)
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id),
    type TEXT NOT NULL, -- 'global', 'team', 'individual'
    metric TEXT NOT NULL, -- 'revenue', 'leads', 'calls', etc.
    target_value NUMERIC NOT NULL DEFAULT 0,
    current_value NUMERIC NOT NULL DEFAULT 0,
    period TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly'
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Traffic Ads Table (Mock structure for now, to be populated from APIs later)
CREATE TABLE IF NOT EXISTS public.traffic_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_name TEXT,
    adset_name TEXT,
    ad_name TEXT,
    spend NUMERIC DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    platform TEXT, -- 'facebook', 'google'
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Insurances Table (Vendas/Seguros)
CREATE TABLE IF NOT EXISTS public.insurances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID REFERENCES public.profiles(id),
    client_name TEXT NOT NULL,
    policy_number TEXT,
    insurance_type TEXT, -- 'life', 'health', 'auto', etc.
    premium_value NUMERIC NOT NULL DEFAULT 0,
    commission_value NUMERIC NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending', -- 'pending', 'active', 'cancelled'
    start_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

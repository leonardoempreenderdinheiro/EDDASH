-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    company TEXT NOT NULL, -- 'ed_capital', 'ed_seguros', etc.
    sector TEXT NOT NULL, -- 'sales', 'marketing'
    metric TEXT NOT NULL, -- 'revenue', 'leads', 'mqls', 'sales_target', 'demos_target'
    target_value NUMERIC NOT NULL,
    period DATE NOT NULL, -- First day of the month usually
    user_id UUID REFERENCES auth.users(id), -- Optional: if goal maps to specific user
    user_name TEXT -- Optional: for simpler display, denormalized
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    company TEXT NOT NULL,
    project TEXT, -- 'Lançamento A', 'Perpétuo'
    platform TEXT, -- 'Meta', 'Google'
    amount NUMERIC NOT NULL,
    period DATE NOT NULL
);

-- RLS Policies
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON "public"."goals"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."budgets"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."goals"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."budgets"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON "public"."goals"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Enable update for authenticated users only" ON "public"."budgets"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

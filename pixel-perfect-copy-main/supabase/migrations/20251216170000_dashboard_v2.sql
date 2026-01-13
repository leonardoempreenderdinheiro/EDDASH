-- Migration: Dashboard 2.0 Structure

-- 1. Create Goals Table (Metas)
create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  company text not null, -- 'ed_capital', 'ed_seguros', 'techfinance', 'consolidado'
  sector text not null, -- 'sales', 'marketing'
  metric text not null, -- 'revenue', 'leads', 'mqls'
  target_value numeric not null,
  period date not null, -- First day of the month (e.g., 2025-01-01)
  current_value numeric default 0 -- Optional: cache current progress
);

-- 2. Create Budgets Table (Orçamento de Marketing)
create table if not exists public.budgets (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  company text not null,
  project text, -- 'launch_x', 'evergreen', etc.
  platform text, -- 'meta_ads', 'google_ads'
  amount numeric not null,
  period date not null
);

-- 3. Update Leads (Add MQL flag)
alter table public.leads 
add column if not exists is_mql boolean default false;

-- 4. Update Insurances (Add UTM Source for 'Revenue by Source')
alter table public.insurances
add column if not exists utm_source text;

-- Enable RLS
alter table public.goals enable row level security;
alter table public.budgets enable row level security;

-- Simple Policies (adjust as needed)
create policy "Allow read access for authenticated users" on public.goals
  for select using (auth.role() = 'authenticated');

create policy "Allow read access for authenticated users" on public.budgets
  for select using (auth.role() = 'authenticated');

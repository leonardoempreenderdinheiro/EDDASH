-- Migration: Support for Fischer Sales Model

-- 1. Update Goals to support Individual Targets (SDRs/Closers)
alter table public.goals 
add column if not exists profile_id uuid references public.profiles(id);

-- 2. Update Leads to distinguish SDR (Pre-sales) from Consultant (Closer)
alter table public.leads 
add column if not exists sdr_id uuid references public.profiles(id),
add column if not exists origin_detailed text, -- For specific origins like 'Inbound Orgânico', 'Indicação - CE'
add column if not exists meeting_date timestamp with time zone, -- Data do agendamento
add column if not exists meeting_status text; -- 'scheduled', 'completed', 'no_show', 'cancelled'

-- 3. Create a view or function for "Fischer Matrix" might be complex, sticking to raw queries for now.

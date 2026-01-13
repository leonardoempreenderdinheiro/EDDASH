-- Create a table for public profiles (synced with auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique,
  full_name text,
  role text check (role in ('CMO', 'CEO', 'CTO', 'CCO', 'Socio', 'Gestor', 'Equipe')),
  company text check (company in ('Ed Capital', 'Ed Seguros', 'Techfinance')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Access policies
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

-- Allow Admins to update ANY profile
create policy "Admins can update any profile." on profiles
  for update using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('CEO', 'Gestor', 'Socio', 'CMO', 'CTO', 'CCO')
    )
  );

-- Allow users to update their own profile (fallback if not admin)
create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, company)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'Equipe', 'Ed Capital'); -- Default values
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- [NEW] Migrations for Profile Enhancements
-- 1. Add new columns
alter table profiles 
add column if not exists avatar_url text,
add column if not exists status text check (status in ('pending', 'active', 'rejected')) default 'pending';

-- 2. Update existing users to active (so they don't get locked out)
update profiles set status = 'active' where status is null;

-- 3. Update the handle_new_user function to set default status to 'pending'
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, company, status)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    'Equipe', 
    'Techfinance', -- Default company
    'pending'      -- Default status
  ); 
  return new;
end;
$$ language plpgsql security definer;

-- 4. Storage Bucket for Avatars (Run this in SQL Editor)
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible."
on storage.objects for select
using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
on storage.objects for insert
with check ( bucket_id = 'avatars' );

create policy "Anyone can update their own avatar."
on storage.objects for update
using ( auth.uid() = owner and bucket_id = 'avatars' );


-- FinMEI Dashboard - Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  cnpj text,
  mei_status boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. transactions table
create table if not exists transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text check (type in ('income', 'expense')) not null,
  amount numeric(12,2) not null,
  transaction_date date not null,
  category text,
  description text,
  file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. recurring_debts table
create table if not exists recurring_debts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  amount numeric(10,2) not null,
  due_day integer check (due_day between 1 and 31) not null,
  category text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. das_payments table
create table if not exists das_payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  reference_month date not null,
  amount numeric(10,2),
  status text check (status in ('pending', 'paid', 'overdue')) default 'pending',
  paid_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create indexes for better performance
create index if not exists idx_transactions_user_id on transactions(user_id);
create index if not exists idx_transactions_date on transactions(transaction_date);
create index if not exists idx_recurring_debts_user_id on recurring_debts(user_id);
create index if not exists idx_das_payments_user_id on das_payments(user_id);
create index if not exists idx_das_payments_month on das_payments(reference_month);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table transactions enable row level security;
alter table recurring_debts enable row level security;
alter table das_payments enable row level security;

-- RLS Policies for profiles
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- RLS Policies for transactions
create policy "Users can view own transactions" on transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert own transactions" on transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own transactions" on transactions
  for update using (auth.uid() = user_id);

create policy "Users can delete own transactions" on transactions
  for delete using (auth.uid() = user_id);

-- RLS Policies for recurring_debts
create policy "Users can view own recurring debts" on recurring_debts
  for select using (auth.uid() = user_id);

create policy "Users can insert own recurring debts" on recurring_debts
  for insert with check (auth.uid() = user_id);

create policy "Users can update own recurring debts" on recurring_debts
  for update using (auth.uid() = user_id);

create policy "Users can delete own recurring debts" on recurring_debts
  for delete using (auth.uid() = user_id);

-- RLS Policies for das_payments
create policy "Users can view own DAS payments" on das_payments
  for select using (auth.uid() = user_id);

create policy "Users can insert own DAS payments" on das_payments
  for insert with check (auth.uid() = user_id);

create policy "Users can update own DAS payments" on das_payments
  for update using (auth.uid() = user_id);

create policy "Users can delete own DAS payments" on das_payments
  for delete using (auth.uid() = user_id);

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage bucket for notas-fiscais
-- Run this in Supabase Dashboard > Storage > Create a new bucket named "notas-fiscais"
-- Then set the bucket to private and add the following policy:

-- Storage Policy (run in SQL Editor):
-- Allow users to upload files to their own folder
/*
insert into storage.buckets (id, name, public)
values ('notas-fiscais', 'notas-fiscais', false);

create policy "Users can upload own files" on storage.objects
  for insert with check (bucket_id = 'notas-fiscais' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view own files" on storage.objects
  for select using (bucket_id = 'notas-fiscais' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own files" on storage.objects
  for delete using (bucket_id = 'notas-fiscais' and auth.uid()::text = (storage.foldername(name))[1]);
*/

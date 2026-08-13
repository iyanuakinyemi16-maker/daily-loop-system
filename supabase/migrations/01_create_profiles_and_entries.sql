-- supabase/migrations/01_create_profiles_and_entries.sql

-- Create profiles table linked to auth.users
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  display_name text,
  created_at timestamptz default now()
);

-- Entries table matching the app Entry shape
create table if not exists entries (
  id text primary key,
  user_id uuid references profiles(id) on delete cascade,
  date date not null,
  energy int,
  wins text,
  misses text,
  winCauses text,
  missCauses text,
  "constraint" text,
  experiment text,
  predicted int,
  actual int,
  outcome text,
  error int,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists entries_user_id_idx on entries (user_id);
create index if not exists entries_created_at_idx on entries (created_at);

-- Enable Row Level Security and policy so users only access their rows
alter table entries enable row level security;

create policy "Users can manage own entries"
  on entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Gymnastica: ejecutar en Supabase → SQL Editor → Run

create table if not exists public.gymnastica_store (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.gymnastica_store enable row level security;

drop policy if exists "gymnastica_select" on public.gymnastica_store;
drop policy if exists "gymnastica_insert" on public.gymnastica_store;
drop policy if exists "gymnastica_update" on public.gymnastica_store;

-- Demo / desarrollo: acceso con anon key (ajusta RLS en producción)
create policy "gymnastica_select"
  on public.gymnastica_store for select
  using (true);

create policy "gymnastica_insert"
  on public.gymnastica_store for insert
  with check (true);

create policy "gymnastica_update"
  on public.gymnastica_store for update
  using (true);

insert into public.gymnastica_store (id, data)
values
  ('db', '{}'::jsonb),
  ('usuarios', '{}'::jsonb)
on conflict (id) do nothing;

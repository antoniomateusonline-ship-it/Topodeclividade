-- Execute este script no SQL Editor do seu projeto Supabase
-- (https://supabase.com/dashboard/project/_/sql/new)

create table if not exists public.relatorios (
  id text primary key,
  type text not null,
  title_text text,
  obra text,
  responsavel text,
  data_texto text,
  item_count integer,
  created_at timestamptz,
  header_html text,
  entries_html text,
  title_block_html text,
  inserted_at timestamptz default now()
);

-- Habilita RLS (recomendado) e libera inserir/atualizar/ler com a chave anon.
-- Ajuste as políticas conforme a necessidade de segurança do seu projeto.
alter table public.relatorios enable row level security;

create policy "Permitir leitura pública" on public.relatorios
  for select using (true);

create policy "Permitir inserção pública" on public.relatorios
  for insert with check (true);

create policy "Permitir atualização pública" on public.relatorios
  for update using (true);

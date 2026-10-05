-- Tabela que recebe os pedidos de orçamento da Calculadora de Storage.
-- Execute no Supabase: SQL Editor → New query → cole este arquivo → Run.
--
-- Uma linha por pedido: o local escolhido e, em cada coluna de item, a quantidade pedida
-- (vazio quando o item não foi escolhido). Os nomes das colunas são os `id` de data.js
-- com "_" no lugar de "-".

create table if not exists public.pedidos (
  id              bigint generated always as identity primary key,
  criado_em       timestamptz not null default now(),
  local           text not null,

  -- Storages
  ts_433          integer check (ts_433 >= 0),          -- QNAP TS-433-4G
  ts_435xeu       integer check (ts_435xeu >= 0),       -- QNAP TS-435XeU-4G
  ts_673a         integer check (ts_673a >= 0),         -- QNAP TS-673A-8G
  ts_1232pxu_rp   integer check (ts_1232pxu_rp >= 0),   -- QNAP TS-1232PXU-RP-4G

  -- Discos
  ssd_dc600m_7680 integer check (ssd_dc600m_7680 >= 0), -- SSD Kingston DC600M 7,68 TB
  st4000nt001     integer check (st4000nt001 >= 0),     -- HD Seagate IronWolf Pro 4 TB
  st8000nt001     integer check (st8000nt001 >= 0),     -- HD Seagate IronWolf Pro 8 TB
  st12000nt001    integer check (st12000nt001 >= 0),    -- HD Seagate IronWolf Pro 12 TB
  st16000nt001    integer check (st16000nt001 >= 0),    -- HD Seagate IronWolf Pro 16 TB
  st20000nt001    integer check (st20000nt001 >= 0),    -- HD Seagate IronWolf Pro 20 TB
  st28000nt000    integer check (st28000nt000 >= 0),    -- HD Seagate IronWolf Pro 28 TB

  -- Acessórios
  ssd_kc3000_2048 integer check (ssd_kc3000_2048 >= 0), -- SSD Kingston KC3000 2 TB (cache)
  rks_02          integer check (rks_02 >= 0)           -- Kit trilho Synology RKS-02
);

-- Tabela criada antes destes itens: adiciona as colunas novas.
alter table public.pedidos add column if not exists ts_673a integer check (ts_673a >= 0);
alter table public.pedidos add column if not exists ssd_kc3000_2048 integer check (ssd_kc3000_2048 >= 0);
alter table public.pedidos add column if not exists rks_02 integer check (rks_02 >= 0);

-- O site usa a chave pública "anon". Com RLS ativo e só esta política, visitantes podem
-- inserir pedidos, mas não podem ler, alterar nem apagar os existentes.
alter table public.pedidos enable row level security;

drop policy if exists "Site pode inserir pedidos" on public.pedidos;
create policy "Site pode inserir pedidos"
  on public.pedidos for insert
  to anon
  with check (true);

grant insert on public.pedidos to anon;

-- ---------------------------------------------------------------------------
-- Página administrativa (admin.html): listar e excluir pedidos.
--
-- Só usuários logados (Supabase Auth) e cadastrados em `administradores` podem ler e
-- apagar pedidos. A chave pública sozinha continua podendo apenas inserir.
--
-- Depois de rodar este arquivo:
--   1. Authentication → Users → Add user: crie o usuário do administrador (e-mail e senha).
--   2. Authentication → Sign In / Providers: desative "Allow new users to sign up".
--   3. Cadastre o administrador (troque o e-mail):
--        insert into public.administradores (user_id)
--        select id from auth.users where email = 'admin@exemplo.com';
-- ---------------------------------------------------------------------------

create table if not exists public.administradores (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- Sem políticas: ninguém lê ou altera esta tabela pelo site, só pelo painel do Supabase.
alter table public.administradores enable row level security;

-- security definer: consulta `administradores` mesmo sem acesso direto a ela.
create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.administradores where user_id = auth.uid());
$$;

revoke execute on function public.eh_admin() from public, anon;
grant execute on function public.eh_admin() to authenticated;

drop policy if exists "Administradores podem ler pedidos" on public.pedidos;
create policy "Administradores podem ler pedidos"
  on public.pedidos for select
  to authenticated
  using ((select public.eh_admin()));

drop policy if exists "Administradores podem excluir pedidos" on public.pedidos;
create policy "Administradores podem excluir pedidos"
  on public.pedidos for delete
  to authenticated
  using ((select public.eh_admin()));

grant select, delete on public.pedidos to authenticated;

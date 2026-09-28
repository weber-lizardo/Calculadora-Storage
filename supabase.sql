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
  ts_1232pxu_rp   integer check (ts_1232pxu_rp >= 0),   -- QNAP TS-1232PXU-RP-4G

  -- Discos
  ssd_dc600m_7680 integer check (ssd_dc600m_7680 >= 0), -- SSD Kingston DC600M 7,68 TB
  st4000nt001     integer check (st4000nt001 >= 0),     -- HD Seagate IronWolf Pro 4 TB
  st8000nt001     integer check (st8000nt001 >= 0),     -- HD Seagate IronWolf Pro 8 TB
  st12000nt001    integer check (st12000nt001 >= 0),    -- HD Seagate IronWolf Pro 12 TB
  st16000nt001    integer check (st16000nt001 >= 0),    -- HD Seagate IronWolf Pro 16 TB
  st20000nt001    integer check (st20000nt001 >= 0),    -- HD Seagate IronWolf Pro 20 TB
  st28000nt000    integer check (st28000nt000 >= 0)     -- HD Seagate IronWolf Pro 28 TB
);

-- O site usa a chave pública "anon". Com RLS ativo e só esta política, visitantes podem
-- inserir pedidos, mas não podem ler, alterar nem apagar os existentes.
alter table public.pedidos enable row level security;

drop policy if exists "Site pode inserir pedidos" on public.pedidos;
create policy "Site pode inserir pedidos"
  on public.pedidos for insert
  to anon
  with check (true);

grant insert on public.pedidos to anon;

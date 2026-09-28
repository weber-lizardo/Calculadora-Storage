# Calculadora de Storage

Site estático que calcula o custo de aquisição de uma storage QNAP com os discos
e a capacidade útil após configurar o RAID.

## Como usar

Abra `index.html` no navegador (não precisa de servidor nem de build).

1. Escolha o local do orçamento (lista em ordem alfabética, definida em `LOCAIS` no `data.js`).
2. Escolha a storage: TS-433-4G, TS-435XeU-4G ou TS-1232PXU-RP-4G.
3. Escolha o disco: SSD Kingston DC600M 7,68 TB ou HD Seagate IronWolf Pro de 4, 8, 12, 16, 20 ou 28 TB.
4. O resumo mostra:
   - o custo total: storage + (preço do disco × número de baias);
   - a capacidade bruta e a útil:
     - storages de 4 baias usam **RAID 5**: útil = (4 − 1) × capacidade do disco;
     - a storage de 12 baias usa **RAID 6**: útil = (12 − 2) × capacidade do disco;
   - o aproveitamento e o custo por TB útil.
5. Clique em **Gerar pedido do orçamento**.

## Pedidos do orçamento (Supabase)

Cada clique em "Gerar pedido do orçamento" grava uma linha na tabela `pedidos` de um
projeto [Supabase](https://supabase.com): o local escolhido e, em cada coluna de item, a
quantidade pedida (1 storage e um disco por baia).

| criado_em | local | ts_433 | … | st8000nt001 | … |
|-----------|-------|--------|---|-------------|---|
| 2026-09-28 10:15 | ADRA-ES | 1 | | 4 | |

As colunas de item usam o `id` de cada produto em `data.js`, com `_` no lugar de `-`.

### Configuração

1. Crie um projeto em [supabase.com](https://supabase.com) (o plano gratuito basta).
2. Em **SQL Editor → New query**, cole o conteúdo de [`supabase.sql`](supabase.sql) e
   clique em **Run**. Isso cria a tabela `pedidos` e a política de segurança.
3. Em **Project Settings → API Keys**, copie a **Publishable key** e coloque-a em
   `SUPABASE_KEY`, no `data.js`, junto com a URL do projeto em `SUPABASE_URL`.

A Publishable key é pública por natureza e pode ficar no site: a política da tabela só
permite **inserir** pedidos. Ninguém consegue ler, alterar ou apagar pedidos com ela.
**Nunca use a Secret key no site**: ela ignora as políticas e dá acesso total ao banco.
Para ver os pedidos, use o **Table Editor** do Supabase ou a página administrativa abaixo.

### Página administrativa (`admin.html`)

Lista os pedidos da tabela e permite marcar linhas (ou todas) e excluí-las. A página não é
linkada no site e não é indexada por buscadores, mas o que protege os dados é o login:
só quem entra com um usuário do Supabase Auth cadastrado em `administradores` consegue
ler ou apagar pedidos. Para configurar, siga os passos no fim de [`supabase.sql`](supabase.sql)
(criar o usuário, desativar novos cadastros e cadastrar o administrador).

**Ao adicionar um produto em `data.js`**, crie também a coluna dele na tabela, por exemplo:

```sql
alter table public.pedidos add column st24000nt002 integer check (st24000nt002 >= 0);
```

## Preços

Os preços em `data.js` são **valores de referência**. Confira o preço atual no link
"Ver na loja" de cada item. Você pode editar o preço direto na página; o valor fica
salvo no navegador (`localStorage`). O botão "Restaurar preços padrão" volta aos valores
de `data.js`. Para mudar o padrão para todos, edite o campo `preco` em `data.js`.

## Imagens

As fotos das storages ficam em `img/` (`ts-433.jpg`, `ts-435xeu.jpg`, `ts-1232pxu-rp.jpg`).
Para trocar uma foto, substitua o arquivo ou altere o campo `imagem` do item em `data.js`.

## Publicação

Por ser estático, dá para publicar com GitHub Pages
(Settings → Pages → Deploy from branch, pasta `/`).

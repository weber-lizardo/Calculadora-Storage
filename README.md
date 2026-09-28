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

## Pedidos do orçamento (Excel)

Cada clique em "Gerar pedido do orçamento" acrescenta uma linha e baixa a planilha
`pedidos-orcamento.xlsx` com todos os pedidos já gerados:

| Local | QNAP TS-433-4G | … | HD Seagate IronWolf Pro 8 TB | … | Data |
|-------|----------------|---|------------------------------|---|------|
| ADRA-ES | 1 | | 4 | | 28/09/2026, 10:15:00 |

- A primeira coluna é o local escolhido.
- Há uma coluna para cada item do catálogo; a linha traz a quantidade de cada item
  escolhido (1 storage e um disco por baia).

Como o site é estático, os pedidos ficam guardados no navegador (`localStorage`) e a
planilha é baixada de novo, completa, a cada pedido. Para continuar uma planilha em outro
computador ou navegador, use "Continuar uma planilha existente" e escolha o `.xlsx`: os
próximos pedidos são acrescentados a ela. "Limpar pedidos" começa uma planilha nova.
A geração da planilha usa a biblioteca [SheetJS](https://sheetjs.com/), carregada por CDN.

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

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

### Gravar direto na planilha do SharePoint

O site não consegue editar a planilha pelo link de compartilhamento: a API da Microsoft
sempre exige autenticação. Quem faz a ponte é um fluxo do Power Automate, que roda com a
conta de quem o criou; os usuários do site não precisam fazer login.

1. **Prepare a planilha.** Na célula A1, cole a linha de cabeçalhos abaixo (separada por
   tabulação), selecione-a e use **Inserir → Tabela** (marque "Minha tabela tem
   cabeçalhos"). Em **Design da Tabela**, dê o nome `Pedidos` à tabela.

   ```
   Local	QNAP TS-433-4G	QNAP TS-435XeU-4G	QNAP TS-1232PXU-RP-4G	SSD Kingston DC600M 7,68 TB	HD Seagate IronWolf Pro 4 TB	HD Seagate IronWolf Pro 8 TB	HD Seagate IronWolf Pro 12 TB	HD Seagate IronWolf Pro 16 TB	HD Seagate IronWolf Pro 20 TB	HD Seagate IronWolf Pro 28 TB	Data
   ```

2. **Crie o fluxo** em [make.powerautomate.com](https://make.powerautomate.com) → Criar →
   Fluxo da nuvem instantâneo:
   - Gatilho **Quando uma solicitação HTTP é recebida** (conector Premium). Em "Quem pode
     disparar o fluxo", escolha **Qualquer pessoa**. Em "Esquema JSON do corpo da
     solicitação", use "Usar conteúdo de amostra" e cole:

     ```json
     {"Local":"AES","QNAP TS-433-4G":1,"QNAP TS-435XeU-4G":"","QNAP TS-1232PXU-RP-4G":"","SSD Kingston DC600M 7,68 TB":"","HD Seagate IronWolf Pro 4 TB":4,"HD Seagate IronWolf Pro 8 TB":"","HD Seagate IronWolf Pro 12 TB":"","HD Seagate IronWolf Pro 16 TB":"","HD Seagate IronWolf Pro 20 TB":"","HD Seagate IronWolf Pro 28 TB":"","Data":"28/09/2026, 10:15:00"}
     ```

   - Ação **Excel Online (Business) → Adicionar uma linha a uma tabela**: escolha o site
     SAD-USeB/TI, o arquivo e a tabela `Pedidos`, e preencha cada coluna com o campo de
     mesmo nome do gatilho.
   - Ação **Resposta** com código de status `200`.

3. **Salve o fluxo**, copie a URL gerada no gatilho HTTP e coloque em `PEDIDOS_URL`, no
   `data.js`.

Com `PEDIDOS_URL` preenchido, cada clique em "Gerar pedido do orçamento" acrescenta uma
linha na planilha do SharePoint. Com `PEDIDOS_URL` vazio, o site volta a baixar o
`pedidos-orcamento.xlsx` localmente. A URL do fluxo fica visível no código do site: quem
a tiver consegue inserir linhas, mas não consegue ler nem apagar a planilha.

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

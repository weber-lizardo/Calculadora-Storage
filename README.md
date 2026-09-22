# Calculadora de Storage

Site estático que calcula o custo de aquisição de uma storage QNAP com os discos
e a capacidade útil após configurar o RAID.

## Como usar

Abra `index.html` no navegador (não precisa de servidor nem de build).

1. Escolha a storage: TS-433-4G, TS-435XeU-4G ou TS-1232PXU-RP-4G.
2. Escolha o disco: SSD Kingston DC600M 7,68 TB ou HD Seagate IronWolf Pro de 4, 8, 12, 16, 20 ou 28 TB.
3. O resumo mostra:
   - o custo total: storage + (preço do disco × número de baias);
   - a capacidade bruta e a útil:
     - storages de 4 baias usam **RAID 5**: útil = (4 − 1) × capacidade do disco;
     - a storage de 12 baias usa **RAID 6**: útil = (12 − 2) × capacidade do disco;
   - o aproveitamento e o custo por TB útil.

## Preços

Os preços em `data.js` são **valores de referência**. Confira o preço atual no link
"Ver na loja" de cada item. Você pode editar o preço direto na página; o valor fica
salvo no navegador (`localStorage`). O botão "Restaurar preços padrão" volta aos valores
de `data.js`. Para mudar o padrão para todos, edite o campo `preco` em `data.js`.

## Publicação

Por ser estático, dá para publicar com GitHub Pages
(Settings → Pages → Deploy from branch, pasta `/`).

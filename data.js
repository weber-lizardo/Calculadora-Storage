// Catálogo de produtos da calculadora.
// Os preços são valores de referência (R$) e podem ser ajustados na própria página;
// confira o valor atualizado no link de cada produto antes de fechar a compra.
// `imagem` aponta para img/; troque por uma foto (.jpg/.png/.webp) com o mesmo caminho ou outro nome.

const STORAGES = [
  {
    id: "ts-433",
    imagem: "img/ts-433.svg",
    nome: "QNAP TS-433-4G",
    descricao: "Desktop · 4 baias · ARM Cortex-A55 4 núcleos · 4 GB DDR4 · 1x 2,5GbE + 1x GbE",
    baias: 4,
    raid: "RAID 5",
    discosParidade: 1,
    preco: 3399.99,
    url: "https://www.waz.com.br/nas-qnap-4-baias-ts-433-4g-us-arm-4-core-cortex-a55-4gb-ddr4-1x-2-5gbe-lan-1x-gbe-lan-sem-discos-125679-html/p",
  },
  {
    id: "ts-435xeu",
    imagem: "img/ts-435xeu.svg",
    nome: "QNAP TS-435XeU-4G",
    descricao: "Rack 1U · 4 baias · Marvell 4 núcleos 2,2 GHz · 4 GB · 2x 2,5GbE · 2x 10GbE SFP+ · 2 fontes",
    baias: 4,
    raid: "RAID 5",
    discosParidade: 1,
    preco: 5899.99,
    url: "https://www.waz.com.br/nas-qnap-4-baias-rack-ts-435xeu-4g-us-1u-marvell-4-cores-2-2ghz-4gb-2x-2-5gbe-lan-hdmi-pci-e-gen3-x2-2psu-s-hd-126017-html/p",
  },
  {
    id: "ts-1232pxu-rp",
    imagem: "img/ts-1232pxu-rp.svg",
    nome: "QNAP TS-1232PXU-RP-4G",
    descricao: "Rack 2U · 12 baias · Alpine AL-324 · 4 GB · 2x GbE · 2x 10GbE SFP+ · 2 fontes",
    baias: 12,
    raid: "RAID 6",
    discosParidade: 2,
    preco: 14599.99,
    url: "https://www.waz.com.br/nas-qnap-12-baias-rack-ts-1232pxu-rp-4g-us-2u-alpine-al-324-4gb-2x-gigabit-2x-lan-10x2-10-gigabit-sfp-1x-hdmi-s-hd-125683-html/p",
  },
];

const DISCOS = [
  {
    id: "ssd-dc600m-7680",
    nome: "SSD Kingston DC600M 7,68 TB",
    descricao: "SSD 2,5\" SATA III · Mixed-Use · 560/530 MB/s",
    capacidadeTB: 7.68,
    preco: 24999.98,
    url: "https://www.kabum.com.br/produto/459939/ssd-kingston-dc600m-mixed-use-7-68-tb-sata-iii-2-5-leitura-560-mb-s-gravacao-530-mb-s-para-servidor-preto-sedc600m-7680g",
  },
  {
    id: "st4000nt001",
    nome: "HD Seagate IronWolf Pro 4 TB",
    descricao: "ST4000NT001 · 3,5\" · 7.200 RPM · 256 MB cache · CMR",
    capacidadeTB: 4,
    preco: 1829.99,
    url: "https://www.waz.com.br/hd-4tb-sata-seagate-ironwolf-pro-st4000nt001-3-5pol-6gb-s-7-200-rpm-256mb-cache-cmr-126100-html/p",
  },
  {
    id: "st8000nt001",
    nome: "HD Seagate IronWolf Pro 8 TB",
    descricao: "ST8000NT001 · 3,5\" · 7.200 RPM · 256 MB cache · CMR",
    capacidadeTB: 8,
    preco: 2749.99,
    url: "https://www.waz.com.br/hd-8tb-sata3-seagate-ironwolf-pro-st8000nt001-3-5pol-6gb-s-7-200-rpm-256mb-cache-cmr-126156-html/p",
  },
  {
    id: "st12000nt001",
    nome: "HD Seagate IronWolf Pro 12 TB",
    descricao: "ST12000NT001 · 3,5\" · 7.200 RPM · 256 MB cache · CMR",
    capacidadeTB: 12,
    preco: 4399.99,
    url: "https://www.waz.com.br/hd-12tb-sata3-seagate-ironwolf-pro-st12000nt001-3-5pol-6gb-s-7-200-rpm-256mb-cache-cmr-126158-html/p",
  },
  {
    id: "st16000nt001",
    nome: "HD Seagate IronWolf Pro 16 TB",
    descricao: "ST16000NT001 · 3,5\" · 7.200 RPM · 256 MB cache",
    capacidadeTB: 16,
    preco: 4799.99,
    url: "https://www.waz.com.br/hd-16tb-sata-seagate-ironwolf-pro-st16000nt001-3-5pol-6gb-s-7-200-rpm-256mb-cache-126026-html/p",
  },
  {
    id: "st20000nt001",
    nome: "HD Seagate IronWolf Pro 20 TB",
    descricao: "ST20000NT001 · 3,5\" · 7.200 RPM · 256 MB cache · CMR",
    capacidadeTB: 20,
    preco: 6999.99,
    url: "https://www.waz.com.br/hd-20tb-sata3-seagate-ironwolf-pro-st20000nt001-3-5pol-6gb-s-7-200-rpm-256mb-cache-cmr-126161-html/p",
  },
  {
    id: "st28000nt000",
    nome: "HD Seagate IronWolf Pro 28 TB",
    descricao: "ST28000NT000 · 3,5\" · 7.200 RPM · 512 MB cache · CMR",
    capacidadeTB: 28,
    preco: 8599.99,
    url: "https://www.waz.com.br/hd-28tb-sata-seagate-ironwolf-pro-st28000nt000-3-5pol-6gb-s-7-200-rpm-cmr-512mb-cache-132745-html/p",
  },
];

// Cálculo puro, sem dependência do DOM (reutilizável e testável).
// RAID 5 reserva o espaço de 1 disco para paridade; RAID 6 reserva 2.
function calcular(storage, disco, precoStorage = storage.preco, precoDisco = disco.preco) {
  const quantidade = storage.baias;
  const custoDiscos = precoDisco * quantidade;
  const custoTotal = precoStorage + custoDiscos;
  const brutoTB = disco.capacidadeTB * quantidade;
  const discosDados = quantidade - storage.discosParidade;
  const utilTB = disco.capacidadeTB * discosDados;
  const utilTiB = (utilTB * 1e12) / 2 ** 40;
  return {
    quantidade,
    custoDiscos,
    custoTotal,
    brutoTB,
    paridadeTB: brutoTB - utilTB,
    utilTB,
    utilTiB,
    eficiencia: utilTB / brutoTB,
    custoPorTB: custoTotal / utilTB,
  };
}

if (typeof module !== "undefined") {
  module.exports = { STORAGES, DISCOS, calcular };
}

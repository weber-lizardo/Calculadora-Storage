// Catálogo de produtos da calculadora.
// Os preços são valores de referência (R$) e podem ser ajustados na própria página;
// confira o valor atualizado no link de cada produto antes de fechar a compra.
// `imagem` aponta para a foto do produto em img/.

// Projeto Supabase que recebe os pedidos (tabela `pedidos`, criada por supabase.sql).
// Use a URL do projeto e a chave pública "Publishable key" (Settings → API Keys). Ela pode
// ficar no site: a política da tabela só permite inserir pedidos, não ler nem alterar.
// NUNCA coloque aqui a Secret key: ela ignora as políticas e dá acesso total ao banco.
const SUPABASE_URL = "https://ifsvfmtynuingkmgkbka.supabase.co";
const SUPABASE_KEY = "sb_publishable_IJeenrb-73hW5lHkQYLg2g_8wUqfXSH";

// Locais que podem pedir o orçamento, em ordem alfabética.
const LOCAIS = [
  "USeB", "ADRA-ES", "ADRA-RJ", "ADRA-MG", "AES", "ASES", "EDESSA", "IPAE", "FADMINAS",
  "NET", "AMC", "AML", "AMS", "MMN", "MMO", "ARC", "ARF", "ARS",
].sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));

const STORAGES = [
  {
    id: "ts-433",
    imagem: "img/ts-433.jpg",
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
    imagem: "img/ts-435xeu.jpg",
    nome: "QNAP TS-435XeU-4G",
    descricao: "Rack 1U · 4 baias · Marvell 4 núcleos 2,2 GHz · 4 GB · 2x 2,5GbE · 2x 10GbE SFP+ · 2 fontes",
    baias: 4,
    raid: "RAID 5",
    discosParidade: 1,
    preco: 5899.99,
    acessorios: ["rks-02"],
    url: "https://www.waz.com.br/nas-qnap-4-baias-rack-ts-435xeu-4g-us-1u-marvell-4-cores-2-2ghz-4gb-2x-2-5gbe-lan-hdmi-pci-e-gen3-x2-2psu-s-hd-126017-html/p",
  },
  {
    id: "ts-673a",
    imagem: "img/ts-673a.jpg",
    nome: "QNAP TS-673A-8G",
    descricao: "Desktop · 6 baias · AMD Ryzen V1500B · 8 GB DDR4 · 2x M.2 NVMe · 2x 2,5GbE · 2x PCIe x8",
    baias: 6,
    raid: "RAID 5",
    discosParidade: 1,
    preco: 7999.99,
    acessorios: ["ssd-kc3000-2048"],
    url: "https://www.waz.com.br/nas-qnap-6-baias-ts-673a-8g-us-ryzen-v1500b-8gb-ddr4-2x-m-2-nvme-2x-2-5gbe-lan-2x-pcie-x8-slot-sem-discos-122090-html/p",
  },
  {
    id: "ts-1232pxu-rp",
    imagem: "img/ts-1232pxu-rp.jpg",
    nome: "QNAP TS-1232PXU-RP-4G",
    descricao: "Rack 2U · 12 baias · Alpine AL-324 · 4 GB · 2x GbE · 2x 10GbE SFP+ · 2 fontes",
    baias: 12,
    raid: "RAID 6",
    discosParidade: 2,
    preco: 14599.99,
    acessorios: ["rks-02"],
    url: "https://www.waz.com.br/nas-qnap-12-baias-rack-ts-1232pxu-rp-4g-us-2u-alpine-al-324-4gb-2x-gigabit-2x-lan-10x2-10-gigabit-sfp-1x-hdmi-s-hd-125683-html/p",
  },
];

// Opção para comprar somente os discos (reposição ou expansão de uma storage existente).
// Não tem coluna própria na tabela `pedidos`, não limita a quantidade de discos e não
// oferece acessórios (o SSD KC3000 só é vendido junto com a TS-673A-8G).
const SEM_STORAGE = {
  id: "sem-storage",
  nome: "Sem Storage",
  descricao: "Somente os discos, sem a storage. A quantidade de discos é livre.",
  semStorage: true,
  baias: null,
  preco: 0,
};

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

// Itens adquiridos junto com algumas storages (campo `acessorios` de cada storage).
// `opcional: true` vira uma caixa de seleção; os demais entram sempre no orçamento.
const ACESSORIOS = [
  {
    id: "ssd-kc3000-2048",
    nome: "SSD Kingston KC3000 2 TB",
    descricao: "SKC3000D/2048G · M.2 2280 · PCIe 4.0 NVMe · 7.000 MB/s",
    quantidade: 2, // padrão: 2 unidades em RAID 1
    maximo: 2, // slots M.2 da TS-673A-8G; a quantidade pode ir de 1 até aqui
    opcional: true,
    cacheTB: 2, // capacidade de uma unidade: 2 em RAID 1 (espelho) = 2 TB de cache
    funcao: "Cache SSD em RAID 1 nos slots M.2. Não faz parte do RAID das baias de disco.",
    preco: 3349.99,
    url: "https://www.waz.com.br/ssd-m-2-2280-pcie-4-0-nvme-2tb-kingston-kc3000-7000mb-s-skc3000d-2048g-133894-html/p",
  },
  {
    id: "rks-02",
    nome: "Kit trilho telescópico Synology RKS-02",
    descricao: "Trilho para montagem da storage em rack",
    quantidade: 1,
    opcional: false,
    funcao: "Montagem em rack.",
    preco: 1399.99,
    url: "https://www.waz.com.br/kit-trilho-telescopico-para-nas-2u-synology-rks-02-126361-html/p",
  },
];

function acessoriosDe(storage) {
  return (storage.acessorios || []).map((id) => ACESSORIOS.find((a) => a.id === id));
}

// Aviso do cache SSD: o RAID 1 precisa de 2 unidades espelhadas.
function avisoCache(acessorio, quantidade) {
  if (!acessorio.cacheTB || quantidade >= 2) return "";
  return `Com ${quantidade} ${acessorio.nome} não é possível montar o RAID 1 (mínimo de 2 unidades). ` +
    `O cache fica sem proteção: se o SSD falhar, o cache é perdido.`;
}

// RAID usado com `quantidade` discos. RAID 5 exige 3 discos e RAID 6 exige 4; abaixo disso
// a sugestão é RAID 1 (espelho de 2 discos; um 3º disco fica como hot spare).
function raidPara(storage, quantidade) {
  if (storage.semStorage) {
    return { raid: "Sem RAID", discosDados: quantidade, falhas: 0, hotSpare: 0, aviso: "" };
  }
  const minimo = storage.discosParidade + 2;
  if (quantidade >= minimo) {
    return { raid: storage.raid, discosDados: quantidade - storage.discosParidade,
      falhas: storage.discosParidade, hotSpare: 0, aviso: "" };
  }
  if (quantidade >= 2) {
    return { raid: "RAID 1", discosDados: 1, falhas: 1, hotSpare: quantidade - 2,
      aviso: `Com ${quantidade} discos não é possível usar ${storage.raid} (mínimo de ${minimo}). ` +
        `Sugestão: RAID 1 (espelhamento)` + (quantidade > 2 ? ` com ${quantidade - 2} disco de hot spare.` : ".") };
  }
  return { raid: "Disco único", discosDados: 1, falhas: 0, hotSpare: 0,
    aviso: `Com 1 disco não há RAID nem proteção contra falhas. Use ao menos 2 discos para RAID 1 ` +
      `ou ${minimo} para ${storage.raid}.` };
}

// Cálculo puro, sem dependência do DOM (reutilizável e testável).
// RAID 5 reserva o espaço de 1 disco para paridade; RAID 6 reserva 2; RAID 1 espelha 2 discos.
function calcular(storage, disco, opcoes = {}) {
  const {
    quantidade = storage.baias,
    precoStorage = storage.preco,
    precoDisco = disco.preco,
    acessorios = [], // [{ item, quantidade, preco }] escolhidos
  } = opcoes;
  const custoDiscos = precoDisco * quantidade;
  const custoAcessorios = acessorios.reduce((t, a) => t + a.preco * a.quantidade, 0);
  const custoTotal = precoStorage + custoDiscos + custoAcessorios;
  const raid = raidPara(storage, quantidade);
  const brutoTB = disco.capacidadeTB * quantidade;
  const utilTB = disco.capacidadeTB * raid.discosDados;
  const utilTiB = (utilTB * 1e12) / 2 ** 40;
  return {
    quantidade,
    custoDiscos,
    custoAcessorios,
    custoTotal,
    ...raid,
    brutoTB,
    redundanciaTB: brutoTB - utilTB,
    utilTB,
    utilTiB,
    eficiencia: utilTB / brutoTB,
    custoPorTB: custoTotal / utilTB,
  };
}

if (typeof module !== "undefined") {
  module.exports = {
    SUPABASE_URL, SUPABASE_KEY, LOCAIS, STORAGES, SEM_STORAGE, DISCOS, ACESSORIOS,
    acessoriosDe, avisoCache, raidPara, calcular,
  };
}

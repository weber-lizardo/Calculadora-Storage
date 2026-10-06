(function () {
  const CHAVE_PRECOS = "calculadora-storage:precos";

  const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const numero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
  const pct = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });

  const estado = {
    local: "",
    storageId: null,
    discoId: null,
    quantidades: {}, // discoId -> quantidade escolhida (padrão: uma por baia)
    qtdAcessorios: {}, // acessórioId -> quantidade escolhida (padrão: a do catálogo)
    opcionais: new Set(), // acessórios opcionais marcados
    precos: carregarPrecos(),
  };

  function carregarPrecos() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_PRECOS)) || {};
    } catch (e) {
      return {};
    }
  }

  function salvarPrecos() {
    try {
      localStorage.setItem(CHAVE_PRECOS, JSON.stringify(estado.precos));
    } catch (e) {
      // Sem armazenamento disponível: os preços valem só para esta sessão.
    }
  }

  function precoDe(item) {
    const p = estado.precos[item.id];
    return typeof p === "number" && p >= 0 ? p : item.preco;
  }

  function storageAtual() {
    if (estado.storageId === SEM_STORAGE.id) return SEM_STORAGE;
    return STORAGES.find((s) => s.id === estado.storageId);
  }

  // Sem storage não há baias: a quantidade é livre e começa em 1.
  function maximoDiscos(storage) {
    return storage.baias || Infinity;
  }

  function quantidadeDe(disco, storage) {
    const q = estado.quantidades[disco.id];
    return Number.isInteger(q) && q >= 1 && q <= maximoDiscos(storage) ? q : storage.baias || 1;
  }

  function quantidadeAcessorio(a) {
    const q = estado.qtdAcessorios[a.id];
    return a.maximo && Number.isInteger(q) && q >= 1 && q <= a.maximo ? q : a.quantidade;
  }

  function acessoriosEscolhidos(storage) {
    return acessoriosDe(storage)
      .filter((a) => !a.opcional || estado.opcionais.has(a.id))
      .map((a) => ({ item: a, quantidade: quantidadeAcessorio(a), preco: precoDe(a) }));
  }

  function controleQuantidadeAcessorio(a) {
    if (!a.maximo) return "";
    const q = quantidadeAcessorio(a);
    const aviso = avisoCache(a, q);
    return `
      <span class="qtd-linha">
        <span class="rotulo">Quantidade</span>
        <input type="number" class="qtd-acessorio" min="1" max="${a.maximo}" step="1" inputmode="numeric"
               value="${q}" data-id="${a.id}" aria-label="Quantidade de ${a.nome}" />
        <span class="rotulo">de ${a.maximo} slots</span>
      </span>
      ${aviso ? `<span class="alerta">${aviso}</span>` : ""}`;
  }

  function controleQuantidade(disco, storage) {
    if (!storage) {
      return `<span class="qtd-linha"><span class="rotulo">Quantidade: escolha a storage</span></span>`;
    }
    return `
      <span class="qtd-linha">
        <span class="rotulo">Quantidade</span>
        <input type="number" class="qtd" min="1" ${storage.baias ? `max="${storage.baias}"` : ""} step="1"
               inputmode="numeric" value="${quantidadeDe(disco, storage)}" data-id="${disco.id}"
               aria-label="Quantidade de ${disco.nome}" />
        <span class="rotulo">${storage.baias ? `de ${storage.baias} baias` : "sem limite"}</span>
      </span>`;
  }

  function cartao(item, grupo, selecionado, detalhe, extra = "", tipo = "radio") {
    const el = document.createElement("label");
    el.className = "cartao" + (selecionado ? " ativo" : "");
    el.innerHTML = `
      <input type="${tipo}" name="${grupo}" value="${item.id}" ${selecionado ? "checked" : ""} />
      ${item.imagem ? `<img class="foto" src="${item.imagem}" alt="${item.nome}" loading="lazy" />` : ""}
      <span class="cartao-topo">
        <strong>${item.nome}</strong>
        <span class="selo">${detalhe}</span>
      </span>
      <span class="desc">${item.descricao}</span>
      <span class="preco-linha">
        <span class="rotulo">Preço (R$)</span>
        <input type="number" class="preco" min="0" step="0.01" inputmode="decimal"
               value="${precoDe(item).toFixed(2)}" data-id="${item.id}"
               aria-label="Preço de ${item.nome} em reais" />
      </span>
      ${extra}
      <a href="${item.url}" target="_blank" rel="noopener noreferrer">Ver na loja ↗</a>
    `;
    return el;
  }

  function cartaoSemStorage(selecionado) {
    const el = document.createElement("label");
    el.className = "cartao" + (selecionado ? " ativo" : "");
    el.innerHTML = `
      <input type="radio" name="storage" value="${SEM_STORAGE.id}" ${selecionado ? "checked" : ""} />
      <span class="cartao-topo">
        <strong>${SEM_STORAGE.nome}</strong>
        <span class="selo">somente discos</span>
      </span>
      <span class="desc">${SEM_STORAGE.descricao}</span>
    `;
    return el;
  }

  function renderizarListas() {
    const listaS = document.getElementById("lista-storages");
    const listaD = document.getElementById("lista-discos");
    listaS.replaceChildren(
      ...STORAGES.map((s) =>
        cartao(s, "storage", s.id === estado.storageId, `${s.baias} baias · ${s.raid}`)
      ),
      cartaoSemStorage(estado.storageId === SEM_STORAGE.id)
    );
    const storage = storageAtual();
    listaD.replaceChildren(
      ...DISCOS.map((d) =>
        cartao(d, "disco", d.id === estado.discoId, `${numero.format(d.capacidadeTB)} TB`,
          controleQuantidade(d, storage))
      )
    );

    document.getElementById("dica-disco").textContent = storage?.semStorage
      ? "Sem storage: escolha o disco e a quantidade desejada, sem limite de baias."
      : storage
      ? `Por padrão, uma unidade por baia da ${storage.nome} (${storage.baias}). ` +
        `Ajuste a quantidade em cada disco.`
      : "Por padrão, uma unidade por baia da storage. A quantidade pode ser ajustada em cada disco.";

    const acessorios = storage ? acessoriosDe(storage) : [];
    document.getElementById("secao-acessorios").hidden = acessorios.length === 0;
    document.getElementById("lista-acessorios").replaceChildren(
      ...acessorios.map((a) => {
        const marcado = !a.opcional || estado.opcionais.has(a.id);
        const q = quantidadeAcessorio(a);
        const el = cartao(a, "acessorio", marcado,
          `${q} ${q > 1 ? "unidades" : "unidade"} · ${a.opcional ? "opcional" : "incluído"}`,
          `<span class="funcao">${a.funcao}</span>${controleQuantidadeAcessorio(a)}`, "checkbox");
        if (!a.opcional) {
          el.classList.add("fixo");
          el.querySelector('input[type="checkbox"]').disabled = true;
        }
        return el;
      })
    );
  }

  function linha(rotulo, valor, classe = "") {
    return `<div class="linha ${classe}"><dt>${rotulo}</dt><dd>${valor}</dd></div>`;
  }

  function renderizarResumo() {
    const alvo = document.getElementById("resumo-conteudo");
    const storage = storageAtual();
    const disco = DISCOS.find((d) => d.id === estado.discoId);

    if (!storage || !disco) {
      alvo.innerHTML = `<p class="vazio">${
        storage ? "Agora selecione um disco." : "Selecione uma storage e um disco para ver o cálculo."
      }</p>`;
      return;
    }

    const precoS = precoDe(storage);
    const precoD = precoDe(disco);
    const acessorios = acessoriosEscolhidos(storage);
    const r = calcular(storage, disco, {
      quantidade: quantidadeDe(disco, storage),
      precoStorage: precoS,
      precoDisco: precoD,
      acessorios,
    });
    const discos = (n) => `${n} ${n > 1 ? "discos" : "disco"}`;

    if (storage.semStorage) {
      alvo.innerHTML = `
        <h3>Custo de aquisição</h3>
        <dl>
          ${linha(`${r.quantidade} × ${disco.nome}`, moeda.format(r.custoDiscos))}
          <div class="sub">${r.quantidade} × ${moeda.format(precoD)}</div>
          ${linha("Total", moeda.format(r.custoTotal), "total")}
        </dl>

        <h3>Armazenamento</h3>
        <dl>
          ${linha("Capacidade bruta", `${numero.format(r.brutoTB)} TB`, "total")}
          <div class="sub">≈ ${numero.format(r.utilTiB)} TiB exibidos pelo sistema</div>
          ${linha("Custo por TB", moeda.format(r.custoPorTB))}
        </dl>
        <p class="formula">
          Sem storage: compra somente de ${discos(r.quantidade)}. A capacidade útil depende do
          RAID da storage em que forem instalados.
        </p>
      `;
      return;
    }

    const cache = acessorios.find((a) => a.item.cacheTB);
    const avisoSsd = cache ? avisoCache(cache.item, cache.quantidade) : "";
    const livres = storage.baias - r.quantidade;

    let formula;
    if (r.raid === "RAID 1") {
      formula = `RAID 1: 2 discos espelhados = ${numero.format(r.utilTB)} TB úteis. Suporta a falha de 1 disco.` +
        (r.hotSpare ? ` ${discos(r.hotSpare)} de hot spare assume no lugar do que falhar.` : "");
    } else if (r.falhas === 0) {
      formula = `Sem RAID: ${numero.format(r.utilTB)} TB úteis, sem proteção contra falha do disco.`;
    } else {
      formula = `${r.raid}: (${r.quantidade} − ${storage.discosParidade}) × ${numero.format(disco.capacidadeTB)} TB
        = ${numero.format(r.utilTB)} TB úteis. Suporta a falha de até ${discos(r.falhas)} sem perda de dados.`;
    }

    alvo.innerHTML = `
      ${storage.imagem ? `<img class="foto-resumo" src="${storage.imagem}" alt="${storage.nome}" />` : ""}
      <h3>Custo de aquisição</h3>
      <dl>
        ${linha(storage.nome, moeda.format(precoS))}
        ${linha(`${r.quantidade} × ${disco.nome}`, moeda.format(r.custoDiscos))}
        <div class="sub">${r.quantidade} × ${moeda.format(precoD)}</div>
        ${acessorios
          .map(
            (a) =>
              linha(`${a.quantidade} × ${a.item.nome}`, moeda.format(a.preco * a.quantidade)) +
              (a.quantidade > 1 ? `<div class="sub">${a.quantidade} × ${moeda.format(a.preco)}</div>` : "")
          )
          .join("")}
        ${linha("Total", moeda.format(r.custoTotal), "total")}
      </dl>

      <h3>Armazenamento em ${r.raid}</h3>
      ${r.aviso ? `<p class="alerta" role="alert">${r.aviso}</p>` : ""}
      <dl>
        ${linha("Capacidade bruta", `${numero.format(r.brutoTB)} TB`)}
        ${r.redundanciaTB > 0
          ? linha(
              `${r.raid === "RAID 1" ? "Espelho" : "Paridade"}${r.hotSpare ? " e hot spare" : ""} (${discos(r.quantidade - r.discosDados)})`,
              `− ${numero.format(r.redundanciaTB)} TB`
            )
          : ""}
        ${linha("Capacidade útil", `${numero.format(r.utilTB)} TB`, "total")}
        <div class="sub">≈ ${numero.format(r.utilTiB)} TiB exibidos pelo sistema</div>
        ${linha("Aproveitamento", pct.format(r.eficiencia))}
        ${linha("Custo por TB útil", moeda.format(r.custoPorTB))}
        ${cache
          ? linha(`Cache SSD (${cache.quantidade >= 2 ? "RAID 1" : "sem RAID"})`, `${numero.format(cache.item.cacheTB)} TB`)
          : ""}
        ${cache ? `<div class="sub">Nos slots M.2; não entra na capacidade útil nem no RAID das baias.</div>` : ""}
      </dl>
      ${avisoSsd ? `<p class="alerta" role="alert">${avisoSsd}</p>` : ""}
      <p class="formula">
        ${formula}
        ${livres > 0 ? `<br />${livres} ${livres > 1 ? "baias livres" : "baia livre"} para expansão futura.` : ""}
      </p>
    `;
  }

  function atualizar() {
    renderizarListas();
    renderizarResumo();
  }

  function renderizarLocais() {
    const seletor = document.getElementById("local");
    seletor.append(...LOCAIS.map((l) => new Option(l, l)));
  }

  // ---- Pedido do orçamento (tabela `pedidos` do Supabase) ----

  function status(texto, erro = false) {
    const el = document.getElementById("pedido-status");
    el.textContent = texto;
    el.classList.toggle("erro", erro);
  }

  // Coluna do item na tabela: o id com "_" no lugar de "-".
  function colunaBanco(item) {
    return item.id.replace(/-/g, "_");
  }

  function gerarPedido() {
    const storage = storageAtual();
    const disco = DISCOS.find((d) => d.id === estado.discoId);
    const faltando = [
      !estado.local && "o local",
      !storage && "a storage",
      !disco && "o disco",
    ].filter(Boolean);
    if (faltando.length) {
      status(`Selecione ${faltando.join(", ").replace(/, ([^,]*)$/, " e $1")} antes de gerar o pedido.`, true);
      return;
    }

    const botao = document.getElementById("gerar-pedido");
    botao.disabled = true;
    status("Enviando pedido…");
    const pedido = { local: estado.local };
    if (!storage.semStorage) pedido[colunaBanco(storage)] = 1;
    pedido[colunaBanco(disco)] = quantidadeDe(disco, storage);
    for (const a of acessoriosEscolhidos(storage)) pedido[colunaBanco(a.item)] = a.quantidade;
    fetch(`${SUPABASE_URL}/rest/v1/pedidos`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(pedido),
    })
      .then((r) => {
        if (!r.ok) throw new Error(r.status);
        status(`Pedido de ${pedido.local} registrado.`);
      })
      .catch(() => status("Não foi possível registrar o pedido. Tente novamente.", true))
      .finally(() => { botao.disabled = false; });
  }

  document.getElementById("gerar-pedido").addEventListener("click", gerarPedido);

  document.addEventListener("change", (ev) => {
    const t = ev.target;
    if (t.id === "local") {
      estado.local = t.value;
      return;
    }
    if (t.name === "storage") {
      estado.storageId = t.value;
      estado.quantidades = {}; // volta ao padrão: uma unidade por baia da nova storage
    } else if (t.name === "disco") estado.discoId = t.value;
    else if (t.name === "acessorio") {
      if (t.checked) estado.opcionais.add(t.value);
      else estado.opcionais.delete(t.value);
    } else if (t.classList.contains("qtd")) {
      // Ao sair do campo, corrige valores fora do intervalo e escolhe o disco.
      const storage = storageAtual();
      const q = Math.round(parseFloat(t.value));
      estado.quantidades[t.dataset.id] = Number.isFinite(q)
        ? Math.min(Math.max(q, 1), maximoDiscos(storage))
        : storage.baias || 1;
      estado.discoId = t.dataset.id;
    } else if (t.classList.contains("qtd-acessorio")) {
      // Mesmo comportamento para o acessório: corrige o valor e marca o item.
      const a = ACESSORIOS.find((x) => x.id === t.dataset.id);
      const q = Math.round(parseFloat(t.value));
      estado.qtdAcessorios[a.id] = Number.isFinite(q) ? Math.min(Math.max(q, 1), a.maximo) : a.quantidade;
      if (a.opcional) estado.opcionais.add(a.id);
    } else return;
    atualizar();
  });

  document.addEventListener("input", (ev) => {
    const t = ev.target;
    if (t.classList.contains("qtd")) {
      const q = Number(t.value);
      if (Number.isInteger(q) && q >= 1 && q <= maximoDiscos(storageAtual())) {
        estado.quantidades[t.dataset.id] = q;
        renderizarResumo();
      }
      return;
    }
    if (t.classList.contains("qtd-acessorio")) {
      const a = ACESSORIOS.find((x) => x.id === t.dataset.id);
      const q = Number(t.value);
      if (Number.isInteger(q) && q >= 1 && q <= a.maximo) {
        estado.qtdAcessorios[a.id] = q;
        renderizarResumo();
      }
      return;
    }
    if (!t.classList.contains("preco")) return;
    const valor = parseFloat(t.value);
    if (Number.isFinite(valor) && valor >= 0) {
      estado.precos[t.dataset.id] = valor;
      salvarPrecos();
      renderizarResumo();
    }
  });

  document.getElementById("restaurar").addEventListener("click", () => {
    estado.precos = {};
    salvarPrecos();
    atualizar();
  });

  renderizarLocais();
  atualizar();
})();

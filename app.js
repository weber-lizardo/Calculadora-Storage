(function () {
  const CHAVE_PRECOS = "calculadora-storage:precos";
  const CHAVE_PEDIDOS = "calculadora-storage:pedidos";
  const ARQUIVO_PEDIDOS = "pedidos-orcamento.xlsx";
  const COL_LOCAL = "Local";
  const COL_DATA = "Data";

  const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const numero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
  const pct = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });

  const estado = {
    local: "",
    storageId: null,
    discoId: null,
    precos: carregar(CHAVE_PRECOS, {}),
    // Cada pedido é um objeto { Local, <nome do item>: quantidade, ..., Data }.
    pedidos: carregar(CHAVE_PEDIDOS, []),
  };

  function carregar(chave, padrao) {
    try {
      return JSON.parse(localStorage.getItem(chave)) || padrao;
    } catch (e) {
      return padrao;
    }
  }

  function salvar(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch (e) {
      // Sem armazenamento disponível: os dados valem só para esta sessão.
    }
  }

  function salvarPrecos() {
    salvar(CHAVE_PRECOS, estado.precos);
  }

  function precoDe(item) {
    const p = estado.precos[item.id];
    return typeof p === "number" && p >= 0 ? p : item.preco;
  }

  function cartao(item, grupo, selecionado, detalhe) {
    const el = document.createElement("label");
    el.className = "cartao" + (selecionado ? " ativo" : "");
    el.innerHTML = `
      <input type="radio" name="${grupo}" value="${item.id}" ${selecionado ? "checked" : ""} />
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
      <a href="${item.url}" target="_blank" rel="noopener noreferrer">Ver na loja ↗</a>
    `;
    return el;
  }

  function renderizarListas() {
    const listaS = document.getElementById("lista-storages");
    const listaD = document.getElementById("lista-discos");
    listaS.replaceChildren(
      ...STORAGES.map((s) =>
        cartao(s, "storage", s.id === estado.storageId, `${s.baias} baias · ${s.raid}`)
      )
    );
    listaD.replaceChildren(
      ...DISCOS.map((d) =>
        cartao(d, "disco", d.id === estado.discoId, `${numero.format(d.capacidadeTB)} TB`)
      )
    );

    const storage = STORAGES.find((s) => s.id === estado.storageId);
    document.getElementById("dica-disco").textContent = storage
      ? `Serão ${storage.baias} unidades (uma por baia da ${storage.nome}).`
      : "O disco escolhido é multiplicado pela quantidade de baias da storage.";
  }

  function linha(rotulo, valor, classe = "") {
    return `<div class="linha ${classe}"><dt>${rotulo}</dt><dd>${valor}</dd></div>`;
  }

  function renderizarResumo() {
    const alvo = document.getElementById("resumo-conteudo");
    const storage = STORAGES.find((s) => s.id === estado.storageId);
    const disco = DISCOS.find((d) => d.id === estado.discoId);

    if (!storage || !disco) {
      alvo.innerHTML = `<p class="vazio">${
        storage ? "Agora selecione um disco." : "Selecione uma storage e um disco para ver o cálculo."
      }</p>`;
      return;
    }

    const precoS = precoDe(storage);
    const precoD = precoDe(disco);
    const r = calcular(storage, disco, precoS, precoD);

    alvo.innerHTML = `
      ${storage.imagem ? `<img class="foto-resumo" src="${storage.imagem}" alt="${storage.nome}" />` : ""}
      <h3>Custo de aquisição</h3>
      <dl>
        ${linha(storage.nome, moeda.format(precoS))}
        ${linha(`${r.quantidade} × ${disco.nome}`, moeda.format(r.custoDiscos))}
        <div class="sub">${r.quantidade} × ${moeda.format(precoD)}</div>
        ${linha("Total", moeda.format(r.custoTotal), "total")}
      </dl>

      <h3>Armazenamento em ${storage.raid}</h3>
      <dl>
        ${linha("Capacidade bruta", `${numero.format(r.brutoTB)} TB`)}
        ${linha(
          `Paridade (${storage.discosParidade} ${storage.discosParidade > 1 ? "discos" : "disco"})`,
          `− ${numero.format(r.paridadeTB)} TB`
        )}
        ${linha("Capacidade útil", `${numero.format(r.utilTB)} TB`, "total")}
        <div class="sub">≈ ${numero.format(r.utilTiB)} TiB exibidos pelo sistema</div>
        ${linha("Aproveitamento", pct.format(r.eficiencia))}
        ${linha("Custo por TB útil", moeda.format(r.custoPorTB))}
      </dl>
      <p class="formula">
        ${storage.raid}: (${r.quantidade} − ${storage.discosParidade}) × ${numero.format(disco.capacidadeTB)} TB
        = ${numero.format(r.utilTB)} TB úteis. Suporta a falha de até
        ${storage.discosParidade} ${storage.discosParidade > 1 ? "discos" : "disco"} sem perda de dados.
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

  // ---- Pedido do orçamento (planilha Excel) ----

  function status(texto, erro = false) {
    const el = document.getElementById("pedido-status");
    el.textContent = texto;
    el.classList.toggle("erro", erro);
  }

  function totalPedidos() {
    const n = estado.pedidos.length;
    return `${n} ${n === 1 ? "pedido" : "pedidos"} na planilha.`;
  }

  // Colunas fixas: Local, um item do catálogo por coluna e a data.
  // Colunas extras vindas de uma planilha importada são mantidas antes da data.
  function colunas() {
    const itens = [...STORAGES, ...DISCOS].map((i) => i.nome);
    const extras = [];
    for (const p of estado.pedidos) {
      for (const k of Object.keys(p)) {
        if (k !== COL_LOCAL && k !== COL_DATA && !itens.includes(k) && !extras.includes(k)) {
          extras.push(k);
        }
      }
    }
    return [COL_LOCAL, ...itens, ...extras, COL_DATA];
  }

  function baixarPlanilha() {
    const cab = colunas();
    const linhas = estado.pedidos.map((p) => cab.map((c) => p[c] ?? ""));
    const aba = XLSX.utils.aoa_to_sheet([cab, ...linhas]);
    aba["!cols"] = cab.map((c) => ({ wch: Math.max(8, c.length + 2) }));
    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, aba, "Pedidos");
    XLSX.writeFile(livro, ARQUIVO_PEDIDOS);
  }

  // Coluna do item na tabela `pedidos` do Supabase: o id com "_" no lugar de "-".
  function colunaBanco(item) {
    return item.id.replace(/-/g, "_");
  }

  // Grava o pedido na tabela `pedidos` do Supabase (API REST, sem biblioteca).
  function enviarPedido(storage, disco) {
    const botao = document.getElementById("gerar-pedido");
    botao.disabled = true;
    status("Enviando pedido…");
    const linha = {
      local: estado.local,
      [colunaBanco(storage)]: 1,
      [colunaBanco(disco)]: calcular(storage, disco).quantidade,
    };
    fetch(`${SUPABASE_URL}/rest/v1/pedidos`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(linha),
    })
      .then((r) => {
        if (!r.ok) throw new Error(r.status);
        status(`Pedido de ${linha.local} registrado.`);
      })
      .catch(() => status("Não foi possível registrar o pedido. Tente novamente.", true))
      .finally(() => { botao.disabled = false; });
  }

  function gerarPedido() {
    if (!SUPABASE_URL && typeof XLSX === "undefined") {
      status("Não foi possível carregar o gerador de planilhas.", true);
      return;
    }
    const storage = STORAGES.find((s) => s.id === estado.storageId);
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

    if (SUPABASE_URL) return enviarPedido(storage, disco);

    const pedido = { [COL_LOCAL]: estado.local };
    pedido[storage.nome] = 1;
    pedido[disco.nome] = calcular(storage, disco).quantidade;
    pedido[COL_DATA] = new Date().toLocaleString("pt-BR");

    estado.pedidos.push(pedido);
    salvar(CHAVE_PEDIDOS, estado.pedidos);
    baixarPlanilha();
    status(`Pedido de ${estado.local} adicionado. ${totalPedidos()}`);
  }

  function importarPlanilha(arquivo) {
    if (typeof XLSX === "undefined") {
      status("Não foi possível carregar o gerador de planilhas.", true);
      return;
    }
    arquivo.arrayBuffer().then((dados) => {
      const livro = XLSX.read(dados);
      const aba = livro.Sheets[livro.SheetNames[0]];
      const linhas = XLSX.utils.sheet_to_json(aba, { defval: "" }).filter((l) => l[COL_LOCAL] !== "");
      if (estado.pedidos.length && !confirm(
        `Substituir os ${estado.pedidos.length} pedidos deste navegador pelos ${linhas.length} da planilha?`
      )) return;
      estado.pedidos = linhas;
      salvar(CHAVE_PEDIDOS, estado.pedidos);
      status(`Planilha carregada. ${totalPedidos()} Os próximos pedidos serão acrescentados a ela.`);
    }).catch(() => status("Não foi possível ler a planilha escolhida.", true));
  }

  document.getElementById("gerar-pedido").addEventListener("click", gerarPedido);

  document.getElementById("importar").addEventListener("change", (ev) => {
    const arquivo = ev.target.files[0];
    if (arquivo) importarPlanilha(arquivo);
    ev.target.value = "";
  });

  document.getElementById("limpar-pedidos").addEventListener("click", () => {
    if (!estado.pedidos.length) return status("Não há pedidos para limpar.");
    if (!confirm(`Apagar os ${estado.pedidos.length} pedidos salvos neste navegador?`)) return;
    estado.pedidos = [];
    salvar(CHAVE_PEDIDOS, estado.pedidos);
    status("Pedidos apagados. O próximo pedido começa uma planilha nova.");
  });

  document.addEventListener("change", (ev) => {
    const t = ev.target;
    if (t.id === "local") {
      estado.local = t.value;
      return;
    }
    if (t.name === "storage") estado.storageId = t.value;
    else if (t.name === "disco") estado.discoId = t.value;
    else return;
    atualizar();
  });

  document.addEventListener("input", (ev) => {
    const t = ev.target;
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
  if (SUPABASE_URL) {
    // Com o banco de dados, o histórico local e a importação de planilha não são usados.
    document.querySelectorAll(".pedido-info, .pedido-acoes").forEach((el) => el.remove());
  } else if (estado.pedidos.length) {
    status(totalPedidos());
  }
})();

(function () {
  const CHAVE_PRECOS = "calculadora-storage:precos";

  const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const numero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
  const pct = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });

  const estado = {
    storageId: null,
    discoId: null,
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

  function cartao(item, grupo, selecionado, detalhe) {
    const el = document.createElement("label");
    el.className = "cartao" + (selecionado ? " ativo" : "");
    el.innerHTML = `
      <input type="radio" name="${grupo}" value="${item.id}" ${selecionado ? "checked" : ""} />
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

  document.addEventListener("change", (ev) => {
    const t = ev.target;
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

  atualizar();
})();

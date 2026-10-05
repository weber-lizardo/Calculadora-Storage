(function () {
  // Sessão do Supabase Auth: fica só nesta aba (sessionStorage).
  const CHAVE_SESSAO = "calculadora-storage:admin-sessao";

  const dataHora = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
  const ITENS = [...STORAGES, ...DISCOS, ...ACESSORIOS];

  const el = (id) => document.getElementById(id);
  let sessao = carregarSessao();
  let pedidos = [];
  const selecionados = new Set();

  function carregarSessao() {
    try {
      return JSON.parse(sessionStorage.getItem(CHAVE_SESSAO));
    } catch (e) {
      return null;
    }
  }

  function salvarSessao(s) {
    sessao = s;
    try {
      if (s) sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(s));
      else sessionStorage.removeItem(CHAVE_SESSAO);
    } catch (e) {
      // Sem armazenamento disponível: a sessão vale até recarregar a página.
    }
  }

  function status(texto, erro = false) {
    const s = el("admin-status");
    s.textContent = texto;
    s.classList.toggle("erro", erro);
  }

  // Coluna do item na tabela: o id com "_" no lugar de "-".
  function colunaBanco(item) {
    return item.id.replace(/-/g, "_");
  }

  function escapar(texto) {
    return String(texto).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  }

  // ---- Supabase (REST) ----

  async function autenticar(corpo, tipo) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=${tipo}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    salvarSessao({
      access_token: d.access_token,
      refresh_token: d.refresh_token,
      expira: Date.now() + d.expires_in * 1000,
    });
  }

  async function tokenValido() {
    if (sessao && Date.now() > sessao.expira - 60000) {
      try {
        await autenticar({ refresh_token: sessao.refresh_token }, "refresh_token");
      } catch (e) {
        sair();
        throw new Error("Sessão expirada. Entre novamente.");
      }
    }
    return sessao.access_token;
  }

  async function api(caminho, opcoes = {}) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${caminho}`, {
      ...opcoes,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${await tokenValido()}`,
        ...opcoes.headers,
      },
    });
    if (r.status === 401) {
      sair();
      throw new Error("Sessão expirada. Entre novamente.");
    }
    if (!r.ok) throw new Error(`Erro ${r.status} ao acessar o Supabase.`);
    return r.json();
  }

  // ---- Tela ----

  function mostrar() {
    el("form-login").hidden = !!sessao;
    el("area-pedidos").hidden = !sessao;
    if (sessao) carregarPedidos();
  }

  function sair() {
    salvarSessao(null);
    pedidos = [];
    selecionados.clear();
    mostrar();
  }

  async function carregarPedidos() {
    status("Carregando pedidos…");
    try {
      pedidos = await api("pedidos?select=*&order=criado_em.desc");
      for (const id of [...selecionados]) {
        if (!pedidos.some((p) => p.id === id)) selecionados.delete(id);
      }
      renderizar();
      status("");
    } catch (e) {
      status(e.message, true);
    }
  }

  function renderizar() {
    // Mostra só as colunas de itens que aparecem em algum pedido.
    const itens = ITENS.filter((i) => pedidos.some((p) => p[colunaBanco(i)] != null));

    el("tabela-cabecalho").innerHTML = `
      <tr>
        <th class="sel"><input type="checkbox" id="marcar-todos" aria-label="Selecionar todos os pedidos" /></th>
        <th>Data</th>
        <th>Local</th>
        ${itens.map((i) => `<th class="num-col">${escapar(i.nome)}</th>`).join("")}
      </tr>`;

    el("tabela-corpo").innerHTML = pedidos.length
      ? pedidos
          .map(
            (p) => `
      <tr class="${selecionados.has(p.id) ? "marcada" : ""}">
        <td class="sel"><input type="checkbox" class="marcar" data-id="${p.id}"
            ${selecionados.has(p.id) ? "checked" : ""} aria-label="Selecionar pedido de ${escapar(p.local)}" /></td>
        <td>${dataHora.format(new Date(p.criado_em))}</td>
        <td>${escapar(p.local)}</td>
        ${itens.map((i) => `<td class="num-col">${p[colunaBanco(i)] ?? ""}</td>`).join("")}
      </tr>`
          )
          .join("")
      : `<tr><td colspan="${3 + itens.length}" class="vazio">Nenhum pedido registrado.</td></tr>`;

    atualizarSelecao();
  }

  function atualizarSelecao() {
    const n = selecionados.size;
    el("contagem").textContent =
      `${pedidos.length} ${pedidos.length === 1 ? "pedido" : "pedidos"}` +
      (n ? ` · ${n} ${n === 1 ? "selecionado" : "selecionados"}` : "");
    el("excluir").disabled = n === 0;
    const todos = el("marcar-todos");
    if (todos) {
      todos.checked = pedidos.length > 0 && n === pedidos.length;
      todos.indeterminate = n > 0 && n < pedidos.length;
    }
  }

  async function excluir() {
    const ids = [...selecionados];
    if (!ids.length) return;
    const texto = ids.length === 1 ? "o pedido selecionado" : `os ${ids.length} pedidos selecionados`;
    if (!confirm(`Excluir ${texto}? Esta ação não pode ser desfeita.`)) return;

    el("excluir").disabled = true;
    status("Excluindo…");
    try {
      const apagados = await api(`pedidos?id=in.(${ids.join(",")})`, {
        method: "DELETE",
        headers: { Prefer: "return=representation" },
      });
      selecionados.clear();
      await carregarPedidos();
      if (apagados.length < ids.length) {
        status("Alguns pedidos não foram excluídos. Verifique se este usuário é administrador.", true);
      } else {
        status(`${apagados.length} ${apagados.length === 1 ? "pedido excluído" : "pedidos excluídos"}.`);
      }
    } catch (e) {
      status(e.message, true);
      atualizarSelecao();
    }
  }

  // ---- Eventos ----

  el("form-login").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const aviso = el("login-status");
    aviso.textContent = "";
    try {
      await autenticar({ email: el("email").value.trim(), password: el("senha").value }, "password");
      el("senha").value = "";
      mostrar();
    } catch (e) {
      aviso.textContent = "E-mail ou senha inválidos.";
    }
  });

  el("tabela-corpo").addEventListener("change", (ev) => {
    const t = ev.target;
    if (!t.classList.contains("marcar")) return;
    const id = Number(t.dataset.id);
    if (t.checked) selecionados.add(id);
    else selecionados.delete(id);
    t.closest("tr").classList.toggle("marcada", t.checked);
    atualizarSelecao();
  });

  el("tabela-cabecalho").addEventListener("change", (ev) => {
    if (ev.target.id !== "marcar-todos") return;
    selecionados.clear();
    if (ev.target.checked) pedidos.forEach((p) => selecionados.add(p.id));
    renderizar();
  });

  el("atualizar").addEventListener("click", carregarPedidos);
  el("excluir").addEventListener("click", excluir);
  el("sair").addEventListener("click", sair);

  mostrar();
})();

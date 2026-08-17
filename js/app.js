/* MOLBOX — interface. Liga o analisador de fórmulas, o motor de conversão
   e a tabela periódica. Sem dependências externas. */

(function () {
  "use strict";

  const CHAVE = "molbox.estado.v1";

  const estado = {
    formula: "NaOH",
    analise: null,
    volumeMolarId: "cntp",
    origem: "massa",
    entradaBruta: "4,00",
    elementoAberto: null,
  };

  const EXEMPLOS = ["NaOH", "H2SO4", "Ca(OH)2", "C6H12O6", "CuSO4·5H2O", "KMnO4", "Al2(SO4)3", "K3[Fe(CN)6]"];

  const $ = (s) => document.querySelector(s);
  const criar = (tag, props) => Object.assign(document.createElement(tag), props || {});

  /* ---------------- persistência ---------------- */

  function guardar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify({
        formula: estado.formula,
        volumeMolarId: estado.volumeMolarId,
        origem: estado.origem,
        entradaBruta: estado.entradaBruta,
      }));
    } catch (e) { /* modo privativo: seguir sem guardar */ }
  }

  function recuperar() {
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (!bruto) return;
      const d = JSON.parse(bruto);
      if (d.formula) estado.formula = d.formula;
      if (d.volumeMolarId) estado.volumeMolarId = d.volumeMolarId;
      if (d.origem && GRANDEZAS[d.origem]) estado.origem = d.origem;
      if (d.entradaBruta) estado.entradaBruta = d.entradaBruta;
    } catch (e) { /* dado corrompido: começar limpo */ }
  }

  function volumeMolarAtual() {
    return VOLUMES_MOLARES.find(v => v.id === estado.volumeMolarId) || VOLUMES_MOLARES[0];
  }

  /* ---------------- navegação ---------------- */

  function mostrarTela(id) {
    for (const s of document.querySelectorAll("main > section")) s.hidden = (s.id !== id);
    for (const b of document.querySelectorAll(".nav button")) {
      if (b.dataset.tela === id) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    }
    if (typeof window.scrollTo === "function") { try { window.scrollTo(0, 0); } catch (e) {} }
    if (id === "tela-ponte") desenharPonte();
  }

  /* ---------------- tela: massa molar ---------------- */

  function analisarAtual() {
    const entrada = $("#formula").value;
    const caixaErro = $("#erro-formula");
    caixaErro.innerHTML = "";
    $("#formula").setAttribute("aria-invalid", "false");

    try {
      estado.analise = analisar(entrada);
      estado.formula = entrada;
      guardar();
      desenharResultadoMassa();
    } catch (e) {
      estado.analise = null;
      $("#resultado-massa").innerHTML = "";
      $("#formula").setAttribute("aria-invalid", "true");

      const caixa = criar("div", { className: "erro" });
      caixa.appendChild(criar("strong", { textContent: e.message }));
      if (typeof e.posicao === "number") {
        const marcador = criar("span", { className: "marcador" });
        marcador.textContent = entrada + "\n" + " ".repeat(Math.max(0, e.posicao)) + "▲";
        caixa.appendChild(marcador);
      }
      caixaErro.appendChild(caixa);
    }
  }

  function desenharResultadoMassa() {
    const a = estado.analise;
    const alvo = $("#resultado-massa");
    alvo.innerHTML = "";

    // destaque
    const destaque = criar("div", { className: "cartao destaque" });
    destaque.innerHTML =
      `<p class="formula-vista">${formatarFormula(a.normalizada)}</p>` +
      `<p class="rotulo">MASSA MOLAR</p>` +
      `<p class="valor">${formatarNumero(a.massaMolar, 6)} <span class="unidade">g/mol</span></p>`;
    alvo.appendChild(destaque);

    // frase da ponte
    const frase = criar("div", { className: "cartao" });
    frase.innerHTML =
      `<p style="margin:0">Um mol de <span style="font-family:var(--mb-fonte-dado)">${formatarFormula(a.normalizada)}</span> ` +
      `pesa <strong>${formatarNumero(a.massaMolar, 5)} g</strong> e contém ` +
      `<strong>6,022×10²³</strong> ${a.totalAtomos === 1 ? "átomos" : "entidades"}, ` +
      `somando ${formatarNumero(a.totalAtomos, 3)} átomos por entidade.</p>` +
      (a.carga !== 0 ? `<p class="ajuda">Íon de carga ${a.carga > 0 ? "+" : ""}${a.carga}. A massa dos elétrons ganhos ou perdidos é desprezada, como é praxe.</p>` : "") +
      (a.massaIncerta ? `<p class="ajuda">Contém elemento sem composição isotópica estável: a massa usada é o número de massa do isótopo mais estável, não uma massa atômica padrão.</p>` : "");

    const botao = criar("button", { className: "botao", type: "button", textContent: "Levar para a ponte do mol" });
    botao.style.marginTop = "var(--mb-e3)";
    botao.addEventListener("click", () => mostrarTela("tela-ponte"));
    frase.appendChild(botao);
    alvo.appendChild(frase);

    // composição
    const comp = criar("div", { className: "cartao" });
    comp.innerHTML = `<h2 style="margin-top:0">De onde vem cada grama</h2>`;
    const tabela = criar("table");
    tabela.innerHTML =
      `<thead><tr><th>Elemento</th><th>Átomos</th><th>Contribui</th><th>% da massa</th></tr></thead>`;
    const corpo = criar("tbody");
    const maior = a.itens[0].percentual;

    for (const item of a.itens) {
      const tr = criar("tr");
      tr.innerHTML =
        `<td><span style="font-family:var(--mb-fonte-dado);font-weight:500">${item.simbolo}</span> ` +
        `<span style="color:var(--mb-texto-2);font-size:var(--mb-t-legenda)">${item.nome}</span></td>` +
        `<td class="num">${item.quantidade}</td>` +
        `<td class="num">${formatarNumero(item.contribuicao, 4)} g</td>` +
        `<td class="num">${formatarNumero(item.percentual, 3)}%` +
        `<div class="barra-trilho"><div class="barra" style="width:${(item.percentual / maior * 100).toFixed(1)}%"></div></div></td>`;
      corpo.appendChild(tr);
    }
    tabela.appendChild(corpo);
    comp.appendChild(tabela);
    comp.appendChild(criar("p", {
      className: "ajuda",
      textContent: "A porcentagem em massa é o que a balança enxerga. Repare que o elemento mais numeroso quase nunca é o que mais pesa."
    }));
    alvo.appendChild(comp);
  }

  /* ---------------- tela: ponte do mol ---------------- */

  function desenharPonte() {
    if (!estado.analise) {
      $("#caminho").innerHTML = `<p class="ajuda" style="margin:0">Escreva uma fórmula válida na tela de massa molar para atravessar a ponte.</p>`;
      $("#campos-ponte").innerHTML = "";
      $("#ponte-formula").textContent = "—";
      $("#ponte-massa").textContent = "";
      return;
    }

    const a = estado.analise;
    $("#ponte-formula").innerHTML = formatarFormula(a.normalizada);
    $("#ponte-massa").textContent = `M = ${formatarNumero(a.massaMolar, 5)} g/mol`;

    const valor = lerNumero(estado.entradaBruta);
    const vm = volumeMolarAtual();
    let resultado = null;
    if (isFinite(valor)) {
      resultado = converter({ origem: estado.origem, valor, massaMolar: a.massaMolar, volumeMolar: vm.valor });
    }

    const sig = contarSignificativos(estado.entradaBruta);
    const caixa = $("#campos-ponte");
    caixa.innerHTML = "";

    for (const chave of Object.keys(GRANDEZAS)) {
      const g = GRANDEZAS[chave];
      const div = criar("div", { className: "campo" + (chave === estado.origem ? " ativo" : "") });
      const idCampo = "campo-" + chave;

      const rotulo = criar("label", { htmlFor: idCampo, textContent: g.rotulo });
      const linha = criar("div", { className: "linha" });
      const input = criar("input", {
        type: "text", id: idCampo, inputMode: "decimal",
        autocomplete: "off", spellcheck: false,
      });
      input.setAttribute("aria-label", g.rotulo + " em " + g.unidade);

      if (chave === estado.origem) {
        input.value = estado.entradaBruta;
      } else if (resultado) {
        input.value = formatarNumero(resultado.valores[chave], sig);
      } else {
        input.value = "";
      }

      input.addEventListener("focus", () => {
        if (chave !== estado.origem) {
          estado.origem = chave;
          estado.entradaBruta = "";
          input.value = "";
          desenharPonte();
          const novo = document.getElementById(idCampo);
          if (novo) novo.focus();
        }
      });

      input.addEventListener("input", () => {
        estado.origem = chave;
        estado.entradaBruta = input.value;
        guardar();
        atualizarOutrosCampos(idCampo);
      });

      linha.appendChild(input);
      linha.appendChild(criar("span", { className: "sufixo", textContent: g.curta }));
      div.appendChild(rotulo);
      div.appendChild(linha);
      caixa.appendChild(div);
    }

    desenharCaminho(resultado);
  }

  /* Recalcula os campos sem redesenhar, para não roubar o cursor de quem digita. */
  function atualizarOutrosCampos(idAtivo) {
    const a = estado.analise;
    const valor = lerNumero(estado.entradaBruta);
    const vm = volumeMolarAtual();

    for (const chave of Object.keys(GRANDEZAS)) {
      const el = document.getElementById("campo-" + chave);
      if (!el) continue;
      el.parentElement.parentElement.classList.toggle("ativo", chave === estado.origem);
    }

    if (!isFinite(valor)) {
      for (const chave of Object.keys(GRANDEZAS)) {
        const el = document.getElementById("campo-" + chave);
        if (el && el.id !== idAtivo) el.value = "";
      }
      desenharCaminho(null);
      return;
    }

    const resultado = converter({ origem: estado.origem, valor, massaMolar: a.massaMolar, volumeMolar: vm.valor });
    const sig = contarSignificativos(estado.entradaBruta);
    for (const chave of Object.keys(GRANDEZAS)) {
      const el = document.getElementById("campo-" + chave);
      if (el && el.id !== idAtivo) el.value = formatarNumero(resultado.valores[chave], sig);
    }
    desenharCaminho(resultado);
  }

  function termo(texto, classe) {
    return `<span class="termo${classe ? " " + classe : ""}">${texto}</span>`;
  }

  function fracao(cima, baixo, cortarBaixo) {
    return `<span class="fracao"><span class="cima">${cima}</span>` +
           `<span class="baixo${cortarBaixo ? " corta" : ""}">${baixo}</span></span>`;
  }

  function desenharCaminho(resultado) {
    const alvo = $("#caminho");
    alvo.innerHTML = "";

    if (!resultado) {
      alvo.innerHTML = `<p class="ajuda" style="margin:0">Digite um valor em qualquer campo acima para ver o caminho da conversão.</p>`;
      return;
    }

    const sig = contarSignificativos(estado.entradaBruta);
    alvo.appendChild(criar("h2", { textContent: "O caminho da conta", style: "margin-top:0" }));

    for (const destino of Object.keys(GRANDEZAS)) {
      if (destino === estado.origem) continue;
      const passos = resultado.caminhos[destino];
      if (!passos.length) continue;

      const trilha = criar("div", { className: "trilha" });
      trilha.appendChild(criar("p", {
        className: "titulo",
        textContent: GRANDEZAS[estado.origem].rotulo.toUpperCase() + " → " + GRANDEZAS[destino].rotulo.toUpperCase()
      }));

      const conta = criar("div", { className: "conta" });
      let html = termo(`${formatarNumero(passos[0].valorEntrada, sig)} <span class="corta">${passos[0].unidadeEntrada}</span>`, "entrada");

      passos.forEach((p, indice) => {
        const cortaEmCima = p.unidadeNumero !== p.unidadeSaida;
        const cima = `${p.numero === 1 ? "1" : formatarNumero(p.numero, 4)} ${cortaEmCima ? `<span class="corta">${p.unidadeNumero}</span>` : p.unidadeNumero}`;
        const baixo = `${p.denominador === 1 ? "1" : formatarNumero(p.denominador, 4)} ${p.unidadeDenominador}`;
        html += `<span class="op">×</span>` + fracao(cima, baixo, true);
        const ehUltimo = indice === passos.length - 1;
        if (ehUltimo) {
          html += `<span class="op">=</span>` + termo(`${formatarNumero(p.valorSaida, sig)} ${p.unidadeSaida}`, "saida");
        }
      });

      conta.innerHTML = html;
      trilha.appendChild(conta);
      trilha.appendChild(criar("p", {
        className: "motivo",
        textContent: passos.map(p => p.motivo).join("; ") + "."
      }));
      alvo.appendChild(trilha);
    }

    const nota = criar("p", { className: "ajuda" });
    nota.innerHTML = `Resultados com ${sig} algarismo${sig > 1 ? "s" : ""} significativo${sig > 1 ? "s" : ""}, herdado${sig > 1 ? "s" : ""} do valor que você digitou. ` +
      `O volume vale apenas se a substância for um gás na condição escolhida.`;
    alvo.appendChild(nota);
  }

  /* ---------------- tela: tabela periódica ---------------- */

  const CORES_FAMILIA = {
    alcalino: "#C43C0E", alcalinoterroso: "#B8860B", transicao: "#0B5E8C",
    postransicao: "#4A6FA5", semimetal: "#7A5AA8", naometal: "#1B7A3A",
    halogenio: "#14776E", nobre: "#164194", lantanideo: "#A03A6B", actinideo: "#8A5200",
  };

  function montarPeriodica() {
    const grade = $("#periodica");
    grade.innerHTML = "";

    for (const e of ELEMENTOS) {
      const [z, simbolo, nome, massa, col, lin, familia] = e;
      const b = criar("button", { type: "button", className: "celula f-" + familia });
      b.style.setProperty("--col", col);
      b.style.setProperty("--lin", lin);
      b.dataset.simbolo = simbolo;
      b.dataset.busca = (simbolo + " " + nome + " " + z).toLowerCase();
      b.setAttribute("aria-label", `${nome}, símbolo ${simbolo}, número atômico ${z}`);
      b.setAttribute("aria-pressed", "false");
      b.innerHTML = `<span class="z">${z}</span><span class="sim">${simbolo}</span>`;
      b.addEventListener("click", () => abrirElemento(simbolo));
      grade.appendChild(b);
    }

    const legenda = $("#legenda");
    legenda.innerHTML = "";
    for (const chave in CORES_FAMILIA) {
      const s = criar("span");
      s.innerHTML = `<i class="ponto" style="background:${CORES_FAMILIA[chave]}"></i>${NOME_FAMILIA[chave]}`;
      legenda.appendChild(s);
    }
  }

  function abrirElemento(simbolo) {
    estado.elementoAberto = simbolo;
    for (const b of document.querySelectorAll(".celula")) {
      b.setAttribute("aria-pressed", b.dataset.simbolo === simbolo ? "true" : "false");
    }

    const e = POR_SIMBOLO[simbolo];
    const alvo = $("#ficha-elemento");
    alvo.innerHTML = "";

    const cartao = criar("div", { className: "cartao ficha" });
    cartao.innerHTML =
      `<div class="cabeca"><span class="simbolo">${e.simbolo}</span>` +
      `<div><strong>${e.nome}</strong><br>` +
      `<span style="color:var(--mb-texto-2);font-size:var(--mb-t-legenda)">${NOME_FAMILIA[e.familia]}</span></div></div>` +
      `<dl>` +
      `<dt>Número atômico</dt><dd>${e.z}</dd>` +
      `<dt>Massa atômica</dt><dd>${formatarNumero(e.massa, 6)} u${e.incerta ? " *" : ""}</dd>` +
      `<dt>Um mol pesa</dt><dd>${formatarNumero(e.massa, 6)} g</dd>` +
      `<dt>Um mol contém</dt><dd>6,022×10²³ átomos</dd>` +
      `</dl>` +
      (e.incerta ? `<p class="ajuda">* Sem composição isotópica terrestre estável: o valor é o número de massa do isótopo mais estável.</p>` : "");

    const acao = criar("button", { className: "botao secundario", type: "button", textContent: `Somar ${e.simbolo} à fórmula` });
    acao.style.marginTop = "var(--mb-e3)";
    acao.addEventListener("click", () => {
      const campo = $("#formula");
      campo.value = campo.value + e.simbolo;
      analisarAtual();
      mostrarTela("tela-massa");
      campo.focus();
    });
    cartao.appendChild(acao);
    alvo.appendChild(cartao);
    if (cartao.scrollIntoView) cartao.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function filtrarTabela(texto) {
    const alvo = texto.trim().toLowerCase();
    for (const b of document.querySelectorAll(".celula")) {
      b.classList.toggle("apagada", alvo !== "" && !b.dataset.busca.includes(alvo));
    }
  }

  /* ---------------- montagem ---------------- */

  function montarExemplos() {
    const caixa = $("#exemplos");
    for (const f of EXEMPLOS) {
      const b = criar("button", { type: "button", className: "chip" });
      b.innerHTML = formatarFormula(f);
      b.addEventListener("click", () => {
        $("#formula").value = f;
        analisarAtual();
      });
      caixa.appendChild(b);
    }
  }

  function montarSeletorVolume() {
    const sel = $("#volume-molar");
    for (const v of VOLUMES_MOLARES) {
      sel.appendChild(criar("option", { value: v.id, textContent: `${v.rotulo} — ${formatarNumero(v.valor, 4)} L/mol` }));
    }
    sel.value = estado.volumeMolarId;
    const explicar = () => {
      const v = volumeMolarAtual();
      $("#ajuda-volume").textContent = `Volume molar de ${formatarNumero(v.valor, 4)} L/mol — ${v.detalhe}.`;
    };
    explicar();
    sel.addEventListener("change", () => {
      estado.volumeMolarId = sel.value;
      guardar();
      explicar();
      desenharPonte();
    });
  }

  function iniciar() {
    recuperar();
    $("#formula").value = estado.formula;
    montarExemplos();
    montarSeletorVolume();
    montarPeriodica();
    analisarAtual();

    $("#formula").addEventListener("input", analisarAtual);
    $("#busca").addEventListener("input", (ev) => filtrarTabela(ev.target.value));
    for (const b of document.querySelectorAll(".nav button")) {
      b.addEventListener("click", () => mostrarTela(b.dataset.tela));
    }

    const destino = { "#massa-molar": "tela-massa", "#converter": "tela-ponte", "#tabela": "tela-tabela" }[location.hash];
    if (destino) mostrarTela(destino);

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
    }
  }

  document.addEventListener("DOMContentLoaded", iniciar);
})();

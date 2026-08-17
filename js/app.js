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
    telaAtual: "tela-massa",
    equacao: "CH4 + O2 -> CO2 + H2O",
    balanceada: null,
    esteq: { unidade: "g", quantidades: {}, purezas: {}, produtoRendimento: 0, massaObtida: "" },
    degrau: 1,
    exercicio: null,
    tipoAnterior: null,
    usouDica: false,
    respondido: false,
    sessao: { certas: 0, total: 0, xp: 0 },
  };

  let progresso = null;

  const EXEMPLOS = ["NaOH", "H2SO4", "Ca(OH)2", "C6H12O6", "CuSO4·5H2O", "KMnO4", "Al2(SO4)3", "K3[Fe(CN)6]"];

  const $ = (s) => document.querySelector(s);
  const criar = (tag, props) => Object.assign(document.createElement(tag), props || {});

  /* ---------------- persistência ---------------- */

  function guardar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify({
        formula: estado.formula,
        volumeMolarId: estado.volumeMolarId,
        equacao: estado.equacao,
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
      if (d.equacao) estado.equacao = d.equacao;
      if (d.volumeMolarId) estado.volumeMolarId = d.volumeMolarId;
      if (d.origem && GRANDEZAS[d.origem]) estado.origem = d.origem;
      if (d.entradaBruta) estado.entradaBruta = d.entradaBruta;
    } catch (e) { /* dado corrompido: começar limpo */ }
  }

  function volumeMolarAtual() {
    return VOLUMES_MOLARES.find(v => v.id === estado.volumeMolarId) || VOLUMES_MOLARES[0];
  }

  /* ---------------- navegação ---------------- */

  const TITULOS = {
    "tela-massa": "Massa molar",
    "tela-ponte": "Ponte do mol",
    "tela-balancear": "Balancear",
    "tela-esteq": "Estequiometria",
    "tela-treino": "Treino",
    "tela-progresso": "Progresso",
    "tela-tabela": "Tabela periódica",
  };

  function estreita() {
    if (typeof window.matchMedia === "function") return window.matchMedia("(max-width: 899px)").matches;
    return window.innerWidth < 900; // reserva para WebViews antigas
  }

  function abrirMenu() {
    $("#sidebar").classList.add("aberta");
    $("#cortina").hidden = false;
    $("#menuBtn").setAttribute("aria-expanded", "true");
  }

  function fecharMenu() {
    $("#sidebar").classList.remove("aberta");
    $("#cortina").hidden = true;
    $("#menuBtn").setAttribute("aria-expanded", "false");
  }

  function mostrarTela(id) {
    estado.telaAtual = id;
    for (const s of document.querySelectorAll("main > section")) s.hidden = (s.id !== id);
    for (const b of document.querySelectorAll(".menu .item")) {
      if (b.dataset.tela === id) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    }
    $("#tituloPagina").textContent = TITULOS[id] || "MOLBOX";
    if (typeof window.scrollTo === "function") { try { window.scrollTo(0, 0); } catch (e) {} }
    if (estreita()) fecharMenu();

    if (id === "tela-ponte") desenharPonte();
    if (id === "tela-esteq") desenharEstequiometria();
    if (id === "tela-treino") entrarNoTreino();
    if (id === "tela-progresso") desenharProgresso();
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



  /* ---------------- tela: balancear ---------------- */

  const EXEMPLOS_EQ = [
    "CH4 + O2 -> CO2 + H2O",
    "C3H8 + O2 -> CO2 + H2O",
    "Fe + O2 -> Fe2O3",
    "Al + HCl -> AlCl3 + H2",
    "KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2",
    "MnO4- + Fe2+ + H+ -> Mn2+ + Fe3+ + H2O",
  ];

  function montarExemplosEquacao() {
    const caixa = $("#exemplos-eq");
    for (const eq of EXEMPLOS_EQ) {
      const b = criar("button", { type: "button", className: "chip", textContent: eq });
      b.addEventListener("click", () => {
        $("#equacao").value = eq;
        balancearAtual();
      });
      caixa.appendChild(b);
    }
  }

  function balancearAtual() {
    const entrada = $("#equacao").value;
    $("#erro-equacao").innerHTML = "";
    $("#equacao").setAttribute("aria-invalid", "false");

    try {
      estado.balanceada = balancear(entrada);
      estado.equacao = entrada;
      estado.esteq.quantidades = {};
      estado.esteq.purezas = {};
      estado.esteq.produtoRendimento = 0;
      estado.esteq.massaObtida = "";
      guardar();
      desenharEquacao();
    } catch (e) {
      estado.balanceada = null;
      $("#resultado-equacao").innerHTML = "";
      $("#equacao").setAttribute("aria-invalid", "true");
      const caixa = criar("div", { className: "erro" });
      caixa.appendChild(criar("strong", { textContent: e.message }));
      $("#erro-equacao").appendChild(caixa);
    }
  }

  function desenharEquacao() {
    const b = estado.balanceada;
    const alvo = $("#resultado-equacao");
    alvo.innerHTML = "";

    const cartao = criar("div", { className: "cartao" });
    const vista = criar("div", { className: "equacao-vista" });
    vista.innerHTML = escreverEquacaoHTML(b);
    cartao.appendChild(vista);
    cartao.appendChild(criar("p", {
      className: "ajuda",
      style: "text-align:center;margin:0",
      textContent: "Coeficientes em laranja. Os que valem 1 ficam subentendidos, como se escreve à mão.",
    }));
    alvo.appendChild(cartao);

    const prova = criar("div", { className: "cartao" });
    prova.innerHTML = "<h2 style=\"margin-top:0\">A prova: átomos contados dos dois lados</h2>";
    const tabela = criar("table", { className: "conferencia" });
    tabela.innerHTML = "<thead><tr><th>Elemento</th><th>Antes</th><th>Depois</th></tr></thead>";
    const corpo = criar("tbody");
    for (const c of b.conferencia) {
      const tr = criar("tr");
      const rotulo = c.elemento === "carga" ? "carga elétrica" : c.elemento;
      tr.innerHTML = `<td>${rotulo}</td><td class="num ${c.fecha ? "fecha" : "falha"}">${c.antes}</td>` +
                     `<td class="num ${c.fecha ? "fecha" : "falha"}">${c.depois}</td>`;
      corpo.appendChild(tr);
    }
    tabela.appendChild(corpo);
    prova.appendChild(tabela);
    prova.appendChild(criar("p", {
      className: "ajuda",
      textContent: b.usaCarga
        ? "Numa equação iônica a carga também precisa fechar, e ela entra no sistema como se fosse mais um elemento."
        : "É esta a conta que o balanceamento tem de satisfazer: nenhum átomo aparece nem desaparece.",
    }));
    alvo.appendChild(prova);

    const acao = criar("div", { className: "cartao" });
    acao.innerHTML = "<p style=\"margin:0 0 var(--mb-e3)\">Com a equação fechada, dá para descobrir quanto se forma a partir do que você tem na bancada.</p>";
    const botao = criar("button", { className: "botao", type: "button", textContent: "Levar para a estequiometria" });
    botao.addEventListener("click", () => mostrarTela("tela-esteq"));
    acao.appendChild(botao);
    alvo.appendChild(acao);
  }

  /* ---------------- tela: estequiometria ---------------- */

  function desenharEstequiometria() {
    const alvo = $("#painel-esteq");
    alvo.innerHTML = "";
    const b = estado.balanceada;

    if (!b) {
      alvo.innerHTML = `<div class="cartao"><p class="ajuda" style="margin:0">Balanceie uma equação primeiro. A estequiometria só faz sentido depois que a proporção entre as substâncias está definida.</p></div>`;
      return;
    }

    const cabeca = criar("div", { className: "cartao" });
    const vista = criar("div", { className: "equacao-vista", style: "font-size:var(--mb-t-titulo-3);padding:var(--mb-e2) 0" });
    vista.innerHTML = escreverEquacaoHTML(b);
    cabeca.appendChild(vista);
    alvo.appendChild(cabeca);

    const entrada = criar("div", { className: "cartao" });
    entrada.innerHTML = "<h2 style=\"margin-top:0\">O que você tem</h2>";

    const seletorUnidade = criar("select", { id: "unidade-esteq" });
    seletorUnidade.appendChild(criar("option", { value: "g", textContent: "Informar em gramas" }));
    seletorUnidade.appendChild(criar("option", { value: "mol", textContent: "Informar em mols" }));
    seletorUnidade.value = estado.esteq.unidade;
    seletorUnidade.addEventListener("change", () => {
      estado.esteq.unidade = seletorUnidade.value;
      desenharEstequiometria();
    });
    const rotuloUnidade = criar("label", { htmlFor: "unidade-esteq", textContent: "Unidade das quantidades" });
    entrada.appendChild(rotuloUnidade);
    entrada.appendChild(seletorUnidade);
    entrada.appendChild(criar("div", { style: "height:var(--mb-e4)" }));

    b.reagentes.forEach((r, i) => {
      const bloco = criar("div", { className: "reagente-campo" });

      const nome = criar("div");
      nome.innerHTML = `<span class="nome-r">${r.vista}</span><br>` +
        `<span class="ajuda">coef. ${r.coeficiente} · M = ${formatarNumero(r.analise.massaMolar, 5)} g/mol</span>`;
      bloco.appendChild(nome);

      const caixaQtd = criar("div");
      const idQtd = "qtd-" + i;
      caixaQtd.appendChild(criar("label", { htmlFor: idQtd, textContent: estado.esteq.unidade === "g" ? "Massa (g)" : "Quantidade (mol)" }));
      const campoQtd = criar("input", { type: "text", id: idQtd, inputMode: "decimal", autocomplete: "off", placeholder: "opcional" });
      campoQtd.value = estado.esteq.quantidades[i] || "";
      campoQtd.addEventListener("input", () => {
        estado.esteq.quantidades[i] = campoQtd.value;
        recalcularEstequiometria();
      });
      caixaQtd.appendChild(campoQtd);
      bloco.appendChild(caixaQtd);

      const caixaPureza = criar("div");
      if (estado.esteq.unidade === "g") {
        const idPur = "pur-" + i;
        caixaPureza.appendChild(criar("label", { htmlFor: idPur, textContent: "Pureza (%)" }));
        const campoPur = criar("input", { type: "text", id: idPur, inputMode: "decimal", autocomplete: "off", placeholder: "100" });
        campoPur.value = estado.esteq.purezas[i] || "";
        campoPur.addEventListener("input", () => {
          estado.esteq.purezas[i] = campoPur.value;
          recalcularEstequiometria();
        });
        caixaPureza.appendChild(campoPur);
      }
      bloco.appendChild(caixaPureza);
      entrada.appendChild(bloco);
    });

    entrada.appendChild(criar("p", {
      className: "ajuda",
      textContent: "Deixe em branco o reagente que estiver em excesso conhecido ou que não interessa controlar. Basta um valor para o cálculo sair.",
    }));
    alvo.appendChild(entrada);

    alvo.appendChild(criar("div", { id: "saida-esteq" }));
    recalcularEstequiometria();
  }

  function recalcularEstequiometria() {
    const b = estado.balanceada;
    const saida = $("#saida-esteq");
    if (!saida) return;
    saida.innerHTML = "";

    const mols = {};
    let algum = false;
    b.reagentes.forEach((r, i) => {
      const valor = lerNumero(estado.esteq.quantidades[i]);
      if (!isFinite(valor) || valor <= 0) { mols[i] = null; return; }
      const pureza = lerNumero(estado.esteq.purezas[i]);
      mols[i] = entradaParaMols(valor, estado.esteq.unidade, r.analise.massaMolar, isFinite(pureza) ? pureza : 100);
      algum = true;
    });

    if (!algum) {
      saida.innerHTML = `<div class="cartao"><p class="ajuda" style="margin:0">Informe a quantidade de pelo menos um reagente para ver o resultado.</p></div>`;
      return;
    }

    const r = calcularEstequiometria(b, mols);
    if (r.situacao !== "ok") {
      saida.innerHTML = `<div class="cartao"><p class="ajuda" style="margin:0">${r.mensagem}</p></div>`;
      return;
    }

    const conhecidos = r.razoes.length;

    const resumo = criar("div", { className: "cartao" });
    if (conhecidos > 1) {
      resumo.innerHTML =
        `<h2 style="margin-top:0">Quem manda na reação</h2>` +
        (r.proporcaoExata
          ? `<p style="margin:0">Os reagentes estão na proporção exata da equação: nenhum sobra. Na prática de bancada isso quase nunca acontece por acaso.</p>`
          : `<p style="margin:0">O reagente limitante é <strong>${r.limitante.formula}</strong>. Ele acaba primeiro, e por isso define tudo que se forma.</p>`);
      const tabelaRazao = criar("table");
      tabelaRazao.innerHTML = `<thead><tr><th>Reagente</th><th>mols</th><th>÷ coef.</th><th>razão</th></tr></thead>`;
      const corpo = criar("tbody");
      for (const item of r.razoes) {
        const reg = b.reagentes[item.indice];
        const tr = criar("tr");
        if (item.indice === r.limitanteIndice) tr.className = "limitante";
        tr.innerHTML = `<td>${reg.vista}${item.indice === r.limitanteIndice ? '<span class="selo-limitante">LIMITANTE</span>' : ""}</td>` +
          `<td class="num">${formatarNumero(item.mols, 4)}</td><td class="num">${item.coeficiente}</td>` +
          `<td class="num">${formatarNumero(item.razao, 4)}</td>`;
        corpo.appendChild(tr);
      }
      tabelaRazao.appendChild(corpo);
      resumo.appendChild(tabelaRazao);
      resumo.appendChild(criar("p", {
        className: "ajuda",
        textContent: "Repare que quem manda é a menor razão, não a menor massa nem o menor número de mols. Um reagente que a equação consome de três em três acaba antes de outro que ela consome de um em um.",
      }));
    } else {
      resumo.innerHTML = `<h2 style="margin-top:0">Com um reagente informado</h2>` +
        `<p style="margin:0">Só <strong>${b.reagentes[r.razoes[0].indice].formula}</strong> foi informado, então a conta supõe que todos os outros estão em excesso.</p>`;
    }
    saida.appendChild(resumo);

    const tabela = criar("div", { className: "cartao" });
    tabela.innerHTML = `<h2 style="margin-top:0">O que acontece com cada substância</h2>`;
    const t = criar("table");
    t.innerHTML = `<thead><tr><th>Substância</th><th>mol</th><th>massa</th><th>situação</th></tr></thead>`;
    const corpo = criar("tbody");

    for (const l of r.linhas) {
      const tr = criar("tr");
      if (l.limitante) tr.className = "limitante";
      if (l.papel === "reagente") {
        const situacao = l.emFalta ? "suposto em excesso"
          : l.limitante ? "consumido por inteiro"
          : `sobram ${formatarNumero(l.restanteMols, 3)} mol (${formatarNumero(l.restanteMassa, 3)} g)`;
        tr.innerHTML = `<td>${l.especie.vista}${l.limitante ? '<span class="selo-limitante">LIMITANTE</span>' : ""}</td>` +
          `<td class="num">−${formatarNumero(l.consumidoMols, 4)}</td>` +
          `<td class="num">−${formatarNumero(l.consumidoMassa, 4)} g</td>` +
          `<td class="ajuda" style="text-align:left">${situacao}</td>`;
      } else {
        tr.innerHTML = `<td>${l.especie.vista}</td>` +
          `<td class="num">+${formatarNumero(l.formadoMols, 4)}</td>` +
          `<td class="num">+${formatarNumero(l.formadoMassa, 4)} g</td>` +
          `<td class="ajuda" style="text-align:left">formado</td>`;
      }
      corpo.appendChild(tr);
    }
    t.appendChild(corpo);
    tabela.appendChild(t);
    tabela.appendChild(criar("p", {
      className: "ajuda",
      textContent: `A reação acontece ${formatarNumero(r.extensao, 4)} vez${r.extensao === 1 ? "" : "es"} — é esse número, multiplicado pelo coeficiente de cada substância, que gera a coluna de mols.`,
    }));
    saida.appendChild(tabela);

    // rendimento
    const produtos = r.linhas.filter(l => l.papel === "produto");
    const rendCartao = criar("div", { className: "cartao" });
    rendCartao.innerHTML = `<h2 style="margin-top:0">Rendimento</h2>` +
      `<p class="ajuda">A massa acima é a teórica, a que a equação promete. Pese o que realmente saiu da bancada e compare.</p>`;

    const seletorProduto = criar("select", { id: "produto-rend" });
    produtos.forEach((pr, i) => {
      seletorProduto.appendChild(criar("option", { value: String(i), textContent: pr.especie.formula }));
    });
    seletorProduto.value = String(Math.min(estado.esteq.produtoRendimento, produtos.length - 1));
    seletorProduto.addEventListener("change", () => {
      estado.esteq.produtoRendimento = Number(seletorProduto.value);
      recalcularEstequiometria();
    });
    rendCartao.appendChild(criar("label", { htmlFor: "produto-rend", textContent: "Produto isolado" }));
    rendCartao.appendChild(seletorProduto);

    const escolhido = produtos[Math.min(estado.esteq.produtoRendimento, produtos.length - 1)];
    rendCartao.appendChild(criar("div", { style: "height:var(--mb-e3)" }));
    rendCartao.appendChild(criar("label", { htmlFor: "massa-obtida", textContent: "Massa obtida (g)" }));
    const campoObtida = criar("input", { type: "text", id: "massa-obtida", inputMode: "decimal", autocomplete: "off", placeholder: formatarNumero(escolhido.formadoMassa, 3) });
    campoObtida.value = estado.esteq.massaObtida;
    campoObtida.addEventListener("input", () => {
      estado.esteq.massaObtida = campoObtida.value;
      recalcularEstequiometria();
      const nova = document.getElementById("massa-obtida");
      if (nova) { nova.focus(); nova.setSelectionRange(nova.value.length, nova.value.length); }
    });
    rendCartao.appendChild(campoObtida);

    const obtida = lerNumero(estado.esteq.massaObtida);
    if (isFinite(obtida) && obtida > 0) {
      const rend = calcularRendimento(obtida, escolhido.formadoMassa);
      const caixa = criar("div", { className: "veredito " + (rend.percentual > 100 ? "diagnosticado" : "certo"), style: "margin-top:var(--mb-e3)" });
      caixa.innerHTML = `<span class="selo">RENDIMENTO</span>` +
        `<p><strong>${formatarNumero(rend.percentual, 3)}%</strong> — ${formatarNumero(obtida, 3)} g obtidos de ${formatarNumero(escolhido.formadoMassa, 3)} g teóricos.</p>`;
      if (rend.observacao) caixa.appendChild(criar("p", { className: "ajuda", style: "margin-top:6px", textContent: rend.observacao }));
      rendCartao.appendChild(caixa);
    }

    saida.appendChild(rendCartao);
  }

  /* ---------------- tela: treino ---------------- */

  function entrarNoTreino() {
    progresso = registrarDia(progresso);
    salvarProgresso(progresso);
    if (estado.degrau > progresso.desbloqueado) estado.degrau = progresso.desbloqueado;
    desenharDegraus();
    desenharPlacar();
    if (!estado.exercicio) proximoExercicio();
    else desenharExercicio();
    atualizarResumoLateral();
  }

  function desenharDegraus() {
    const caixa = $("#degraus");
    caixa.innerHTML = "";

    for (const d of DEGRAUS) {
      const liberado = d.n <= progresso.desbloqueado;
      const acertos = progresso.porDegrau[d.n].acertos;
      const b = criar("button", { type: "button", className: "degrau" });
      b.setAttribute("aria-pressed", String(d.n === estado.degrau));
      if (!liberado) b.disabled = true;

      const faltam = Math.max(0, ACERTOS_PARA_LIBERAR - progresso.porDegrau[d.n - 1>0 ? d.n - 1 : 1].acertos);
      const sub = liberado
        ? `${acertos} acerto${acertos === 1 ? "" : "s"} · ${d.resumo}`
        : `Faltam ${faltam} acerto${faltam === 1 ? "" : "s"} no degrau ${d.n - 1}`;

      b.innerHTML = `<span class="cabeca">${liberado ? "" : "🔒 "}Degrau ${d.n} — ${d.nome}</span><span class="sub">${sub}</span>`;
      b.addEventListener("click", () => {
        if (!liberado) return;
        estado.degrau = d.n;
        estado.tipoAnterior = null;
        desenharDegraus();
        proximoExercicio();
      });
      caixa.appendChild(b);
    }
  }

  function desenharPlacar() {
    const s = estado.sessao;
    const proporcao = s.total ? Math.round((s.certas / s.total) * 100) : 0;
    $("#placar").innerHTML =
      `<div><strong>${s.certas}/${s.total}</strong>nesta sessão${s.total ? " · " + proporcao + "%" : ""}</div>` +
      `<div><strong>${progresso.sequencia}</strong>acertos seguidos</div>` +
      `<div><strong>${progresso.ofensiva}</strong>dia${progresso.ofensiva === 1 ? "" : "s"} seguidos</div>` +
      `<div><strong>${progresso.xp}</strong>XP total</div>`;
  }

  function proximoExercicio() {
    estado.exercicio = gerarExercicio(estado.degrau, { volumeMolar: volumeMolarAtual().valor }, estado.tipoAnterior);
    estado.tipoAnterior = estado.exercicio.tipo;
    estado.usouDica = false;
    estado.respondido = false;
    desenharExercicio();
  }

  function desenharExercicio() {
    const q = estado.exercicio;
    const alvo = $("#exercicio");
    alvo.innerHTML = "";

    alvo.appendChild(criar("p", { className: "ajuda", textContent: NOME_TIPO[q.tipo], style: "margin:0 0 var(--mb-e2)" }));

    const enunciado = criar("p", { className: "enunciado" });
    enunciado.innerHTML = q.enunciado;
    alvo.appendChild(enunciado);

    if (q.contexto) alvo.appendChild(criar("p", { className: "contexto", textContent: q.contexto }));

    const linha = criar("div", { className: "resposta-linha" });
    const campo = criar("input", {
      type: "text", id: "resposta", inputMode: "decimal",
      autocomplete: "off", spellcheck: false, placeholder: "sua resposta",
    });
    campo.setAttribute("aria-label", "Sua resposta em " + q.unidade);
    if (estado.respondido) campo.readOnly = true;
    linha.appendChild(campo);
    linha.appendChild(criar("span", { className: "unidade", textContent: q.unidade }));
    alvo.appendChild(linha);

    const acoes = criar("div", { className: "acoes" });

    if (!estado.respondido) {
      const verificar = criar("button", { className: "botao", type: "button", textContent: "Verificar" });
      verificar.addEventListener("click", () => responder(campo.value));
      acoes.appendChild(verificar);

      const dica = criar("button", { className: "botao secundario", type: "button", textContent: "Ver dica" });
      dica.addEventListener("click", () => {
        estado.usouDica = true;
        dica.disabled = true;
        const caixa = criar("div", { className: "dica-caixa", textContent: q.dica });
        alvo.insertBefore(caixa, acoes.nextSibling);
      });
      acoes.appendChild(dica);

      const pular = criar("button", { className: "botao secundario", type: "button", textContent: "Trocar exercício" });
      pular.addEventListener("click", proximoExercicio);
      acoes.appendChild(pular);

      campo.addEventListener("keydown", (ev) => { if (ev.key === "Enter") responder(campo.value); });
    } else {
      const seguinte = criar("button", { className: "botao", type: "button", textContent: "Próximo exercício" });
      seguinte.addEventListener("click", proximoExercicio);
      acoes.appendChild(seguinte);
    }

    alvo.appendChild(acoes);
    if (!estado.respondido) campo.focus();
  }

  function responder(bruto) {
    const q = estado.exercicio;
    const veredito = corrigir(q, bruto);

    if (veredito.situacao === "invalido") {
      const aviso = criar("div", { className: "veredito errado" });
      aviso.innerHTML = `<span class="selo">NÃO ENTENDI O NÚMERO</span><p>${veredito.mensagem}</p>`;
      const antigo = $("#exercicio .veredito");
      if (antigo) antigo.remove();
      $("#exercicio").appendChild(aviso);
      return;
    }

    estado.respondido = true;
    const acertou = veredito.situacao === "certo";
    estado.sessao.total += 1;
    if (acertou) estado.sessao.certas += 1;

    const efeito = registrarResposta(progresso, q, acertou, estado.usouDica);
    estado.sessao.xp += efeito.ganho;

    desenharExercicio();
    document.getElementById("resposta").value = bruto;

    const caixa = criar("div", { className: "veredito " + veredito.situacao });
    const selo = acertou ? "CERTO"
      : veredito.erroReconhecido ? "SEI O QUE ACONTECEU" : "NÃO É ESSE VALOR";
    caixa.innerHTML = `<span class="selo">${selo}</span><p>${veredito.mensagem}</p>`;

    if (acertou && efeito.ganho) {
      caixa.appendChild(criar("span", { className: "ganho", textContent: `+${efeito.ganho} XP` }));
    }
    if (efeito.subiuDegrau) {
      caixa.appendChild(criar("p", {
        style: "margin-top:var(--mb-e2);font-weight:500",
        textContent: `Degrau ${efeito.subiuDegrau} liberado: ${DEGRAUS[efeito.subiuDegrau - 1].nome}.`
      }));
    }
    for (const m of efeito.medalhasNovas) {
      caixa.appendChild(criar("p", { style: "margin-top:4px", textContent: `Medalha conquistada: ${m.nome}.` }));
    }

    const alvo = $("#exercicio");
    alvo.insertBefore(caixa, alvo.querySelector(".acoes"));

    const resolucao = criar("div", { className: "resolucao" });
    resolucao.innerHTML = `<strong style="font-family:var(--mb-fonte-texto)">Resposta: ${formatarNumero(q.resposta, q.sig)} ${q.unidade}</strong><br>${q.resolucao}`;
    alvo.insertBefore(resolucao, alvo.querySelector(".acoes"));

    desenharDegraus();
    desenharPlacar();
    atualizarResumoLateral();
  }

  /* ---------------- tela: progresso ---------------- */

  function desenharProgresso() {
    const alvo = $("#painel-progresso");
    alvo.innerHTML = "";
    const nv = xpParaProximoNivel(progresso.xp);
    const taxa = progresso.totalTentativas
      ? Math.round((progresso.totalAcertos / progresso.totalTentativas) * 100) : 0;

    const cartaoNivel = criar("div", { className: "cartao" });
    cartaoNivel.innerHTML =
      `<div class="nivel-caixa"><span class="nivel-numero">Nível ${nv.nivel}</span>` +
      `<span class="ajuda" style="margin:0">${progresso.xp} XP acumulados</span></div>` +
      `<div class="xp-trilho"><div class="xp-barra" style="width:${Math.round(nv.atual / nv.necessario * 100)}%"></div></div>` +
      `<p class="ajuda">Faltam ${nv.necessario - nv.atual} XP para o nível ${nv.nivel + 1}.</p>`;
    alvo.appendChild(cartaoNivel);

    const numeros = criar("div", { className: "cartao" });
    numeros.innerHTML =
      `<div class="numeros">` +
      `<div><p class="n">${progresso.totalAcertos}</p><p class="r">acertos</p></div>` +
      `<div><p class="n">${taxa}%</p><p class="r">aproveitamento</p></div>` +
      `<div><p class="n">${progresso.melhorSequencia}</p><p class="r">melhor sequência</p></div>` +
      `<div><p class="n">${progresso.ofensiva}</p><p class="r">dias seguidos</p></div>` +
      `</div>`;
    alvo.appendChild(numeros);

    const escada = criar("div", { className: "cartao" });
    escada.innerHTML = `<h2 style="margin-top:0">A escada</h2>`;
    for (const d of DEGRAUS) {
      const liberado = d.n <= progresso.desbloqueado;
      const g = progresso.porDegrau[d.n];
      const total = g.acertos + g.erros;
      const linha = criar("div", { style: "margin-bottom:var(--mb-e3)" });
      linha.innerHTML =
        `<p style="margin:0 0 4px"><strong>Degrau ${d.n} — ${d.nome}</strong>` +
        `${liberado ? "" : ' <span class="ajuda">(bloqueado)</span>'}</p>` +
        `<p class="ajuda" style="margin:0 0 6px">${d.resumo}</p>` +
        `<div class="barra-trilho"><div class="barra" style="width:${total ? Math.round(g.acertos / total * 100) : 0}%"></div></div>` +
        `<p class="ajuda" style="margin:4px 0 0">${g.acertos} acertos e ${g.erros} erros</p>`;
      escada.appendChild(linha);
    }
    alvo.appendChild(escada);

    const fracos = pontosFracos(progresso, 2);
    const mapa = criar("div", { className: "cartao" });
    mapa.innerHTML = `<h2 style="margin-top:0">Onde você tropeça</h2>`;
    if (!fracos.length) {
      mapa.appendChild(criar("p", { className: "ajuda", textContent: "Ainda não há exercícios suficientes para apontar um padrão. Faça algumas rodadas no treino e este mapa se preenche." }));
    } else {
      for (const f of fracos.slice(0, 6)) {
        const linha = criar("div", { className: "fraqueza" });
        linha.innerHTML =
          `<span class="rot">${NOME_TIPO[f.tipo] || f.tipo}<br>` +
          `<span class="ajuda">${f.total} tentativa${f.total === 1 ? "" : "s"}</span></span>` +
          `<span class="taxa">${Math.round(f.taxa * 100)}% de erro</span>`;
        mapa.appendChild(linha);
      }
      mapa.appendChild(criar("p", { className: "ajuda", textContent: "Este é o dado mais útil da tela: ele diz exatamente qual conta merece a próxima meia hora de estudo." }));
    }
    alvo.appendChild(mapa);

    const medalhas = criar("div", { className: "cartao" });
    medalhas.innerHTML = `<h2 style="margin-top:0">Medalhas</h2>`;
    const grade = criar("div", { className: "medalhas" });
    for (const m of MEDALHAS) {
      const tem = progresso.medalhas.includes(m.id);
      const item = criar("div", { className: "medalha " + (tem ? "conquistada" : "pendente") });
      item.innerHTML = `<strong>${m.nome}</strong>${m.descricao}`;
      grade.appendChild(item);
    }
    medalhas.appendChild(grade);
    alvo.appendChild(medalhas);

    const zerar = criar("div", { className: "cartao" });
    zerar.innerHTML = `<h2 style="margin-top:0">Recomeçar</h2><p class="ajuda">Apaga XP, medalhas, degraus liberados e o mapa de dificuldades deste aparelho. Não dá para desfazer.</p>`;
    const botaoZerar = criar("button", { className: "botao secundario", type: "button", textContent: "Zerar meu progresso" });
    botaoZerar.addEventListener("click", () => {
      if (!window.confirm("Apagar todo o progresso guardado neste aparelho?")) return;
      progresso = zerarProgresso();
      estado.degrau = 1;
      estado.exercicio = null;
      estado.sessao = { certas: 0, total: 0, xp: 0 };
      desenharProgresso();
      atualizarResumoLateral();
    });
    zerar.appendChild(botaoZerar);
    alvo.appendChild(zerar);
  }

  function atualizarResumoLateral() {
    const nv = xpParaProximoNivel(progresso.xp);
    $("#resumo-lateral").textContent = `Nível ${nv.nivel} · ${progresso.xp} XP · ${progresso.totalAcertos} acertos`;
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
    progresso = carregarProgresso();
    $("#formula").value = estado.formula;
    montarExemplos();
    montarExemplosEquacao();
    $("#equacao").value = estado.equacao;
    balancearAtual();
    montarSeletorVolume();
    montarPeriodica();
    analisarAtual();
    atualizarResumoLateral();

    $("#formula").addEventListener("input", analisarAtual);
    $("#equacao").addEventListener("input", balancearAtual);
    $("#busca").addEventListener("input", (ev) => filtrarTabela(ev.target.value));
    for (const b of document.querySelectorAll(".menu .item")) {
      b.addEventListener("click", () => mostrarTela(b.dataset.tela));
    }
    $("#menuBtn").addEventListener("click", abrirMenu);
    $("#fecharMenu").addEventListener("click", fecharMenu);
    $("#cortina").addEventListener("click", fecharMenu);
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && estreita()) fecharMenu();
    });

    const destino = {
      "#massa-molar": "tela-massa", "#converter": "tela-ponte",
      "#balancear": "tela-balancear", "#estequiometria": "tela-esteq",
      "#treino": "tela-treino", "#progresso": "tela-progresso", "#tabela": "tela-tabela",
    }[location.hash];
    if (destino) mostrarTela(destino);

    // no celular a gaveta começa aberta, para deixar claro que a navegação
    // está ali — mesma escolha do sistema da Reviva
    if (estreita()) abrirMenu();

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
    }
  }

  document.addEventListener("DOMContentLoaded", iniciar);
})();

/* SUPER MOLBOX — nomenclatura inorgânica: montar o composto juntando um cátion e um ânion.

   Decisões do professor (docs/planos/2026-11-03-nomenclatura-inorganica.md):
   - funções: ácidos (hidrácidos e oxiácidos), bases, sais (com hidratos) e óxidos (básicos,
     ácidos, neutros, anfóteros e peróxidos);
   - cátion de carga variável com número romano (cloreto de ferro(III)); o nome antigo com
     -oso/-ico aparece como "também chamado de";
   - prefixos (mono-, di-, tri-...) só nos óxidos de não metal (dióxido de carbono).

   O banco de íons é curado à mão: cada ânion traz o nome do ácido que ele forma, e um teste
   confere a regra de sufixo (-eto → -ídrico, -ato → -ico, -ito → -oso) em todo o banco. A
   classificação de cada óxido também está gravada, não deduzida. Combinação que não faz
   sentido é recusada com o motivo, nunca com um nome inventado.

   Funções puras, publicadas em window.NomenclaturaInorganica. */
(function () {
  "use strict";

  /* ---------------- íons ---------------- */

  // `antigo`: adjetivo do nome antigo (-oso/-ico) dos cátions de carga variável.
  // `oxido`: classificação do óxido do cátion (cátion + O²⁻). `peroxido`: forma peróxido.
  const CATIONS = [
    { id: "H", formula: "H", carga: 1, nome: "hidrogênio" },
    { id: "Li", formula: "Li", carga: 1, nome: "lítio", oxido: "basico", peroxido: true },
    { id: "Na", formula: "Na", carga: 1, nome: "sódio", oxido: "basico", peroxido: true },
    { id: "K", formula: "K", carga: 1, nome: "potássio", oxido: "basico", peroxido: true },
    { id: "Ag", formula: "Ag", carga: 1, nome: "prata", oxido: "basico" },
    { id: "NH4", formula: "NH4", carga: 1, nome: "amônio", composto: true },
    { id: "Mg", formula: "Mg", carga: 2, nome: "magnésio", oxido: "basico", peroxido: true },
    { id: "Ca", formula: "Ca", carga: 2, nome: "cálcio", oxido: "basico", peroxido: true },
    { id: "Ba", formula: "Ba", carga: 2, nome: "bário", oxido: "basico", peroxido: true },
    { id: "Zn", formula: "Zn", carga: 2, nome: "zinco", oxido: "anfotero" },
    { id: "Al", formula: "Al", carga: 3, nome: "alumínio", oxido: "anfotero" },
    { id: "Fe2", formula: "Fe", carga: 2, nome: "ferro(II)", antigo: "ferroso", oxido: "basico" },
    { id: "Fe3", formula: "Fe", carga: 3, nome: "ferro(III)", antigo: "férrico", oxido: "basico" },
    { id: "Cu1", formula: "Cu", carga: 1, nome: "cobre(I)", antigo: "cuproso", oxido: "basico" },
    { id: "Cu2", formula: "Cu", carga: 2, nome: "cobre(II)", antigo: "cúprico", oxido: "basico" },
    { id: "Sn2", formula: "Sn", carga: 2, nome: "estanho(II)", antigo: "estanoso", oxido: "anfotero" },
    { id: "Sn4", formula: "Sn", carga: 4, nome: "estanho(IV)", antigo: "estânico", oxido: "anfotero" },
    { id: "Pb2", formula: "Pb", carga: 2, nome: "chumbo(II)", antigo: "plumboso", oxido: "anfotero" },
    { id: "Pb4", formula: "Pb", carga: 4, nome: "chumbo(IV)", antigo: "plúmbico", oxido: "anfotero" },
  ];

  // `acido`: o nome do ácido (sem a palavra "ácido") que o ânion forma com H⁺; null se não forma.
  // `especial`: hidroxido, oxido e peroxido mudam a função. `antes`: o ânion vem antes na
  // fórmula (acetato: CH3COONa). `formulaAcido`: a fórmula usual do ácido, se não for H + ânion.
  const ANIONS = [
    { id: "F", formula: "F", carga: 1, nome: "fluoreto", acido: "fluorídrico" },
    { id: "Cl", formula: "Cl", carga: 1, nome: "cloreto", acido: "clorídrico" },
    { id: "Br", formula: "Br", carga: 1, nome: "brometo", acido: "bromídrico" },
    { id: "I", formula: "I", carga: 1, nome: "iodeto", acido: "iodídrico" },
    { id: "S", formula: "S", carga: 2, nome: "sulfeto", acido: "sulfídrico" },
    { id: "CN", formula: "CN", carga: 1, nome: "cianeto", acido: "cianídrico", composto: true },
    { id: "ClO", formula: "ClO", carga: 1, nome: "hipoclorito", acido: "hipocloroso", composto: true },
    { id: "ClO2", formula: "ClO2", carga: 1, nome: "clorito", acido: "cloroso", composto: true },
    { id: "ClO3", formula: "ClO3", carga: 1, nome: "clorato", acido: "clórico", composto: true },
    { id: "ClO4", formula: "ClO4", carga: 1, nome: "perclorato", acido: "perclórico", composto: true },
    { id: "NO2", formula: "NO2", carga: 1, nome: "nitrito", acido: "nitroso", composto: true },
    { id: "NO3", formula: "NO3", carga: 1, nome: "nitrato", acido: "nítrico", composto: true },
    { id: "SO3", formula: "SO3", carga: 2, nome: "sulfito", acido: "sulfuroso", composto: true },
    { id: "SO4", formula: "SO4", carga: 2, nome: "sulfato", acido: "sulfúrico", composto: true },
    { id: "HSO4", formula: "HSO4", carga: 1, nome: "hidrogenossulfato", usual: "bissulfato", acido: null, composto: true },
    { id: "CO3", formula: "CO3", carga: 2, nome: "carbonato", acido: "carbônico", composto: true },
    { id: "HCO3", formula: "HCO3", carga: 1, nome: "hidrogenocarbonato", usual: "bicarbonato", acido: null, composto: true },
    { id: "PO4", formula: "PO4", carga: 3, nome: "fosfato", acido: "fosfórico", composto: true },
    { id: "CH3COO", formula: "CH3COO", carga: 1, nome: "acetato", acido: "acético", composto: true, antes: true, formulaAcido: "CH3COOH" },
    { id: "MnO4", formula: "MnO4", carga: 1, nome: "permanganato", acido: "permangânico", composto: true },
    { id: "CrO4", formula: "CrO4", carga: 2, nome: "cromato", acido: "crômico", composto: true },
    { id: "Cr2O7", formula: "Cr2O7", carga: 2, nome: "dicromato", acido: "dicrômico", composto: true },
    { id: "OH", formula: "OH", carga: 1, nome: "hidróxido", especial: "hidroxido", composto: true },
    { id: "O", formula: "O", carga: 2, nome: "óxido", especial: "oxido" },
    { id: "O2", formula: "O2", carga: 2, nome: "peróxido", especial: "peroxido" },
  ];

  /* Óxidos de não metal: os prefixos só valem aqui (decisão 4). Classificação gravada. */
  const OXIDOS_MOLECULARES = [
    { id: "CO", elemento: "C", formula: "CO", nome: "monóxido de carbono", usual: null, classe: "neutro" },
    { id: "CO2", elemento: "C", formula: "CO2", nome: "dióxido de carbono", usual: "gás carbônico", classe: "acido" },
    { id: "NO", elemento: "N", formula: "NO", nome: "monóxido de nitrogênio", usual: "óxido nítrico", classe: "neutro" },
    { id: "N2O", elemento: "N", formula: "N2O", nome: "monóxido de dinitrogênio", usual: "óxido nitroso, o gás hilariante", classe: "neutro" },
    { id: "NO2", elemento: "N", formula: "NO2", nome: "dióxido de nitrogênio", usual: null, classe: "acido" },
    { id: "SO2", elemento: "S", formula: "SO2", nome: "dióxido de enxofre", usual: "anidrido sulfuroso", classe: "acido" },
    { id: "SO3", elemento: "S", formula: "SO3", nome: "trióxido de enxofre", usual: "anidrido sulfúrico", classe: "acido" },
    { id: "P2O5", elemento: "P", formula: "P2O5", nome: "pentóxido de difósforo", usual: "anidrido fosfórico", classe: "acido" },
    { id: "SiO2", elemento: "Si", formula: "SiO2", nome: "dióxido de silício", usual: "sílica, o principal componente da areia", classe: "acido" },
  ];
  const ELEMENTOS_DE_OXIDO = [
    { id: "C", nome: "carbono" }, { id: "N", nome: "nitrogênio" }, { id: "S", nome: "enxofre" },
    { id: "P", nome: "fósforo" }, { id: "Si", nome: "silício" },
  ];

  const CLASSES_OXIDO = {
    basico: { nome: "óxido básico", regra: "Óxido de metal alcalino, alcalino-terroso ou de transição com carga baixa: em água forma base, e reage com ácido formando sal e água." },
    anfotero: { nome: "óxido anfótero", regra: "Reage tanto com ácido quanto com base forte, formando sal e água: tem os dois comportamentos." },
    acido: { nome: "óxido ácido", regra: "Óxido de não metal (também chamado de anidrido): em água forma ácido, e reage com base formando sal e água." },
    neutro: { nome: "óxido neutro", regra: "Não reage com água, nem com ácido, nem com base." },
    peroxido: { nome: "peróxido", regra: "Tem o grupo O₂²⁻, com dois oxigênios ligados entre si, cada um com número de oxidação −1." },
  };

  const NOMES_FUNCAO = { acido: "ácido", base: "base", sal: "sal", oxido: "óxido" };

  const HIDRATACAO = ["", "mono", "di", "tri", "tetra", "penta", "hexa", "hepta", "octa", "nona", "deca"];
  const AGUAS_MAXIMAS = 10;

  /* ---------------- contas ---------------- */

  const mdc = (a, b) => (b ? mdc(b, a % b) : a);
  const SOBRE = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const SUB = "₀₁₂₃₄₅₆₇₈₉";

  // "SO4" -> "SO₄", para a tela; a fórmula de texto (SO4) é a que vai para o analisador.
  function comIndices(formula) { return String(formula).replace(/\d/g, (d) => SUB[+d]); }
  function textoDoIon(ion, sinal) { return comIndices(ion.formula) + (ion.carga === 1 ? "" : SOBRE[ion.carga]) + sinal; }
  const textoCation = (c) => textoDoIon(c, "⁺");
  const textoAnion = (a) => textoDoIon(a, "⁻");

  // Um pedaço da fórmula repetido n vezes: Al2, (SO4)3, NH4, (NH4)2.
  function pedaco(ion, n) {
    if (n === 1) return ion.formula;
    return ion.composto ? `(${ion.formula})${n}` : `${ion.formula}${n}`;
  }

  function erro(explicacao) { return { ok: false, explicacao }; }

  const porId = (lista, id) => lista.find((x) => x.id === id) || null;

  /* ---------------- montagem ---------------- */

  /* Junta cátion e ânion. `opcoes.aguas`: águas de hidratação (só em sal, de 0 a 10).
     Devolve { ok, formula, formulaTela, nome, antigo, usual, funcao, classe, contas, regra }. */
  function montar(idCation, idAnion, opcoes) {
    const c = porId(CATIONS, idCation);
    const a = porId(ANIONS, idAnion);
    if (!c || !a) return erro("Escolha um cátion e um ânion da lista.");
    const aguas = opcoes && Number.isInteger(opcoes.aguas) ? opcoes.aguas : 0;

    // Recusas: combinações que não formam um composto desta lista, sempre com o motivo.
    if (c.id === "H" && a.especial === "hidroxido") return erro("H⁺ com OH⁻ forma água: é a neutralização, que acontece em toda reação de ácido com base. A água não é um ácido nem uma base.");
    if (c.id === "H" && a.especial === "oxido") return erro("H⁺ com O²⁻ forma água (H₂O). Ela é um óxido, mas aqui o foco são os óxidos de metal; os de não metal estão em \"Óxidos de não metal\".");
    if (c.id === "H" && a.acido === null) return erro(`O ${a.nome} já tem um hidrogênio: com mais um H⁺ ele vira o ácido do ânion sem o H. Escolha o ânion ${a.id === "HSO4" ? "sulfato" : "carbonato"} para montar o ácido.`);
    if (c.id === "NH4" && (a.especial === "oxido" || a.especial === "peroxido")) return erro("O amônio não forma óxido nem peróxido: ele não é um metal, é um íon que só existe combinado com ânions.");
    if (a.especial === "peroxido" && c.id !== "H" && !c.peroxido) return erro(`O app só monta peróxidos de hidrogênio e de metais alcalinos e alcalino-terrosos. O ${c.nome} não está entre eles.`);
    if (aguas && (aguas < 0 || aguas > AGUAS_MAXIMAS)) return erro("Escolha de 0 a 10 águas de hidratação.");

    // Fórmula pela carga: os índices zeram a soma (MMC das cargas).
    const m = (c.carga * a.carga) / mdc(c.carga, a.carga);
    const nc = m / c.carga;
    const na = m / a.carga;
    const contas = [
      `Cargas: ${textoCation(c)} e ${textoAnion(a)}.`,
      `Para a soma dar zero: ${nc} × (+${c.carga}) + ${na} × (−${a.carga}) = 0.`,
      `Por isso a fórmula leva ${nc} ${nc === 1 ? "cátion" : "cátions"} e ${na} ${na === 1 ? "ânion" : "ânions"}.`,
    ];

    let formula;
    let funcao;
    let nome;
    let antigo = null;
    let classe = null;
    let regra;

    if (c.id === "H") {
      if (a.especial === "peroxido") {
        formula = "H2O2"; funcao = "oxido"; classe = "peroxido";
        nome = "peróxido de hidrogênio";
        regra = "Peróxido: \"peróxido de\" + nome do cátion.";
      } else {
        // Um ânion por fórmula, com tantos H quanto a carga dele (H2SO4, H3PO4).
        formula = a.formulaAcido || `H${nc === 1 ? "" : nc}${a.formula}`;
        funcao = "acido";
        nome = `ácido ${a.acido}`;
        const fim = a.nome.endsWith("eto") ? ["-eto", "-ídrico", "hidrácido: o ácido não tem oxigênio"]
          : a.nome.endsWith("ato") ? ["-ato", "-ico", "oxiácido: o ácido tem oxigênio"]
            : ["-ito", "-oso", "oxiácido: o ácido tem oxigênio"];
        regra = `Ânion terminado em ${fim[0]} dá ácido terminado em ${fim[1]} (${a.nome} → ácido ${a.acido}). É um ${fim[2]}.`;
        if (/^(hipo|per)/.test(a.nome)) regra += ` O prefixo ${a.nome.startsWith("hipo") ? "hipo-" : "per-"} do ânion continua no ácido.`;
      }
    } else {
      formula = a.antes ? `${pedaco(a, na)}${pedaco(c, nc)}` : `${pedaco(c, nc)}${pedaco(a, na)}`;
      if (a.especial === "hidroxido") {
        funcao = "base";
        nome = `hidróxido de ${c.nome}`;
        if (c.antigo) antigo = `hidróxido ${c.antigo}`;
        regra = "Base: \"hidróxido de\" + nome do cátion. O OH⁻ (hidroxila) é o que toda base tem.";
      } else if (a.especial === "oxido") {
        funcao = "oxido"; classe = c.oxido;
        nome = `óxido de ${c.nome}`;
        if (c.antigo) antigo = `óxido ${c.antigo}`;
        regra = "Óxido de metal: \"óxido de\" + nome do cátion, sem prefixo de quantidade.";
      } else if (a.especial === "peroxido") {
        funcao = "oxido"; classe = "peroxido";
        // O₂²⁻ é um grupo só: Na2O2, BaO2 (sem parênteses).
        formula = `${pedaco(c, nc)}${na === 1 ? "O2" : `O${2 * na}`}`;
        nome = `peróxido de ${c.nome}`;
        regra = "Peróxido: \"peróxido de\" + nome do cátion.";
      } else {
        funcao = "sal";
        nome = `${a.nome} de ${c.nome}`;
        if (c.antigo) antigo = `${a.nome} ${c.antigo}`;
        regra = "Sal: nome do ânion + \"de\" + nome do cátion.";
        if (a.acido) regra += ` O ânion vem do ácido ${a.acido} (${a.nome.endsWith("eto") ? "-ídrico → -eto" : a.nome.endsWith("ato") ? "-ico → -ato" : "-oso → -ito"}).`;
      }
    }

    let usual = null;
    if (a.usual && funcao === "sal") usual = `${a.usual} de ${c.nome}`;

    if (aguas) {
      if (funcao !== "sal") return erro("Só os sais aparecem aqui com água de hidratação.");
      formula = `${formula}·${aguas === 1 ? "" : aguas}H2O`;
      const sufixo = `${HIDRATACAO[aguas]}-hidratado`;
      nome = `${nome} ${sufixo}`;
      if (antigo) antigo = `${antigo} ${sufixo}`;
      if (usual) usual = `${usual} ${sufixo}`;
      contas.push(`Hidratado: cada fórmula do sal prende ${aguas} ${aguas === 1 ? "molécula" : "moléculas"} de água no cristal, escritas depois do ponto.`);
    }

    return {
      ok: true, formula, formulaTela: comIndices(formula), nome, antigo, usual, funcao,
      nomeFuncao: NOMES_FUNCAO[funcao], classe, nomeClasse: classe ? CLASSES_OXIDO[classe].nome : null,
      regraClasse: classe ? CLASSES_OXIDO[classe].regra : null, contas, regra,
    };
  }

  /* Óxido de não metal escolhido na lista (os prefixos valem só aqui). */
  function montarOxidoMolecular(id) {
    const o = porId(OXIDOS_MOLECULARES, id);
    if (!o) return erro("Escolha um dos óxidos da lista.");
    return {
      ok: true, formula: o.formula, formulaTela: comIndices(o.formula), nome: o.nome, antigo: null, usual: o.usual,
      funcao: "oxido", nomeFuncao: "óxido", classe: o.classe, nomeClasse: CLASSES_OXIDO[o.classe].nome, regraClasse: CLASSES_OXIDO[o.classe].regra,
      contas: ["Óxido molecular: os átomos se ligam por pares de elétrons, sem íons. Por isso a fórmula não sai das cargas."],
      regra: "Óxido de não metal: prefixo do número de oxigênios + \"óxido de\" + prefixo do número de átomos do elemento + nome do elemento (o \"mono\" do elemento não se escreve).",
    };
  }

  /* As listas por função, para a tela: ácido usa H⁺ fixo, base usa OH⁻ fixo. */
  function cationsPara(funcao) {
    if (funcao === "acido") return CATIONS.filter((c) => c.id === "H");
    if (funcao === "oxido") return CATIONS.filter((c) => c.id !== "NH4");
    return CATIONS.filter((c) => c.id !== "H");
  }
  function anionsPara(funcao) {
    if (funcao === "base") return ANIONS.filter((a) => a.especial === "hidroxido");
    if (funcao === "oxido") return ANIONS.filter((a) => a.especial === "oxido" || a.especial === "peroxido");
    if (funcao === "acido") return ANIONS.filter((a) => !a.especial && a.acido);
    return ANIONS.filter((a) => !a.especial);
  }
  function oxidosDoElemento(elemento) { return OXIDOS_MOLECULARES.filter((o) => o.elemento === elemento); }

  window.NomenclaturaInorganica = {
    CATIONS, ANIONS, OXIDOS_MOLECULARES, ELEMENTOS_DE_OXIDO, CLASSES_OXIDO, AGUAS_MAXIMAS,
    montar, montarOxidoMolecular, cationsPara, anionsPara, oxidosDoElemento, textoCation, textoAnion, comIndices,
  };
})();

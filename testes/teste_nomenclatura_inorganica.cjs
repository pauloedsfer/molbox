/* Nomenclatura inorgânica: fórmula pela carga, nomes, funções, recusas e a prateleira. */
module.exports = ({ teste, igual, verdadeiro, carregar }) => {
  const ctx = carregar(["js/elementos.js", "js/parser.js", "js/nomenclatura_inorganica.js", "js/compostos_inorganicos.js"]);
  const N = ctx.window.NomenclaturaInorganica;
  const C = ctx.window.CompostosInorganicos;
  const analisar = (f) => ctx.analisar(f);
  const m = (c, a, o) => N.montar(c, a, o);

  teste("fórmula pela carga, com parênteses no íon composto repetido", () => {
    igual(m("Na", "Cl").formula, "NaCl");
    igual(m("Al", "SO4").formula, "Al2(SO4)3");
    igual(m("Ca", "PO4").formula, "Ca3(PO4)2");
    igual(m("NH4", "SO4").formula, "(NH4)2SO4");
    igual(m("Ca", "OH").formula, "Ca(OH)2");
    igual(m("Na", "OH").formula, "NaOH");
    igual(m("Fe3", "O").formula, "Fe2O3");
    igual(m("Pb4", "O").formula, "PbO2");
    igual(m("Ca", "CH3COO").formula, "(CH3COO)2Ca");
    igual(m("Al", "SO4").contas[1], "Para a soma dar zero: 2 × (+3) + 3 × (−2) = 0.");
  });

  teste("ácidos: -eto → -ídrico, -ato → -ico, -ito → -oso, hipo- e per- ficam", () => {
    igual(m("H", "Cl").nome, "ácido clorídrico");
    igual(m("H", "SO4").formula, "H2SO4");
    igual(m("H", "PO4").formula, "H3PO4");
    igual(m("H", "SO3").nome, "ácido sulfuroso");
    igual(m("H", "ClO").nome, "ácido hipocloroso");
    igual(m("H", "ClO4").nome, "ácido perclórico");
    igual(m("H", "CH3COO").formula, "CH3COOH");
    igual(m("H", "S").funcao, "acido");
    verdadeiro(/hidrácido/.test(m("H", "Cl").regra) && /oxiácido/.test(m("H", "NO3").regra));
  });

  teste("a regra de sufixo vale em todo o banco de ânions", () => {
    for (const a of N.ANIONS) {
      if (a.especial || a.acido === null) continue;
      const par = a.nome.endsWith("eto") ? "ídrico" : a.nome.endsWith("ato") ? "ico" : a.nome.endsWith("ito") ? "oso" : null;
      verdadeiro(par && a.acido.endsWith(par), `${a.nome} → ${a.acido}`);
    }
  });

  teste("bases, sais, óxidos e peróxidos, com número romano e nome antigo", () => {
    igual(m("Fe3", "Cl").nome, "cloreto de ferro(III)");
    igual(m("Fe3", "Cl").antigo, "cloreto férrico");
    igual(m("Cu2", "SO4", { aguas: 5 }).nome, "sulfato de cobre(II) penta-hidratado");
    igual(m("Cu2", "SO4", { aguas: 5 }).formula, "CuSO4·5H2O");
    igual(m("Cu2", "SO4", { aguas: 5 }).antigo, "sulfato cúprico penta-hidratado");
    igual(m("Ca", "SO4", { aguas: 2 }).nome, "sulfato de cálcio di-hidratado");
    igual(m("Mg", "OH").nome, "hidróxido de magnésio");
    igual(m("Na", "HCO3").usual, "bicarbonato de sódio");
    igual(m("Ca", "O").nomeClasse, "óxido básico");
    igual(m("Zn", "O").nomeClasse, "óxido anfótero");
    igual(m("Na", "O2").formula, "Na2O2");
    igual(m("Ba", "O2").formula, "BaO2");
    igual(m("H", "O2").formula, "H2O2");
    igual(m("H", "O2").nome, "peróxido de hidrogênio");
    igual(N.montarOxidoMolecular("CO2").nome, "dióxido de carbono");
    igual(N.montarOxidoMolecular("CO").nomeClasse, "óxido neutro");
  });

  teste("combinações sem sentido são recusadas, com motivo e sem nome", () => {
    for (const [c, a, o] of [["H", "OH"], ["H", "O"], ["H", "HSO4"], ["NH4", "O"], ["Fe3", "O2"], ["Na", "OH", { aguas: 3 }], ["Na", "Cl", { aguas: 11 }], ["X", "Cl"]]) {
      const r = m(c, a, o);
      igual(r.ok, false, `${c}+${a}`);
      verdadeiro(/^[A-ZÁÉÍÓÚH]/.test(r.explicacao) && !/undefined|NaN/.test(r.explicacao), r.explicacao);
    }
    igual(N.montarOxidoMolecular("XO").ok, false);
  });

  teste("toda combinação da tela dá composto válido ou recusa, sem undefined", () => {
    for (const f of ["acido", "base", "sal", "oxido"]) {
      for (const c of N.cationsPara(f)) for (const a of N.anionsPara(f)) {
        const r = m(c.id, a.id);
        const texto = JSON.stringify(r);
        verdadeiro(!/\bundefined\b|\bNaN\b|null de|de null/.test(texto), texto);   // NaNO2 é nitrito de sódio, não NaN
        if (!r.ok) continue;
        igual(r.funcao === "oxido" ? "oxido" : r.funcao, f === "oxido" ? "oxido" : f, `${c.id}+${a.id}`);
        // A fórmula gerada é lida pelo analisador do MOLBOX e fecha a carga zero.
        const lida = analisar(r.formula);
        verdadeiro(lida.massaMolar > 0, r.formula);
      }
    }
    for (const o of N.OXIDOS_MOLECULARES) verdadeiro(analisar(N.montarOxidoMolecular(o.id).formula).massaMolar > 0, o.id);
  });

  teste("prateleira: 52 compostos, todos montáveis na tela", () => {
    igual(C.TROFEUS.length, 52);
    const montaveis = new Set();
    for (const f of ["acido", "base", "sal", "oxido"]) for (const c of N.cationsPara(f)) for (const a of N.anionsPara(f)) {
      for (let aguas = 0; aguas <= N.AGUAS_MAXIMAS; aguas++) {
        const r = m(c.id, a.id, { aguas });
        if (r.ok) montaveis.add(r.formula + "|" + r.funcao);
      }
    }
    for (const o of N.OXIDOS_MOLECULARES) montaveis.add(o.formula + "|oxido");
    for (const t of C.TROFEUS) verdadeiro(montaveis.has(t.formula + "|" + t.funcao), "não montável: " + t.formula);
    igual(new Set(C.TROFEUS.map((t) => t.id)).size, 52);
  });

  teste("troféus: guardados sem repetir, e lixo no armazenamento vira lista vazia", () => {
    const mem = new Map();
    const a = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, v) };
    igual(C.ganharTrofeu(a, "NaCl", "2026-11-03"), true);
    igual(C.ganharTrofeu(a, "NaCl", "2026-11-03"), false);
    igual(C.ganharTrofeu(a, "XYZ", "2026-11-03"), false);
    igual(C.carregarTrofeus(a).length, 1);
    mem.set(C.CHAVE_TROFEUS, "{lixo");
    igual(C.carregarTrofeus(a).length, 0);
    igual(C.carregarTrofeus(null).length, 0);
  });
};

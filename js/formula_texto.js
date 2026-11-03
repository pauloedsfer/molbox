/* ORIGEM: motor/formula_texto.js (Super Organic Box), convertido por ferramentas/converter_modulo.cjs.
   Mude lá e converta de novo: os dois aplicativos usam a mesma lógica. */
(function () {
  "use strict";
  /* Separa um texto em trechos normais, subscritos e sobrescritos: "CH3" vira CH + 3 subscrito.
     Só conta como fórmula o que é feito de símbolos de elementos, para os números de um nome
     (but-2-eno, carbono 2) ficarem como estão. Tela, desenho e PDF usam a mesma regra. */
  const ELEMENTOS = new Set(["H", "C", "N", "O", "F", "S", "P", "Cl", "Br", "I", "Na", "K", "Li", "Ca", "R"]);
  const SUBSCRITOS = "₀₁₂₃₄₅₆₇₈₉";
  const SOBRESCRITOS = new Map([..."⁰¹²³⁴⁵⁶⁷⁸⁹"].map((c, k) => [c, String(k)]).concat([["⁺", "+"], ["⁻", "-"]]));
  const SIMBOLO = /[A-Z][a-z]?/g;

  function feitoDeElementos(palavra) {
    const simbolos = palavra.replace(/\d+/g, "").match(SIMBOLO);
    return !!simbolos && simbolos.join("") === palavra.replace(/\d+/g, "") && simbolos.every((s) => ELEMENTOS.has(s));
  }

  // Índices dos dígitos que são subscritos.
  function digitosDeFormula(texto) {
    const marcados = new Set();
    for (const m of texto.matchAll(/[A-Za-z0-9]+/g)) {
      const palavra = m[0];
      if (!/^[A-Z]/.test(palavra) || !/\d/.test(palavra) || !feitoDeElementos(palavra)) continue;
      // Número no começo da palavra não existe aqui (a palavra começa por letra).
      for (const d of palavra.matchAll(/\d/g)) marcados.add(m.index + d.index);
    }
    // Grupo entre parênteses com número depois: (CH3)2.
    for (const m of texto.matchAll(/\(([A-Za-z0-9]+)\)(\d+)/g)) {
      if (!feitoDeElementos(m[1])) continue;
      const inicio = m.index + m[1].length + 2;
      for (let k = 0; k < m[2].length; k++) marcados.add(inicio + k);
    }
    return marcados;
  }

  function trechosDeFormula(texto) {
    const entrada = String(texto);
    const marcados = digitosDeFormula(entrada);
    const trechos = [];
    const por = (t, tipo) => {
      const ultimo = trechos[trechos.length - 1];
      if (ultimo && ultimo.tipo === tipo) ultimo.texto += t;
      else trechos.push({ texto: t, tipo });
    };
    [...entrada].forEach((c, k) => {
      const sub = SUBSCRITOS.indexOf(c);
      if (sub >= 0) por(String(sub), "sub");
      else if (SOBRESCRITOS.has(c)) por(SOBRESCRITOS.get(c), "sup");
      else por(c, marcados.has(k) ? "sub" : "normal");
    });
    return trechos;
  }

  window.FormulaTexto = { trechosDeFormula };
})();

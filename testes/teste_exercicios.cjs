/* Treino da escada: toda questão é de alternativas, com uma certa e erradas diagnosticadas. */
module.exports = ({ teste, igual, verdadeiro, carregar }) => {
  const ARQUIVOS = ["js/elementos.js", "js/parser.js", "js/converter.js", "js/balanceador.js", "js/estequiometria.js", "js/moleculas.js", "js/especies.js", "js/exercicios.js"];

  teste("treino: toda questão de todo degrau tem 4 alternativas (ou as do banco), uma certa e textos diferentes", () => {
    const ctx = carregar(ARQUIVOS);
    const tipos = new Set();
    for (let d = 0; d <= 4; d++) {
      let anterior = null;
      for (let i = 0; i < 150; i++) {
        const q = ctx.gerarExercicio(d, { volumeMolar: 22.4 }, anterior);
        anterior = q.tipo;
        tipos.add(q.tipo);
        igual(q.formato, "escolha", q.tipo);
        if (q.numerica) igual(q.opcoes.length, 4, `${q.tipo}: ${q.opcoes.map((o) => o.texto)}`);
        igual(q.opcoes.filter((o) => o.correta).length, 1, q.tipo);
        const textos = q.opcoes.map((o) => o.texto);
        igual(new Set(textos).size, textos.length, `${q.tipo}: ${textos}`);
        q.opcoes.forEach((o, k) => {
          const v = ctx.corrigir(q, String(k));
          igual(v.situacao === "certo", !!o.correta, `${q.tipo} ${o.texto}`);
          verdadeiro(typeof v.mensagem === "string" && v.mensagem.length > 5 && !/undefined|NaN/.test(v.mensagem), v.mensagem);
          if (q.numerica) verdadeiro(!/undefined|NaN|Infinity/.test(o.texto), o.texto);
        });
      }
    }
    igual(tipos.size, 16);
  });

  teste("treino: o erro típico (esquecer os índices) vira alternativa com o seu diagnóstico", () => {
    const ctx = carregar(ARQUIVOS);
    let visto = false;
    for (let i = 0; i < 60 && !visto; i++) {
      const q = ctx.gerarExercicio(1, { volumeMolar: 22.4 }, "atomosNaFormula");
      if (q.tipo !== "massaMolarSimples") continue;
      const k = q.opcoes.findIndex((o) => o.diagnostico && o.diagnostico.includes("esqueceu os índices"));
      if (k >= 0) { visto = true; igual(ctx.corrigir(q, String(k)).erroReconhecido, true); }
    }
    verdadeiro(visto, "nenhuma alternativa de índices esquecidos");
  });
};

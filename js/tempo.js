/* ORIGEM: comum/tempo.js (Super Organic Box), convertido por ferramentas/converter_modulo.cjs.
   Mude lá e converta de novo: os dois aplicativos usam a mesma lógica. */
(function () {
  "use strict";
  /* SUPER ORGANIC BOX — tempo de uso.

     Conta o tempo em que o aluno está usando o aplicativo. A conta anda de uma ação a outra
     (trocar de tela, tocar, digitar, rolar a página) e para 3 minutos depois da última ação: quem
     deixou o app aberto e foi embora não acumula tempo. Esconder a aba também para a conta.

     Feito para servir aos dois aplicativos (Organic e MOLBOX): não conhece telas nem DOM, recebe por
     parâmetro a chave, o armazenamento e o relógio (assim os testes rodam sem navegador). Guarda o
     total, o tempo de cada dia e o de cada tela, em milissegundos. Tudo fica no aparelho.

     Duas abas abertas: cada uma soma só o que ela mesma contou, relendo o guardado antes de gravar,
     para uma não apagar a conta da outra. */

  const PAUSA_MAXIMA = 3 * 60 * 1000;   // depois de 3 minutos sem ação, a conta para
  const GRAVAR_A_CADA = 15 * 1000;      // grava no máximo a cada 15 s (e sempre ao parar)
  const DIAS_GUARDADOS = 60;            // dias além disso saem do detalhe por dia (o total fica)

  const ehObjeto = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  const ehMs = (v) => Number.isFinite(v) && v >= 0;

  function diaDe(ms) {
    const d = new Date(ms);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function vazio() { return { total: 0, porDia: {}, porTela: {} }; }

  /* Texto guardado -> dados válidos (lixo vira vazio, campo estragado é ignorado). */
  function lerTempo(bruto) {
    const t = vazio();
    let d;
    try { d = JSON.parse(bruto); } catch (e) { return t; }
    if (!ehObjeto(d)) return t;
    if (ehMs(d.total)) t.total = Math.round(d.total);
    for (const [campo, chaveValida] of [["porDia", (k) => /^\d{4}-\d{2}-\d{2}$/.test(k)], ["porTela", (k) => /^[a-z0-9-]{1,40}$/.test(k)]]) {
      if (!ehObjeto(d[campo])) continue;
      for (const [k, v] of Object.entries(d[campo])) if (chaveValida(k) && ehMs(v)) t[campo][k] = Math.round(v);
    }
    return t;
  }

  /* Soma `extra` (o que esta aba contou) ao que está guardado. Pura. */
  function somar(guardado, extra) {
    const t = { total: guardado.total + extra.total, porDia: { ...guardado.porDia }, porTela: { ...guardado.porTela } };
    for (const [k, v] of Object.entries(extra.porDia)) t.porDia[k] = (t.porDia[k] || 0) + v;
    for (const [k, v] of Object.entries(extra.porTela)) t.porTela[k] = (t.porTela[k] || 0) + v;
    const dias = Object.keys(t.porDia).sort();
    for (const k of dias.slice(0, Math.max(0, dias.length - DIAS_GUARDADOS))) delete t.porDia[k];
    return t;
  }

  /* "2 h 05 min", "12 min", "menos de 1 min". */
  function textoDoTempo(ms) {
    const min = Math.floor((ehMs(ms) ? ms : 0) / 60000);
    if (min < 1) return "menos de 1 min";
    const h = Math.floor(min / 60);
    const resto = min % 60;
    return h ? `${h} h ${String(resto).padStart(2, "0")} min` : `${min} min`;
  }

  function criarCronometro({ chave, armazenamento, agora = () => Date.now() } = {}) {
    let pendente = vazio();      // contado por esta aba e ainda não gravado
    let ultima = null;           // momento da última ação, ou null com a conta parada
    let telaAtual = null;
    let gravadoEm = 0;
    let memoria = null;          // vale quando o armazenamento falta ou falha

    function lerGuardado() {
      try {
        if (armazenamento) {
          const texto = armazenamento.getItem(chave);
          if (texto !== null && texto !== undefined) return lerTempo(texto);
        }
      } catch (e) { /* cai na memória */ }
      return lerTempo(memoria);
    }

    function gravar() {
      if (!pendente.total) return;
      const junto = somar(lerGuardado(), pendente);
      memoria = JSON.stringify(junto);
      try { if (armazenamento) armazenamento.setItem(chave, memoria); } catch (e) { /* segue em memória */ }
      pendente = vazio();
      gravadoEm = agora();
    }

    // Soma o trecho desde a última ação, limitado à pausa máxima, ao dia e à tela daquela ação.
    function fecharTrecho(t) {
      if (ultima === null) return;
      const trecho = Math.min(Math.max(0, t - ultima), PAUSA_MAXIMA);
      if (!trecho) return;
      const dia = diaDe(ultima);
      pendente.total += trecho;
      pendente.porDia[dia] = (pendente.porDia[dia] || 0) + trecho;
      if (telaAtual) pendente.porTela[telaAtual] = (pendente.porTela[telaAtual] || 0) + trecho;
    }

    /* Uma ação do aluno. `tela` (opcional) é a tela em que ele está a partir de agora. */
    function registrarAcao(tela) {
      const t = agora();
      fecharTrecho(t);
      ultima = t;
      if (typeof tela === "string" && tela) telaAtual = tela;
      if (t - gravadoEm >= GRAVAR_A_CADA) gravar();
    }

    /* A aba sumiu ou fechou: soma até agora (no máximo a pausa) e para. */
    function parar() {
      fecharTrecho(agora());
      ultima = null;
      gravar();
    }

    /* O tempo guardado mais o que esta aba ainda não gravou (sem contar o trecho em aberto). */
    function dados() {
      return somar(lerGuardado(), pendente);
    }

    function hoje() {
      return dados().porDia[diaDe(agora())] || 0;
    }

    return { registrarAcao, parar, dados, hoje, gravar };
  }

  window.Tempo = { criarCronometro, lerTempo, somar, textoDoTempo, diaDe, PAUSA_MAXIMA };
})();

/* ORIGEM: dados/compartilhar.js (Super Organic Box), convertido por ferramentas/converter_modulo.cjs.
   Mude lá e converta de novo: os dois aplicativos usam a mesma lógica. */
(function () {
  "use strict";
  /* Textos de compartilhar pelo WhatsApp (ou por qualquer app do aparelho). Funções puras, para os
     dois aplicativos (Super Organic Box e SUPER MOLBOX).

     - Divulgação: a imagem do crachá ou do avatar vai com um convite e o link do app, para o colega
       ver onde o avatar foi feito.
     - Professor: a imagem vai como figurinha, com um resumo legível do progresso e a linha de dados
       completa (SOBOX1;... ou MOLBOX1;...), que o professor pode juntar e analisar (até com uma IA).
       O texto não leva nome: só o código que o aluno inventou e o apelido do crachá, se ele quiser. */

  const APPS = {
    organic: { nome: "Super Organic Box", url: "https://superorganico.vercel.app/", assunto: "Química Orgânica" },
    molbox: { nome: "SUPER MOLBOX", url: "https://supermolbox.vercel.app/", assunto: "o mol e as contas da bancada de Química" },
  };

  function appDe(id) { return APPS[id] || APPS.organic; }

  /* O convite que vai junto da imagem. `oQue`: "cracha" ou "avatar". */
  function textoDivulgacao(idApp, oQue) {
    const app = appDe(idApp);
    const peca = oQue === "cracha" ? "o meu crachá de cientista" : "o meu avatar de cientista";
    return `🧪 Olha ${peca} no ${app.nome}! É um app gratuito para aprender ${app.assunto}, e funciona até sem internet. Monte o seu: ${app.url}`;
  }

  /* A mensagem para o professor: resumo legível + linha de dados. `dados`:
     { codigo, apelido, titulo, nivel, xp, acertos, tentativas, extras: [texto...], linha }. */
  function textoProfessor(idApp, dados) {
    const app = appDe(idApp);
    const d = dados || {};
    const n = (v) => (Number.isFinite(v) ? v : 0);
    const partes = [
      `📊 Meu progresso no ${app.nome}`,
      `Código: ${d.codigo || "-"}${d.apelido ? ` (${d.apelido})` : ""}`,
      `Título: ${d.titulo || "-"} · Nível ${n(d.nivel)} · ${n(d.xp)} XP`,
      `Treino: ${n(d.acertos)} acertos em ${n(d.tentativas)} tentativas`,
      ...(Array.isArray(d.extras) ? d.extras.filter(Boolean) : []),
      "",
      "Dados para o professor (não apague):",
      String(d.linha || ""),
    ];
    return partes.join("\n");
  }

  window.TextosCompartilhar = { APPS, textoDivulgacao, textoProfessor };
})();

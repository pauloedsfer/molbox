/* ORIGEM: dados/envio.js (Super Organic Box), convertido por ferramentas/converter_modulo.cjs.
   Mude lá e converta de novo: os dois aplicativos usam a mesma lógica. */
(function () {
  "use strict";
  /* Envio do progresso ao professor pela internet. O app só usa a rede no momento do envio, e manda
     apenas o texto de progresso que o aluno já vê na tela (código inventado, sem nome).

     Cada professor tem o seu destino: uma planilha do Google com um pequeno Apps Script publicado
     como app da Web (docs/professor/envio-pela-internet.md). O link desse app é o "link da turma",
     que o professor passa aos alunos; pode levar ?turma=9A no fim para separar as turmas.

     Por segurança, o app só envia para um link de app da Web do Google
     (https://script.google.com/macros/s/.../exec). Assim, um link falso num QR code não consegue
     desviar o texto do aluno para outro site. Funções puras. */

  const PADRAO_LINK = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]{20,}\/exec$/;
  const TURMA = /^[\p{L}\p{N} ._-]{1,30}$/u;

  /* Texto colado pelo aluno -> { ok, url, turma } ou { ok: false, explicacao }. */
  function lerLinkDaTurma(texto) {
    const bruto = String(texto || "").trim();
    if (!bruto) return { ok: false, explicacao: "Cole o link da turma que o professor passou." };
    let u;
    try { u = new URL(bruto); } catch (e) { return { ok: false, explicacao: "Isso não parece um link. Confira com o professor." }; }
    const base = `${u.origin}${u.pathname}`;
    if (!PADRAO_LINK.test(base)) {
      return { ok: false, explicacao: "Este não é um link de planilha de turma. O link certo começa com https://script.google.com/macros/s/ e termina com /exec." };
    }
    const turma = u.searchParams.get("turma");
    if (turma !== null && !TURMA.test(turma)) return { ok: false, explicacao: "O nome da turma no link tem caracteres que o app não aceita." };
    return { ok: true, url: turma ? `${base}?turma=${encodeURIComponent(turma)}` : base, turma: turma || "" };
  }

  /* O que vai no corpo do envio: só a linha de progresso, conferida. */
  function corpoDoEnvio(linha, marca) {
    const t = String(linha || "").trim();
    if (!t.startsWith(marca + ";") || t.length > 2000 || /[\r\n]/.test(t)) return null;
    return t;
  }

  /* A resposta do Apps Script ({ ok: true } ou { ok: false, erro }) em frase para o aluno. */
  function mensagemDaResposta(r) {
    if (r && r.ok === true) return "Enviado! O professor já pode ver na planilha da turma.";
    if (r && typeof r.erro === "string") return `A planilha recusou o envio: ${r.erro}`;
    return "A planilha respondeu de um jeito que o app não entendeu. Confira com o professor se o envio chegou.";
  }

  window.Envio = { lerLinkDaTurma, corpoDoEnvio, mensagemDaResposta };
})();

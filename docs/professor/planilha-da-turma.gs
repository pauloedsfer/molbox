/**
 * Planilha da turma — recebe o progresso enviado pelos alunos do Super Organic Box e do
 * Super MOLBOX. Cole este código em Extensões > Apps Script de uma planilha do Google e publique
 * como "App da Web" (passo a passo em envio-pela-internet.md).
 *
 * Cada envio vira uma linha: quando chegou, a turma (do ?turma= do link), o aplicativo, o código
 * do aluno e cada campo do texto de progresso numa coluna. Coluna nova aparece sozinha quando um
 * aplicativo mandar um campo novo. O texto chega sem nome: só o código que o aluno inventou.
 */

var MARCAS = { SOBOX1: "Super Organic Box", MOLBOX1: "Super MOLBOX" };
var TAMANHO_MAXIMO = 2000;
var NOME_DA_ABA = "Envios";

function doPost(e) {
  try {
    var texto = String((e && e.postData && e.postData.contents) || "").trim();
    if (!texto || texto.length > TAMANHO_MAXIMO || /[\r\n]/.test(texto)) return resposta(false, "texto vazio ou grande demais.");
    var partes = texto.split(";");
    var app = MARCAS[partes[0]];
    if (!app) return resposta(false, "este texto não é de um aplicativo conhecido.");

    var campos = {};
    for (var i = 1; i < partes.length; i++) {
      var k = partes[i].indexOf("=");
      if (k > 0) campos[partes[i].slice(0, k).replace(/[^a-z0-9]/gi, "").slice(0, 10)] = partes[i].slice(k + 1).slice(0, 300);
    }
    if (!campos.cod) return resposta(false, "falta o código do aluno.");
    var turma = String((e.parameter && e.parameter.turma) || "").slice(0, 30);

    var trava = LockService.getScriptLock();
    trava.waitLock(10000);
    try {
      var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOME_DA_ABA)
        || SpreadsheetApp.getActiveSpreadsheet().insertSheet(NOME_DA_ABA);
      var fixas = ["recebido em", "turma", "aplicativo", "cod"];
      var cabecalho = aba.getLastRow() ? aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0] : [];
      if (!cabecalho.length) cabecalho = fixas.slice();
      Object.keys(campos).forEach(function (c) { if (cabecalho.indexOf(c) < 0) cabecalho.push(c); });
      cabecalho.push("texto completo");
      cabecalho = cabecalho.filter(function (c, j) { return cabecalho.indexOf(c) === j; });
      aba.getRange(1, 1, 1, cabecalho.length).setValues([cabecalho]).setFontWeight("bold");
      var linha = cabecalho.map(function (c) {
        if (c === "recebido em") return new Date();
        if (c === "turma") return turma;
        if (c === "aplicativo") return app;
        if (c === "texto completo") return texto;
        var v = campos[c];
        if (v === undefined) return "";
        // Número puro entra como número (dá para somar e ordenar). O resto leva apóstrofo: a
        // planilha não interpreta como fórmula, nem "27/54" como data.
        return /^\d+$/.test(v) ? Number(v) : "'" + v;
      });
      aba.appendRow(linha);
    } finally {
      trava.releaseLock();
    }
    return resposta(true);
  } catch (erro) {
    return resposta(false, "a planilha não conseguiu guardar agora. Tente de novo.");
  }
}

// Abrir o link no navegador mostra que a planilha está no ar.
function doGet() {
  return ContentService.createTextOutput("Planilha da turma no ar. Os alunos enviam o progresso pelo aplicativo.");
}

function resposta(ok, erro) {
  return ContentService.createTextOutput(JSON.stringify(ok ? { ok: true } : { ok: false, erro: erro }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Mudança de endereço: os aplicativos da Caixa Química passaram a morar em caixaquimica.com.br.

   O progresso fica guardado no navegador, separado por endereço, então quem usava o endereço
   antigo (….vercel.app) começaria do zero no novo. Este arquivo resolve isso sem servidor:

   - No endereço antigo, mostra um aviso com um botão. O botão abre o endereço novo levando o
     que está guardado (só as chaves deste aplicativo) no fim do link, depois do #. Essa parte do
     link não é enviada a servidor nenhum: só o navegador a lê.
   - No endereço novo, ao chegar com #levar=…, guarda os dados e segue. Se já houver progresso
     ali, pergunta antes de trocar.

   Roda antes do aplicativo (script comum no <head>), para o app já abrir com os dados. É o mesmo
   arquivo nas três caixas; o que muda está nos atributos data-prefixo e data-novo da tag. */
(function () {
  "use strict";
  var tag = document.currentScript;
  var PREFIXO = tag.dataset.prefixo;      // ex.: "molbox."
  var NOVO = tag.dataset.novo;            // ex.: "https://caixaquimica.com.br/molbox/"
  var NOME = tag.dataset.nome || "o aplicativo";
  var MARCA = "#levar=";
  var JA_LEVOU = PREFIXO + "mudanca.levou";

  function paraTexto(dados) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(dados)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function deTexto(texto) {
    var b = texto.replace(/-/g, "+").replace(/_/g, "/");
    while (b.length % 4) b += "=";
    return JSON.parse(decodeURIComponent(escape(atob(b))));
  }
  function guardado() {
    var dados = {};
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k.indexOf(PREFIXO) === 0 && k !== JA_LEVOU) dados[k] = localStorage.getItem(k);
    }
    return dados;
  }
  function aviso(texto, botoes) {
    function montar() {
      var barra = document.createElement("div");
      barra.className = "aviso-mudanca";
      barra.setAttribute("role", "status");
      barra.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:1000;display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;padding:12px 16px;background:#17181C;color:#FFFFFF;font:500 15px/1.4 Inter,system-ui,sans-serif;box-shadow:0 -4px 20px rgba(0,0,0,.35)";
      var p = document.createElement("span");
      p.textContent = texto;
      p.style.cssText = "flex:1 1 260px;max-width:640px";
      barra.appendChild(p);
      (botoes || []).concat([{ rotulo: "Fechar", acao: null, discreto: true }]).forEach(function (b) {
        var el = document.createElement("button");
        el.type = "button";
        el.textContent = b.rotulo;
        el.style.cssText = "font:inherit;cursor:pointer;min-height:40px;padding:8px 16px;border-radius:999px;border:1px solid " + (b.discreto ? "#6B7078;background:none;color:#FFFFFF" : "#E3262E;background:#E3262E;color:#FFFFFF");
        el.addEventListener("click", function () { if (b.acao) b.acao(); else barra.remove(); });
        barra.appendChild(el);
      });
      document.body.appendChild(barra);
    }
    if (document.body) montar(); else document.addEventListener("DOMContentLoaded", montar);
  }

  try {
    // 1. Chegada no endereço novo, com os dados no fim do link.
    if (location.hash.indexOf(MARCA) === 0) {
      var chegou = null;
      try { chegou = deTexto(location.hash.slice(MARCA.length)); } catch (e) { chegou = null; }
      history.replaceState(null, "", location.pathname + location.search);
      var chaves = chegou && typeof chegou === "object" ? Object.keys(chegou).filter(function (k) { return k.indexOf(PREFIXO) === 0 && typeof chegou[k] === "string"; }) : [];
      if (!chaves.length) {
        aviso("Não consegui ler o progresso que veio no link. Volte ao endereço antigo e tente de novo.");
      } else {
        var jaTem = localStorage.getItem(PREFIXO + "progresso.v1");
        var igual = jaTem !== null && jaTem === chegou[PREFIXO + "progresso.v1"];
        if (jaTem === null || igual || window.confirm("Já existe um progresso guardado neste endereço. Quer trocar pelo que veio do endereço antigo?")) {
          chaves.forEach(function (k) { localStorage.setItem(k, chegou[k]); });
          aviso("Pronto: o seu progresso veio junto. Este é o endereço novo de " + NOME + ".");
        }
      }
      return;
    }
    // 2. No endereço antigo: o convite para mudar.
    if (/\.vercel\.app$/.test(location.hostname)) {
      var levou = localStorage.getItem(JA_LEVOU) === "1";
      var mostrado = NOVO.replace(/^https:\/\//, "").replace(/\/$/, "");
      aviso(levou
        ? "Você já levou o seu progresso para " + mostrado + ". Use o endereço novo daqui para a frente."
        : NOME + " mudou para " + mostrado + ". Leve o seu progresso com um toque e, se tinha instalado, instale de novo por lá.",
      [{ rotulo: levou ? "Abrir o endereço novo" : "Ir levando o meu progresso", acao: function () {
        var destino = levou ? NOVO : NOVO + MARCA + paraTexto(guardado());
        try { localStorage.setItem(JA_LEVOU, "1"); } catch (e) { /* segue sem marcar */ }
        location.href = destino;
      } }]);
    }
  } catch (e) { /* sem armazenamento ou navegador antigo: o aplicativo segue normalmente */ }
})();

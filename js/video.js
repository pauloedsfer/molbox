/* Modo vídeo: para gravar as aulas do canal. Fica escondido: não aparece em menu nenhum e só liga
   quando o endereço termina em ?video (por exemplo caixaquimica.com.br/molbox/?video). Abrir o
   endereço sem o ?video volta ao normal; nada fica guardado no aparelho.

   No modo vídeo:
   - o texto fica maior (o app inteiro usa rem, então tudo cresce junto);
   - cada clique ou toque deixa um círculo que se abre, para quem assiste acompanhar;
   - o gato do canto e os avisos (mudança de endereço, presente novo) ficam escondidos.
   O progresso, o avatar e as preferências continuam os mesmos.

   É o mesmo arquivo nas três caixas. Roda no <head>, antes do aplicativo. */
(function () {
  "use strict";
  if (!/[?&]video(=|&|$)/.test(location.search)) return;
  var raiz = document.documentElement;
  raiz.classList.add("modo-video");

  var estilo = document.createElement("style");
  estilo.textContent =
    "html.modo-video { font-size: 115%; }" +
    "html.modo-video .gato-da-tela, html.modo-video #avisoPresente, html.modo-video .aviso-mudanca { display: none !important; }" +
    ".toque-video { position: fixed; z-index: 2147483647; width: 46px; height: 46px; margin: -23px 0 0 -23px; border-radius: 50%;" +
    " border: 3px solid rgba(227, 38, 46, 0.9); background: rgba(227, 38, 46, 0.18); pointer-events: none;" +
    " animation: toque-video 0.6s ease-out forwards; }" +
    "@keyframes toque-video { from { transform: scale(0.35); opacity: 1; } to { transform: scale(1.5); opacity: 0; } }";
  document.head.appendChild(estilo);

  // O círculo do toque: nasce onde o dedo (ou o mouse) encostou e some sozinho.
  document.addEventListener("pointerdown", function (e) {
    if (!document.body) return;
    var circulo = document.createElement("div");
    circulo.className = "toque-video";
    circulo.setAttribute("aria-hidden", "true");
    circulo.style.left = e.clientX + "px";
    circulo.style.top = e.clientY + "px";
    document.body.appendChild(circulo);
    setTimeout(function () { circulo.remove(); }, 700);
  }, true);
})();

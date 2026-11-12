/* ORIGEM: Super Atomic Box (telas/gatos.js), adaptado: aqui o gato é o Avogato e fica num canto fixo da
   janela, com uma dica por tela. O desenho e as poses são os mesmos das outras caixas. */
(function () {
"use strict";
function criar(tag, props, filhos) {
  const el = Object.assign(document.createElement(tag), props || {});
  for (const f of filhos || []) el.append(f);
  return el;
}
const SVG = "http://www.w3.org/2000/svg";
function criarSvg(tag, atributos, filhos) {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(atributos || {})) el.setAttribute(k, String(v));
  for (const f of filhos || []) el.append(f);
  return el;
}


const s = (tag, atributos, filhos) => criarSvg(tag, atributos, filhos);

/* As pelagens: o Bohr (Atomic Box), o Avogato (Molbox) e o Kekulé (Organic Box). */
const PELAGENS = {
  bohr: { pelo: "#22232A", luz: "#383A44", contorno: "#9AA0AA", orelha: "#8A4A56", iris: "#F6C945", coleira: "#E3262E", bigode: "#C9CDD4" },
  avogato: { pelo: "#EE8A3C", luz: "#F9B981", contorno: "#A8500F", orelha: "#F7C3A0", iris: "#3E8E5A", coleira: "#164194", bigode: "#FFF3E6" },
  kekule: { pelo: "#F5F1E8", luz: "#FFFFFF", contorno: "#A79F8F", orelha: "#F29BA7", iris: "#2E8B57", coleira: "#1B5E3A", bigode: "#8C8577" },
};

const TRACO = 1.5;

/* ---------- as peças do gato (quadro 120×120, chão em y = 114) ---------- */

function rabo(c, d = "M80 106 C106 108 112 86 101 74 C96 68 100 60 107 60") {
  return s("g", { class: "gato-rabo" }, [
    s("path", { d, fill: "none", stroke: c.contorno, "stroke-width": 10.5, "stroke-linecap": "round" }),
    s("path", { d, fill: "none", stroke: c.pelo, "stroke-width": 7.5, "stroke-linecap": "round" }),
  ]);
}

function tronco(c) {
  const pelo = { fill: c.pelo, stroke: c.contorno, "stroke-width": TRACO, "stroke-linejoin": "round" };
  return [
    s("path", { d: "M40 113 C32 96 40 72 60 70 C80 72 88 96 80 113 Z", ...pelo }),
    s("ellipse", { cx: 60, cy: 92, rx: 9, ry: 13, fill: c.luz, opacity: 0.55 }),
  ];
}

function pata(c, cx, cy = 110) {
  return s("g", {}, [
    s("ellipse", { cx, cy, rx: 8.5, ry: 5.5, fill: c.pelo, stroke: c.contorno, "stroke-width": TRACO }),
    s("path", { d: `M${cx - 2.6} ${cy - 1} v4 M${cx + 2.6} ${cy - 1} v4`, stroke: c.contorno, "stroke-width": 1, "stroke-linecap": "round" }),
  ]);
}

/* O braço erguido, do ombro (ox, oy) até a patinha em (px, py). */
function braco(c, ox, oy, px, py) {
  return s("g", {}, [
    s("path", { d: `M${ox} ${oy} L${px} ${py}`, stroke: c.contorno, "stroke-width": 11, "stroke-linecap": "round" }),
    s("path", { d: `M${ox} ${oy} L${px} ${py}`, stroke: c.pelo, "stroke-width": 8, "stroke-linecap": "round" }),
    s("circle", { cx: px, cy: py, r: 5.6, fill: c.pelo, stroke: c.contorno, "stroke-width": TRACO }),
  ]);
}

/* Os olhos. `tipo`: abertos, felizes (^ ^), sono (‿ ‿), apertados (> <), ou olhando para um lado. */
function olhos(c, tipo = "abertos", olhar = [0, 0]) {
  const linha = { fill: "none", stroke: c.iris, "stroke-width": 2.4, "stroke-linecap": "round", "stroke-linejoin": "round" };
  if (tipo === "felizes") return [s("path", { d: "M42 51 Q48 43 54 51", ...linha }), s("path", { d: "M66 51 Q72 43 78 51", ...linha })];
  if (tipo === "sono") return [s("path", { d: "M42 49 Q48 54 54 49", ...linha }), s("path", { d: "M66 49 Q72 54 78 49", ...linha })];
  if (tipo === "apertados") return [s("path", { d: "M43 45 L53 50 L43 55", ...linha }), s("path", { d: "M77 45 L67 50 L77 55", ...linha })];
  const [dx, dy] = olhar;
  const olho = (cx) => s("g", {}, [
    s("ellipse", { cx, cy: 50, rx: 7, ry: 8, fill: c.iris, stroke: "#0E0F12", "stroke-width": 1 }),
    s("ellipse", { cx: cx + dx, cy: 50.5 + dy, rx: 3, ry: 6, fill: "#0E0F12" }),
    s("circle", { cx: cx + dx - 1.8, cy: 47 + dy, r: 1.7, fill: "#FFFFFF" }),
  ]);
  return [s("g", { class: "gato-olhos" }, [olho(48), olho(72)])];
}

function cabeca(c, { tipoOlhos = "abertos", olhar, lingua = false, boca = "w" } = {}) {
  const pelo = { fill: c.pelo, stroke: c.contorno, "stroke-width": TRACO, "stroke-linejoin": "round" };
  const partes = [
    s("path", { d: "M37 40 L34 12 Q35 9 38 11 L57 28 Z", ...pelo }),
    s("path", { d: "M83 40 L86 12 Q85 9 82 11 L63 28 Z", ...pelo }),
    s("path", { d: "M40 34 L38.5 17 L51 28 Z", fill: c.orelha }),
    s("path", { d: "M80 34 L81.5 17 L69 28 Z", fill: c.orelha }),
    // A cabeça com as bochechas peludas.
    s("path", { d: "M34 50 C34 34 46 26 60 26 C74 26 86 34 86 50 C86 54 85 57 83 60 L88 63 L81 64 C76 70 68 72 60 72 C52 72 44 70 39 64 L32 63 L37 60 C35 57 34 54 34 50 Z", ...pelo }),
    s("path", { d: "M46 31 Q60 26 74 31", fill: "none", stroke: c.luz, "stroke-width": 3, "stroke-linecap": "round", opacity: 0.7 }),
    ...olhos(c, tipoOlhos, olhar),
    s("path", { d: "M57.4 57 h5.2 q1 0 .3 1 l-2.2 2.6 q-.7 .8 -1.4 0 l-2.2 -2.6 q-.7 -1 .3 -1 z", fill: "#E3262E" }),
  ];
  if (boca === "w") partes.push(s("path", { d: "M60 61 Q57 66 52.5 63.5 M60 61 Q63 66 67.5 63.5", fill: "none", stroke: c.bigode, "stroke-width": 1.3, "stroke-linecap": "round" }));
  if (boca === "o") partes.push(s("ellipse", { cx: 60, cy: 64.5, rx: 2.6, ry: 3.2, fill: "#0E0F12", stroke: c.bigode, "stroke-width": 1 }));
  if (lingua) partes.push(s("path", { d: "M57.5 63.5 Q60 70 62.5 63.5 Z", fill: "#F29BA7", stroke: "#B8566A", "stroke-width": 0.8 }));
  partes.push(s("path", { d: "M41 58 L24 55 M41 61 L25 63 M79 58 L96 55 M79 61 L95 63", stroke: c.bigode, "stroke-width": 1, "stroke-linecap": "round", opacity: 0.9 }));
  return partes;
}

function coleira(c) {
  return [
    s("path", { d: "M44 70.5 Q60 78 76 70.5", fill: "none", stroke: c.coleira, "stroke-width": 4.2, "stroke-linecap": "round" }),
    s("circle", { cx: 60, cy: 78.5, r: 3.4, fill: "#F2C230", stroke: "#8A6A10", "stroke-width": 0.9 }),
    s("circle", { cx: 60, cy: 78.5, r: 1, fill: "#8A6A10" }),
  ];
}

/* O gato sentado de frente: a base de quase todas as poses. `cabecaGiro`: graus de inclinação. */
function sentado(c, { rosto = {}, cabecaGiro = 0, patas = "duas", extraAtras = [], extraFrente = [] } = {}) {
  const frente = [];
  if (patas === "duas") frente.push(pata(c, 51), pata(c, 69));
  if (patas === "direita") frente.push(pata(c, 69));
  if (patas === "esquerda") frente.push(pata(c, 51));
  return [
    rabo(c),
    ...extraAtras,
    ...tronco(c),
    ...frente,
    ...coleira(c),
    s("g", cabecaGiro ? { class: "gato-cabeca", transform: `rotate(${cabecaGiro} 60 66)` } : { class: "gato-cabeca" }, cabeca(c, rosto)),
    ...extraFrente,
  ];
}

const bola = (cx, cy, r, cor, classe) => s("g", { class: classe }, [
  s("circle", { cx, cy, r, fill: cor, stroke: "#0E0F12", "stroke-width": 1 }),
  s("circle", { cx: cx - r * 0.3, cy: cy - r * 0.35, r: r * 0.28, fill: "#FFFFFF", opacity: 0.7 }),
]);

const floco = (x, y, classe) => s("path", { class: classe, d: `M${x - 5} ${y} h10 M${x} ${y - 5} v10 M${x - 3.5} ${y - 3.5} l7 7 M${x + 3.5} ${y - 3.5} l-7 7`, stroke: "#DCEEFF", "stroke-width": 1.5, "stroke-linecap": "round" });

/* ---------- as poses ---------- */

const POSES = {
  sentado: (c) => sentado(c),
  feliz: (c) => sentado(c, { rosto: { tipoOlhos: "felizes" }, extraFrente: [
    s("ellipse", { cx: 41, cy: 58, rx: 4, ry: 2.4, fill: "#E3262E", opacity: 0.35 }), s("ellipse", { cx: 79, cy: 58, rx: 4, ry: 2.4, fill: "#E3262E", opacity: 0.35 })] }),

  // Vidrarias: dormindo enroladinho, com o rabo em volta.
  dormindo: (c) => {
    const pelo = { fill: c.pelo, stroke: c.contorno, "stroke-width": TRACO, "stroke-linejoin": "round" };
    return [
      s("path", { d: "M24 112 C14 96 30 80 62 80 C94 80 108 96 98 112 Z", ...pelo }),
      s("path", { d: "M52 88 Q66 82 82 90", fill: "none", stroke: c.luz, "stroke-width": 3, "stroke-linecap": "round", opacity: 0.6 }),
      s("g", { transform: "translate(-22 38) rotate(8 60 60) scale(0.92)" }, cabeca(c, { tipoOlhos: "sono", boca: "w" })),
      s("g", { class: "gato-rabo-dormindo" }, [
        s("path", { d: "M96 108 C84 118 52 118 40 110", fill: "none", stroke: c.contorno, "stroke-width": 10.5, "stroke-linecap": "round" }),
        s("path", { d: "M96 108 C84 118 52 118 40 110", fill: "none", stroke: c.pelo, "stroke-width": 7.5, "stroke-linecap": "round" }),
      ]),
      s("text", { class: "gato-zzz z1", x: 74, y: 62, fill: "#8EC8FF", "font-size": 13, "font-weight": 700, "font-family": "Inter, sans-serif" }, [document.createTextNode("z")]),
      s("text", { class: "gato-zzz z2", x: 84, y: 48, fill: "#8EC8FF", "font-size": 10, "font-weight": 700, "font-family": "Inter, sans-serif" }, [document.createTextNode("z")]),
      s("text", { class: "gato-zzz z3", x: 92, y: 37, fill: "#8EC8FF", "font-size": 8, "font-weight": 700, "font-family": "Inter, sans-serif" }, [document.createTextNode("z")]),
    ];
  },

  // Modelos atômicos: batendo numa bolinha (o átomo de Dalton virou brinquedo).
  bolinhas: (c) => sentado(c, {
    rosto: { olhar: [-2.2, -1], boca: "o" }, cabecaGiro: -7, patas: "direita",
    extraFrente: [
      braco(c, 46, 88, 28, 72),
      bola(18, 58, 7, "#E3262E", "gato-bola"),
      bola(12, 100, 5, "#5BA4F0", "gato-bola b2"),
      bola(100, 104, 4.5, "#C9CDD4", ""),
    ],
  }),

  // Distribuição: os elétrons giram numa órbita em volta da cabeça.
  eletrons: (c) => sentado(c, {
    rosto: { olhar: [0, -2.2] },
    extraFrente: [
      s("ellipse", { cx: 60, cy: 15, rx: 34, ry: 9, fill: "none", stroke: "#8EC8FF", "stroke-width": 1.4, opacity: 0.8 }),
      // Cada elétron vai e volta na horizontal e na vertical, com um quarto de volta de diferença:
      // juntos, os dois movimentos desenham a elipse, e a bolinha continua redonda.
      ...[0, 1, 2].map((k) => s("g", { class: `gato-orbita-x e${k}` }, [s("g", { class: `gato-orbita-y e${k}` }, [
        s("circle", { cx: 60, cy: 15, r: 4.4, fill: "#5BA4F0", stroke: "#0E0F12", "stroke-width": 1 }),
        s("circle", { cx: 58.6, cy: 13.6, r: 1.2, fill: "#FFFFFF", opacity: 0.8 }),
      ])])),
    ],
  }),

  // Substâncias e misturas: de lupa, com o olho enorme atrás da lente.
  lupa: (c) => sentado(c, {
    patas: "direita",
    extraFrente: [
      braco(c, 46, 88, 30, 76),
      s("path", { d: "M32 73 L40 62", stroke: "#8A6A10", "stroke-width": 4.5, "stroke-linecap": "round" }),
      s("circle", { cx: 47, cy: 50, r: 14.5, fill: "#BFE0FF", opacity: 0.35 }),
      s("ellipse", { cx: 47, cy: 50, rx: 9.5, ry: 11, fill: c.iris, stroke: "#0E0F12", "stroke-width": 1 }),
      s("ellipse", { cx: 47, cy: 50.5, rx: 4.2, ry: 8.2, fill: "#0E0F12" }),
      s("circle", { cx: 44.4, cy: 46, r: 2.4, fill: "#FFFFFF" }),
      s("circle", { cx: 47, cy: 50, r: 14.5, fill: "none", stroke: "#F2C230", "stroke-width": 3.2 }),
      s("path", { d: "M38 41 Q43 36 50 37", fill: "none", stroke: "#FFFFFF", "stroke-width": 1.6, "stroke-linecap": "round", opacity: 0.8 }),
    ],
  }),

  // Estados da matéria: com frio (cachecol, tremendo, flocos caindo).
  frio: (c) => [s("g", { class: "gato-treme" }, sentado(c, {
    rosto: { tipoOlhos: "apertados", boca: "w" },
    extraFrente: [
      s("path", { d: "M40 67 Q60 79 80 67 L81 74 Q60 86 39 74 Z", fill: "#E3262E", stroke: "#8A1016", "stroke-width": 1 }),
      s("path", { d: "M66 76 l8 -2 l3 20 l-9 2 z", fill: "#E3262E", stroke: "#8A1016", "stroke-width": 1 }),
      s("path", { d: "M46 73 l3 5 M54 76 l2 5 M62 77 l1 5", stroke: "#FFFFFF", "stroke-width": 1.2, opacity: 0.6 }),
    ],
  })), floco(16, 26, "gato-floco f1"), floco(104, 16, "gato-floco f2"), floco(12, 74, "gato-floco f3"), floco(108, 60, "gato-floco f1")],

  // ...ou com calor: língua de fora, gotas de suor e o ar quente subindo.
  calor: (c) => [
    ...[10, 22, 104].map((x, i) => s("path", { class: `gato-vapor v${i + 1}`, d: `M${x} 108 q5 -9 0 -18 q-5 -9 0 -18`, fill: "none", stroke: "#FF8A3D", "stroke-width": 2, "stroke-linecap": "round", opacity: 0.85 })),
    ...sentado(c, { rosto: { tipoOlhos: "sono", boca: "", lingua: true } }),
    s("path", { class: "gato-gota g1", d: "M90 30 Q95 39 90 42 Q85 39 90 30 Z", fill: "#8EC8FF", stroke: "#3D7FC4", "stroke-width": 0.8 }),
    s("path", { class: "gato-gota g2", d: "M30 34 Q34 41 30 43.5 Q26 41 30 34 Z", fill: "#8EC8FF", stroke: "#3D7FC4", "stroke-width": 0.8 }),
  ],

  // Tabela periódica: sentado em cima do quadradinho do carbono.
  tabela: (c) => [
    s("g", { transform: "translate(8 -20) scale(0.86)" }, sentado(c, { rosto: { tipoOlhos: "felizes" } })),
    s("rect", { x: 22, y: 78, width: 76, height: 38, rx: 5, fill: "#9FD8A6", stroke: "#0E0F12", "stroke-width": 1.5 }),
    s("text", { x: 30, y: 91, fill: "#111214", "font-size": 9, "font-family": "Inter, sans-serif" }, [document.createTextNode("6")]),
    s("text", { x: 60, y: 108, "text-anchor": "middle", fill: "#111214", "font-size": 22, "font-weight": 700, "font-family": "Inter, sans-serif" }, [document.createTextNode("C")]),
    s("g", { transform: "translate(8 -20) scale(0.86)" }, [pata(c, 51, 113), pata(c, 69, 113)]),
  ],

  // Início: espiando de dentro da caixa azul do Molbox, com o "mol".
  caixa: (c) => [
    s("g", { transform: "translate(0 4)" }, [s("g", { class: "gato-cabeca" }, cabeca(c, { olhar: [0, 1] }))]),
    s("rect", { x: 14, y: 70, width: 92, height: 46, rx: 8, fill: "#0F2F6E", stroke: "#FFFFFF", "stroke-width": 2 }),
    s("path", { d: "M14 79 H106", stroke: "#FFFFFF", "stroke-opacity": 0.25, "stroke-width": 1.5 }),
    s("text", { x: 60, y: 106, "text-anchor": "middle", fill: "#FFFFFF", "font-size": 22, "font-weight": 700, "font-style": "italic", "font-family": "'Exo 2', Inter, Arial, sans-serif" }, [document.createTextNode("mol")]),
    s("circle", { cx: 92, cy: 88, r: 3.4, fill: "#E84910" }),
    pata(c, 36, 71), pata(c, 84, 71),
  ],
};

function desenhoDoGato(pose = "sentado", rotulo = "", pelagem = "avogato") {
  const atributos = { viewBox: "0 0 120 120", class: `gato-desenho gato-${pose}` };
  if (rotulo) { atributos.role = "img"; atributos["aria-label"] = rotulo; } else atributos["aria-hidden"] = "true";
  return s("svg", atributos, (POSES[pose] || POSES.sentado)(PELAGENS[pelagem] || PELAGENS.avogato));
}

/* As animações vêm ligadas para todo mundo. Quem prefere tudo parado desliga no balão do gato, e
   a escolha fica guardada neste aparelho. */
const CHAVE_MOVIMENTO = "molbox.movimento";
function movimentoLigado() {
  try { return localStorage.getItem(CHAVE_MOVIMENTO) !== "nao"; } catch (e) { return true; }
}
function aplicarMovimento() {
  document.documentElement.classList.toggle("com-movimento", movimentoLigado());
}
function escolherMovimento(ligado) {
  try { localStorage.setItem(CHAVE_MOVIMENTO, ligado ? "sim" : "nao"); } catch (e) { /* sem armazenamento: vale só agora */ }
  aplicarMovimento();
}

/* O gato escondido: um botão no canto do cartão, com só as orelhas à mostra. Cada toque mostra a
   próxima curiosidade num balão. */
function gatoEscondido({ pose = "sentado", falas = [], onde = "direita" }) {
  let i = -1;
  const frase = criar("span", {});
  frase.setAttribute("aria-live", "polite");
  const voltar = criar("button", { type: "button", className: "gato-voltar", textContent: "▼" });
  voltar.setAttribute("aria-label", "Esconder o gato de novo");
  const movimento = criar("button", { type: "button", className: "gato-movimento" });
  const rotuloDoMovimento = () => { movimento.textContent = movimentoLigado() ? "⏸ Parar as animações" : "▶ Ligar as animações"; };
  movimento.addEventListener("click", () => { escolherMovimento(!movimentoLigado()); rotuloDoMovimento(); });
  const balao = criar("div", { className: "balao-gato", hidden: true }, [frase, voltar, movimento]);
  const botao = criar("button", { type: "button", className: `gato-escondido ${onde} pose-${pose}` }, [desenhoDoGato(pose)]);
  botao.setAttribute("aria-label", "Avogato, o gato: toque para uma dica desta tela");
  botao.setAttribute("aria-expanded", "false");
  const caixa = criar("div", { className: `esconderijo ${onde}` }, [balao, botao]);
  let relogio = 0;

  function esconder() {
    clearTimeout(relogio);
    botao.classList.remove("aparecendo");
    botao.setAttribute("aria-expanded", "false");
    balao.hidden = true;
    document.removeEventListener("pointerdown", foraDoGato, true);
    document.removeEventListener("keydown", teclaEsc, true);
  }
  // Um toque fora do gato ou a tecla Esc mandam o gato de volta para baixo.
  function foraDoGato(e) { if (!caixa.contains(e.target)) esconder(); }
  function teclaEsc(e) { if (e.key === "Escape") { esconder(); botao.focus(); } }

  botao.addEventListener("click", () => {
    i = (i + 1) % falas.length;
    botao.classList.add("aparecendo");
    botao.setAttribute("aria-expanded", "true");
    balao.hidden = false;
    frase.textContent = falas[i];
    rotuloDoMovimento();
    document.addEventListener("pointerdown", foraDoGato, true);
    document.addEventListener("keydown", teclaEsc, true);
    // O balão também some sozinho (o tempo cresce com o tamanho da frase).
    clearTimeout(relogio);
    relogio = setTimeout(esconder, Math.max(7000, falas[i].length * 80));
  });
  voltar.addEventListener("click", () => { esconder(); botao.focus(); });
  return caixa;
}

/* A surpresa: o gato entra pelo canto por alguns segundos com uma fala curta. */
let relogioSurpresa = 0;
function surpresaDoGato(pose, fala) {
  let caixa = document.getElementById("surpresa-gato");
  if (!caixa) {
    caixa = criar("div", { id: "surpresa-gato", className: "surpresa-gato" });
    caixa.setAttribute("role", "status");
    document.body.append(caixa);
  }
  caixa.replaceChildren(desenhoDoGato(pose), criar("p", { textContent: fala }));
  caixa.classList.remove("visivel");
  void caixa.offsetWidth;   // reinicia a animação se já estava aparecendo
  caixa.classList.add("visivel");
  clearTimeout(relogioSurpresa);
  relogioSurpresa = setTimeout(() => caixa.classList.remove("visivel"), 4500);
}


/* ---------- o gato da tela ----------
   Um gato só, no canto de baixo da janela, em todas as telas: ficam à mostra as orelhas e os
   olhos; um toque e ele sobe com uma dica da tela em que o aluno está. */
const FALAS_DA_TELA = {
 "tela-mol": [
  "sentado",
  [
   "Oi! Eu sou o Avogato, o gato do Molbox. Tem uma dica minha em cada tela: é só me chamar.",
   "Mol é um pacote com 6,02 × 10²³ unidades. Igual à dúzia, só que muito, muito maior.",
   "Meu nome vem de Avogadro, o dono do número."
  ]
 ],
 "tela-massa": [
  "lupa",
  [
   "Massa molar é quanto pesa um mol da substância. Some as massas de todos os átomos da fórmula.",
   "Cuidado com o parêntese: em Ca(OH)₂, o 2 vale para o O e para o H."
  ]
 ],
 "tela-ponte": [
  "bolinhas",
  [
   "Gramas de um lado, partículas do outro. O mol é a ponte no meio: passe sempre por ele.",
   "Para atravessar a ponte você só precisa de duas coisas: a massa molar e o número de Avogadro."
  ]
 ],
 "tela-balancear": [
  "bolinhas",
  [
   "Balancear é contar: o que entra tem que sair. Nenhum átomo se perde.",
   "Nunca mexa nos índices da fórmula: só nos coeficientes, os números da frente.",
   "Deixe o oxigênio e o hidrogênio por último. Costuma facilitar."
  ]
 ],
 "tela-esteq": [
  "sentado",
  [
   "Estequiometria é receita de bolo: a proporção vem da equação balanceada.",
   "O caminho é sempre o mesmo: gramas, mol, proporção, mol, gramas."
  ]
 ],
 "tela-treino-balanceamento": [
  "bolinhas",
  [
   "Conte átomo por átomo dos dois lados antes de conferir.",
   "Travou? Comece pelo elemento que aparece em menos substâncias."
  ]
 ],
 "tela-solucoes": [
  "lupa",
  [
   "Concentração é quanto soluto tem em cada litro de solução. Litro da solução pronta, não do solvente!",
   "mL não é L. Divida por 1000 antes de fazer a conta."
  ]
 ],
 "tela-preparo": [
  "sentado",
  [
   "Sempre o ácido na água, devagar. Nunca o contrário.",
   "Ao diluir, a quantidade de soluto não muda: só entra mais água. Por isso C₁V₁ = C₂V₂."
  ]
 ],
 "tela-ph": [
  "lupa",
  [
   "pH menor que 7 é ácido, maior que 7 é básico, e 7 é neutro (a 25 °C).",
   "Cada unidade de pH vale dez vezes: pH 3 é dez vezes mais ácido que pH 4."
  ]
 ],
 "tela-equivalente": [
  "sentado",
  [
   "O equivalente conta quantos H⁺ ou OH⁻ cada fórmula entrega. É só isso."
  ]
 ],
 "tela-bancada": [
  "lupa",
  [
   "Perto da viragem, goteje devagar. Uma gota a mais muda tudo.",
   "Leia a bureta na altura dos olhos, na parte de baixo do menisco."
  ]
 ],
 "tela-titulacao": [
  "lupa",
  [
   "O ponto de equivalência é onde a curva dá o salto.",
   "O indicador certo é o que muda de cor dentro do salto da curva."
  ]
 ],
 "tela-nomenclatura": [
  "sentado",
  [
   "Ácido sem oxigênio termina em ídrico, e o sal dele termina em eto: clorídrico, cloreto.",
   "Ico vira ato, oso vira ito. Sulfúrico, sulfato. Sulfuroso, sulfito."
  ]
 ],
 "tela-tabela": [
  "lupa",
  [
   "A tabela é o mapa: a massa atômica de cada elemento está nela.",
   "Toque num elemento para ver os dados dele."
  ]
 ],
 "tela-treino": [
  "sentado",
  [
   "Errar aqui não custa nada. Leia o diagnóstico: ele mostra onde a conta desviou.",
   "Confira a unidade antes de responder. Metade dos erros mora ali.",
   "Travou? Use a dica ou pule. Mas volte depois, combinado?"
  ]
 ],
 "tela-progresso": [
  "feliz",
  [
   "Olha quanto você já andou! Um mol de passos começa com o primeiro.",
   "Seu professor pediu o progresso? É aqui, com o seu código e sem o seu nome."
  ]
 ],
 "tela-presentes": [
  "feliz",
  [
   "Cada troféu é um composto de verdade que você nomeou. Ainda tem muitos escondidos."
  ]
 ],
 "tela-avatar": [
  "feliz",
  [
   "Ficou a sua cara? Toque em Surpresa para ver uma versão maluca.",
   "Cada título do Treino abre um acessório novo. Eu queria um jaleco do meu tamanho."
  ]
 ],
 "tela-sobre": [
  "dormindo",
  [
   "Amedeo Avogadro propôs, em 1811, que volumes iguais de gases têm o mesmo número de moléculas. O número com o nome dele só foi medido bem depois.",
   "Zzz... seis vírgula zero dois... vezes dez... zzz."
  ]
 ]
};

function gatoDaTela(idDaTela) {
  let canto = document.getElementById("gato-da-tela");
  if (!canto) {
    canto = criar("div", { id: "gato-da-tela", className: "gato-da-tela" });
    document.body.append(canto);
  }
  const f = FALAS_DA_TELA[idDaTela];
  canto.replaceChildren(...(f ? [gatoEscondido({ pose: f[0], falas: f[1] })] : []));
}

/* No Treino, o gato comemora as sequências de acertos e consola depois de uma escapada. */
let seguidos = 0;
const COMEMORA = { 3: "Três seguidas! Tá voando.", 5: "Cinco seguidas! Já posso te chamar de colega?", 10: "Dez seguidas. Eu tiraria o chapéu, se tivesse um.", 20: "Vinte seguidas?! Me ensina!" };
function reagirAoTreino(certo) {
  if (certo) {
    seguidos += 1;
    if (COMEMORA[seguidos]) surpresaDoGato("feliz", COMEMORA[seguidos]);
  } else {
    if (seguidos >= 3) surpresaDoGato("sentado", "Uma escapou. Acontece: leia o diagnóstico e siga em frente.");
    seguidos = 0;
  }
}

aplicarMovimento();

window.Gatos = { desenhoDoGato, gatoEscondido, surpresaDoGato, gatoDaTela, reagirAoTreino };
})();

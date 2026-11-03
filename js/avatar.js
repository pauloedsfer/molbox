/* ORIGEM: dados/avatar.js (Super Organic Box), convertido por ferramentas/converter_modulo.cjs.
   Mude lá e converta de novo: os dois aplicativos usam a mesma lógica. */
(function () {
  "use strict";
  /* Avatar do aluno: um(a) cientista estilizado(a), neutro(a) em gênero, que o aluno monta com tom de
     pele, cabelo e a cor da gola do jaleco. Os acessórios de laboratório abrem com os títulos do
     Treino (dados/presentes.js, TITULOS): cada título novo traz um acessório, e o aluno escolhe quais
     usar. Presente é enfeite: nada no app depende do avatar.

     Funções puras. `formasDoAvatar` devolve a lista de formas SVG ({ tag, atributos }); a tela as
     cria com createElementNS, sem innerHTML. Só valores desta lista entram nos atributos: o que vem
     do armazenamento passa por `lerAvatar`, que troca qualquer valor desconhecido pelo padrão. */

  const PELES = [
    { id: "p1", nome: "Clara", cor: "#F6D7C3" },
    { id: "p2", nome: "Média clara", cor: "#E8B48F" },
    { id: "p3", nome: "Média", cor: "#C68B5E" },
    { id: "p4", nome: "Morena", cor: "#9A6440" },
    { id: "p5", nome: "Escura", cor: "#6B4226" },
  ];

  const CABELOS = [
    { id: "curto", nome: "Curto" },
    { id: "longo", nome: "Longo" },
    { id: "cacheado", nome: "Cacheado" },
    { id: "coque", nome: "Coque" },
    { id: "raspado", nome: "Raspado" },
  ];

  const CORES_CABELO = [
    { id: "preto", nome: "Preto", cor: "#2B2118" },
    { id: "castanho", nome: "Castanho", cor: "#6B4423" },
    { id: "ruivo", nome: "Ruivo", cor: "#B5562B" },
    { id: "loiro", nome: "Loiro", cor: "#D9B25F" },
    { id: "grisalho", nome: "Grisalho", cor: "#A8A8A8" },
    { id: "azul", nome: "Azul", cor: "#3F6FD8" },
  ];

  const GOLAS = [
    { id: "verde", nome: "Verde", cor: "#2E8B57" },
    { id: "azul", nome: "Azul", cor: "#3F51B5" },
    { id: "rosa", nome: "Rosa", cor: "#D63A7A" },
    { id: "laranja", nome: "Laranja", cor: "#E06A1B" },
    { id: "roxo", nome: "Roxo", cor: "#8E44AD" },
  ];

  /* `titulo`: índice em TITULOS que abre o acessório. O jaleco é a base de todo avatar. */
  const ACESSORIOS = [
    { id: "oculos", nome: "Óculos de proteção", titulo: 1 },
    { id: "luvas", nome: "Luvas", titulo: 2 },
    { id: "caneta", nome: "Caneta no bolso", titulo: 3 },
    { id: "tubo", nome: "Tubo de ensaio", titulo: 4 },
    { id: "balao", nome: "Balão volumétrico", titulo: 5 },
    { id: "capelo", nome: "Capelo de formatura", titulo: 6 },
  ];

  const PADRAO = { pele: "p3", cabelo: "curto", corCabelo: "castanho", gola: "verde", acessorios: [] };

  const achar = (lista, id) => lista.find((x) => x.id === id);

  /* Valor guardado -> avatar válido. Acessório que o título ainda não abre fica de fora. */
  function lerAvatar(bruto, indiceDoTitulo = 0) {
    const d = bruto && typeof bruto === "object" && !Array.isArray(bruto) ? bruto : {};
    const valido = (lista, v, padrao) => (typeof v === "string" && achar(lista, v) ? v : padrao);
    const usados = Array.isArray(d.acessorios) ? d.acessorios : [];
    return {
      pele: valido(PELES, d.pele, PADRAO.pele),
      cabelo: valido(CABELOS, d.cabelo, PADRAO.cabelo),
      corCabelo: valido(CORES_CABELO, d.corCabelo, PADRAO.corCabelo),
      gola: valido(GOLAS, d.gola, PADRAO.gola),
      acessorios: ACESSORIOS.filter((a) => usados.includes(a.id) && a.titulo <= indiceDoTitulo).map((a) => a.id),
    };
  }

  /* Cada acessório, aberto ou não, com o título que o abre. */
  function estadoDosAcessorios(indiceDoTitulo, titulos) {
    return ACESSORIOS.map((a) => ({ ...a, aberto: a.titulo <= indiceDoTitulo, tituloQueAbre: titulos[a.titulo] }));
  }

  /* Os acessórios que um título novo abriu (para a comemoração). */
  function acessoriosDoTitulo(indice) {
    return ACESSORIOS.filter((a) => a.titulo === indice);
  }

  const f = (tag, atributos) => ({ tag, atributos });

  function cabelo(estilo, cor, atras) {
    // `atras`: a parte que fica atrás da cabeça (desenhada antes do rosto).
    if (estilo === "raspado") return atras ? [] : [f("path", { d: "M38 46 Q60 24 82 46 Q76 34 60 32 Q44 34 38 46 Z", fill: cor, opacity: "0.55" })];
    if (estilo === "longo") return atras ? [f("path", { d: "M34 50 Q34 22 60 22 Q86 22 86 50 L88 92 L32 92 Z", fill: cor })] : [f("path", { d: "M36 48 Q40 26 60 26 Q80 26 84 48 Q72 36 60 38 Q48 36 36 48 Z", fill: cor })];
    if (estilo === "cacheado") {
      if (atras) return [f("circle", { cx: 60, cy: 40, r: 27, fill: cor })];
      return [36, 46, 56, 66, 76, 84].map((x, i) => f("circle", { cx: x, cy: i % 2 ? 30 : 34, r: 8, fill: cor }));
    }
    if (estilo === "coque") return atras ? [f("circle", { cx: 60, cy: 18, r: 10, fill: cor })] : [f("path", { d: "M36 48 Q38 26 60 26 Q82 26 84 48 Q72 34 60 36 Q48 34 36 48 Z", fill: cor })];
    return atras ? [] : [f("path", { d: "M36 48 Q36 24 60 24 Q84 24 84 48 Q76 32 60 34 Q44 32 36 48 Z", fill: cor })];   // curto
  }

  /* Formas do avatar num viewBox 0 0 120 140, de trás para a frente. */
  function formasDoAvatar(av) {
    const a = lerAvatar(av, 99);
    const pele = achar(PELES, a.pele).cor;
    const corCabelo = achar(CORES_CABELO, a.corCabelo).cor;
    const gola = achar(GOLAS, a.gola).cor;
    const usa = (id) => a.acessorios.includes(id);
    const formas = [];
    formas.push(...cabelo(a.cabelo, corCabelo, true));
    // jaleco (corpo), gola e botões
    formas.push(f("path", { d: "M24 140 Q24 98 60 92 Q96 98 96 140 Z", fill: "#F7F7F5", stroke: "#B9BDB8", "stroke-width": 1.5 }));
    formas.push(f("path", { d: "M48 94 L60 116 L72 94 L66 92 L60 104 L54 92 Z", fill: gola }));
    formas.push(f("circle", { cx: 60, cy: 124, r: 1.8, fill: "#B9BDB8" }), f("circle", { cx: 60, cy: 134, r: 1.8, fill: "#B9BDB8" }));
    formas.push(f("rect", { x: 70, y: 118, width: 14, height: 10, rx: 2, fill: "none", stroke: "#B9BDB8", "stroke-width": 1.2 }));   // bolso
    // pescoço e rosto
    formas.push(f("rect", { x: 53, y: 76, width: 14, height: 18, rx: 5, fill: pele }));
    formas.push(f("ellipse", { cx: 60, cy: 54, rx: 23, ry: 26, fill: pele }));
    formas.push(f("circle", { cx: 51, cy: 54, r: 2.6, fill: "#2B2118" }), f("circle", { cx: 69, cy: 54, r: 2.6, fill: "#2B2118" }));
    formas.push(f("path", { d: "M52 66 Q60 72 68 66", fill: "none", stroke: "#2B2118", "stroke-width": 2, "stroke-linecap": "round" }));
    formas.push(...cabelo(a.cabelo, corCabelo, false));
    if (usa("oculos")) {
      formas.push(f("rect", { x: 40, y: 46, width: 40, height: 15, rx: 7, fill: "#9FD8F0", "fill-opacity": 0.45, stroke: "#2F6F8F", "stroke-width": 2.2 }));
      formas.push(f("path", { d: "M37 52 L40 52 M80 52 L83 52", stroke: "#2F6F8F", "stroke-width": 2.2 }));
    }
    if (usa("caneta")) formas.push(f("rect", { x: 74, y: 112, width: 3, height: 12, rx: 1, fill: "#3F51B5" }), f("rect", { x: 79, y: 114, width: 3, height: 10, rx: 1, fill: "#C62828" }));
    const corLuva = "#7FC4E8";
    const mao = (x) => (usa("luvas") ? f("circle", { cx: x, cy: 128, r: 7, fill: corLuva, stroke: "#4B8DB0", "stroke-width": 1.2 }) : f("circle", { cx: x, cy: 128, r: 6.5, fill: pele }));
    if (usa("tubo")) formas.push(f("rect", { x: 17, y: 104, width: 8, height: 24, rx: 4, fill: "#E8F6FB", stroke: "#4B8DB0", "stroke-width": 1.4 }), f("rect", { x: 18.5, y: 116, width: 5, height: 10, rx: 2.5, fill: "#7CB342" }));
    if (usa("balao")) {
      formas.push(f("path", { d: "M99 98 L103 98 L103 112 Q112 118 112 126 Q112 136 101 136 Q90 136 90 126 Q90 118 99 112 Z", fill: "#E8F6FB", stroke: "#4B8DB0", "stroke-width": 1.4 }));
      formas.push(f("path", { d: "M91.5 127 Q101 123 110.5 127 Q110 135 101 135 Q92 135 91.5 127 Z", fill: "#D63A7A" }));
    }
    formas.push(mao(22), mao(98));
    if (usa("capelo")) {
      formas.push(f("path", { d: "M30 26 L60 14 L90 26 L60 38 Z", fill: "#1F2A33" }));
      formas.push(f("rect", { x: 46, y: 28, width: 28, height: 8, fill: "#1F2A33" }));
      formas.push(f("path", { d: "M84 28 L86 42", stroke: "#E0B53A", "stroke-width": 2 }), f("circle", { cx: 86, cy: 43, r: 2.4, fill: "#E0B53A" }));
    }
    return formas;
  }

  /* Frase para o leitor de tela (o desenho só reforça). */
  function descricaoDoAvatar(av) {
    const a = lerAvatar(av, 99);
    const base = `Avatar: cientista de jaleco com gola ${achar(GOLAS, a.gola).nome.toLowerCase()}, pele ${achar(PELES, a.pele).nome.toLowerCase()}, cabelo ${achar(CABELOS, a.cabelo).nome.toLowerCase()}`
      + (a.cabelo === "raspado" ? "" : ` ${achar(CORES_CABELO, a.corCabelo).nome.toLowerCase()}`);
    const itens = a.acessorios.map((id) => achar(ACESSORIOS, id).nome.toLowerCase());
    return itens.length ? `${base}, com ${itens.length > 1 ? `${itens.slice(0, -1).join(", ")} e ${itens.at(-1)}` : itens[0]}.` : `${base}.`;
  }

  window.Avatar = { PELES, CABELOS, CORES_CABELO, GOLAS, ACESSORIOS, AVATAR_PADRAO: PADRAO, lerAvatar, estadoDosAcessorios, acessoriosDoTitulo, formasDoAvatar, descricaoDoAvatar };
})();

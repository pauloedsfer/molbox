/* ORIGEM: dados/avatar.js (Super Organic Box), convertido por ferramentas/converter_modulo.cjs.
   Mude lá e converta de novo: os dois aplicativos usam a mesma lógica. */
(function () {
  "use strict";
  /* Avatar do aluno: um(a) cientista em estilo de desenho animado (cabeça grande, contorno escuro,
     olhos brilhantes), neutro(a) em gênero, que o aluno monta com pele, cabelo, cor do cabelo, cor da
     gola do jaleco, emoção e acessórios.

     - As peles naturais estão sempre abertas. As peles de fantasia ("malucas") abrem com as paletas
       de presente: cada paleta aberta destrava a pele da mesma cor. `paletas` lista os ids das paletas
       dos dois aplicativos (Super Organic Box e SUPER MOLBOX) que abrem aquela pele.
     - Os acessórios de laboratório abrem com os títulos do Treino; os enfeites livres estão sempre
       abertos.
     - O crachá (formasDoCracha) mostra o avatar com o apelido, o título e os números do aluno.

     Funções puras. `formasDoAvatar` e `formasDoCracha` devolvem a lista de formas SVG
     ({ tag, atributos, filhos?, texto? }); a tela as cria com createElementNS, sem montar HTML. Só
     valores destas listas entram nos atributos: o que vem do armazenamento passa por `lerAvatar`, que
     troca qualquer valor desconhecido pelo padrão. O texto do crachá entra como texto (textContent). */

  const VIEWBOX_AVATAR = "0 0 140 160";
  const CONTORNO = "#2B2A33";

  const PELES = [
    { id: "p1", nome: "Clara", cor: "#F8DCC8" },
    { id: "p2", nome: "Média clara", cor: "#EDB993" },
    { id: "p3", nome: "Média", cor: "#CC9066" },
    { id: "p6", nome: "Oliva", cor: "#B8875A" },
    { id: "p4", nome: "Morena", cor: "#9A6440" },
    { id: "p5", nome: "Escura", cor: "#6B4226" },
    // Peles de fantasia: abrem com as paletas de presente.
    { id: "verde", nome: "Verde-folha", cor: "#8FD07A", fantasia: true, paletas: ["clorofila", "bromocresol"] },
    { id: "azul", nome: "Azul-céu", cor: "#8EA2F2", fantasia: true, paletas: ["indigo", "bromocresol"] },
    { id: "rosa", nome: "Rosa-chiclete", cor: "#F59AB8", fantasia: true, paletas: ["alizarina", "fenolftaleina"] },
    { id: "laranja", nome: "Laranja-cenoura", cor: "#FFB061", fantasia: true, paletas: ["betacaroteno", "alaranjado"] },
    { id: "roxo", nome: "Roxo-uva", cor: "#C79BEA", fantasia: true, paletas: ["antocianina", "tornassol"] },
  ];

  const CABELOS = [
    { id: "curto", nome: "Curto" },
    { id: "franja", nome: "Franja" },
    { id: "longo", nome: "Longo" },
    { id: "cacheado", nome: "Cacheado" },
    { id: "blackpower", nome: "Black power" },
    { id: "coque", nome: "Coque" },
    { id: "rabo", nome: "Rabo de cavalo" },
    { id: "trancas", nome: "Tranças" },
    { id: "moicano", nome: "Moicano" },
    { id: "raspado", nome: "Raspado" },
  ];

  const CORES_CABELO = [
    { id: "preto", nome: "Preto", cor: "#2B2118" },
    { id: "castanho", nome: "Castanho", cor: "#6B4423" },
    { id: "ruivo", nome: "Ruivo", cor: "#C0582B" },
    { id: "loiro", nome: "Loiro", cor: "#E2B85F" },
    { id: "grisalho", nome: "Grisalho", cor: "#B4B4B4" },
    { id: "azul", nome: "Azul", cor: "#3F6FD8" },
    { id: "rosa", nome: "Rosa", cor: "#E85A9B" },
    { id: "verde", nome: "Verde", cor: "#3FA86B" },
    { id: "roxo", nome: "Roxo", cor: "#7B4FC9" },
  ];

  const GOLAS = [
    { id: "verde", nome: "Verde", cor: "#2E8B57" },
    { id: "azul", nome: "Azul", cor: "#3F51B5" },
    { id: "rosa", nome: "Rosa", cor: "#D63A7A" },
    { id: "laranja", nome: "Laranja", cor: "#E06A1B" },
    { id: "roxo", nome: "Roxo", cor: "#8E44AD" },
    { id: "amarelo", nome: "Amarelo", cor: "#E9B824" },
    { id: "preto", nome: "Preto", cor: "#2B2A33" },
  ];

  // `expressao`: como a emoção entra na descrição para o leitor de tela, sem marcar gênero.
  const EMOCOES = [
    { id: "feliz", nome: "Feliz", expressao: "com expressão feliz" },
    { id: "rindo", nome: "Rindo", expressao: "rindo" },
    { id: "surpreso", nome: "Surpresa", expressao: "com expressão de surpresa" },
    { id: "pensativo", nome: "Pensando", expressao: "com expressão pensativa" },
    { id: "piscadela", nome: "Piscadela", expressao: "piscando um olho" },
    { id: "concentrado", nome: "Concentração", expressao: "com expressão concentrada" },
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

  /* Enfeites que todo mundo pode usar desde o começo. */
  const ENFEITES = [
    { id: "grau", nome: "Óculos de grau" },
    { id: "sardas", nome: "Sardas" },
    { id: "bigode", nome: "Bigode" },
    { id: "laco", nome: "Laço no cabelo" },
  ];

  const PADRAO = { pele: "p3", cabelo: "curto", corCabelo: "castanho", gola: "verde", emocao: "feliz", acessorios: [], enfeites: [] };

  const achar = (lista, id) => lista.find((x) => x.id === id);

  function peleAberta(pele, paletasAbertas) {
    if (!pele.fantasia) return true;
    const abertas = Array.isArray(paletasAbertas) ? paletasAbertas : [];
    return pele.paletas.some((p) => abertas.includes(p));
  }

  /* Valor guardado -> avatar válido. Acessório que o título ainda não abre e pele de fantasia cuja
     paleta ainda não abriu ficam de fora. */
  function lerAvatar(bruto, indiceDoTitulo = 0, paletasAbertas = []) {
    const d = bruto && typeof bruto === "object" && !Array.isArray(bruto) ? bruto : {};
    const valido = (lista, v, padrao) => (typeof v === "string" && achar(lista, v) ? v : padrao);
    const usados = Array.isArray(d.acessorios) ? d.acessorios : [];
    const enfeites = Array.isArray(d.enfeites) ? d.enfeites : [];
    const pele = achar(PELES, d.pele);
    return {
      pele: pele && peleAberta(pele, paletasAbertas) ? pele.id : PADRAO.pele,
      cabelo: valido(CABELOS, d.cabelo, PADRAO.cabelo),
      corCabelo: valido(CORES_CABELO, d.corCabelo, PADRAO.corCabelo),
      gola: valido(GOLAS, d.gola, PADRAO.gola),
      emocao: valido(EMOCOES, d.emocao, PADRAO.emocao),
      acessorios: ACESSORIOS.filter((a) => usados.includes(a.id) && a.titulo <= indiceDoTitulo).map((a) => a.id),
      enfeites: ENFEITES.filter((e) => enfeites.includes(e.id)).map((e) => e.id),
    };
  }

  /* Cada pele, aberta ou não, com a paleta que a abre. `nomesDePaleta`: { id: nome } do aplicativo. */
  function estadoDasPeles(paletasAbertas, nomesDePaleta = {}) {
    return PELES.map((p) => {
      const aberta = peleAberta(p, paletasAbertas);
      const daqui = (p.paletas || []).filter((id) => nomesDePaleta[id]).map((id) => nomesDePaleta[id]);
      const falta = aberta ? "" : `abre com a paleta ${daqui.length ? daqui.join(" ou ") : "da mesma cor"}`;
      return { ...p, aberta, falta };
    });
  }

  /* Cada acessório, aberto ou não, com o título que o abre. */
  function estadoDosAcessorios(indiceDoTitulo, titulos) {
    return ACESSORIOS.map((a) => ({ ...a, aberto: a.titulo <= indiceDoTitulo, tituloQueAbre: titulos[a.titulo] }));
  }

  /* Os acessórios que um título novo abriu (para a comemoração). */
  function acessoriosDoTitulo(indice) {
    return ACESSORIOS.filter((a) => a.titulo === indice);
  }

  /* ---------------- desenho ---------------- */

  const f = (tag, atributos, extra) => ({ tag, atributos, ...(extra || {}) });
  const traco = (d, cor = CONTORNO, largura = 2.4) => f("path", { d, fill: "none", stroke: cor, "stroke-width": largura, "stroke-linecap": "round", "stroke-linejoin": "round" });
  const comContorno = (atributos, largura = 2.2) => ({ ...atributos, stroke: CONTORNO, "stroke-width": largura, "stroke-linejoin": "round" });

  // Centro da cabeça (70, 64), raio 36. Olhos em (56, 67) e (84, 67).
  function cabelo(estilo, cor, atras) {
    const forma = (d) => f("path", comContorno({ d, fill: cor }));
    const frenteLisa = "M33 62 C31 32 50 23 70 23 C92 23 110 34 107 62 C98 46 84 42 70 42 C56 42 42 46 33 62 Z";
    switch (estilo) {
      case "raspado":
        return atras ? [] : [f("path", { d: "M35 60 C34 34 52 27 70 27 C88 27 106 34 105 60 C98 46 84 41 70 41 C56 41 42 46 35 60 Z", fill: cor, opacity: 0.55 })];
      case "franja":
        return atras ? [] : [forma("M33 64 C30 34 50 23 70 23 C92 23 111 36 107 64 L101 52 L93 58 L87 47 L78 55 L70 45 L61 55 L53 47 L46 58 L40 50 Z")];
      case "longo":
        return atras
          ? [forma("M31 60 C28 20 112 20 109 60 L115 128 C100 121 86 124 70 125 C54 124 40 121 25 128 Z")]
          : [forma("M33 62 C31 32 50 23 70 23 C92 23 110 34 107 62 C96 44 80 40 72 47 C62 40 44 44 33 62 Z")];
      case "cacheado": {
        const cachos = atras
          ? [[38, 52, 13], [36, 70, 10], [104, 70, 10], [102, 52, 13]]
          : [[42, 44, 12], [54, 32, 13], [70, 27, 14], [86, 32, 13], [98, 44, 12]];
        return cachos.map(([cx, cy, r]) => f("circle", comContorno({ cx, cy, r, fill: cor })));
      }
      case "blackpower":
        return atras
          ? [f("circle", comContorno({ cx: 70, cy: 54, r: 50, fill: cor }))]
          : [forma("M34 60 C35 40 50 32 70 32 C90 32 105 40 106 60 C98 50 86 46 70 46 C54 46 42 50 34 60 Z")];
      case "coque":
        return atras
          ? [f("circle", comContorno({ cx: 70, cy: 18, r: 13, fill: cor }))]
          : [forma(frenteLisa), f("rect", comContorno({ x: 62, y: 26, width: 16, height: 6, rx: 3, fill: "#E85A9B" }, 1.6))];
      case "rabo":
        return atras
          ? [forma("M98 38 C124 42 128 80 116 108 C113 88 108 68 94 52 Z")]
          : [forma(frenteLisa)];
      case "trancas": {
        if (!atras) return [forma(frenteLisa)];
        const tranca = (x, dx) => [82, 96, 110, 124].map((y, k) => f("ellipse", comContorno({ cx: x + dx * k, cy: y, rx: 7, ry: 8, fill: cor }, 2)));
        return [...tranca(36, -1), ...tranca(104, 1), f("circle", comContorno({ cx: 32, cy: 134, r: 4, fill: "#E9B824" }, 1.6)), f("circle", comContorno({ cx: 108, cy: 134, r: 4, fill: "#E9B824" }, 1.6))];
      }
      case "moicano":
        return atras ? [] : [
          f("path", { d: "M35 60 C34 34 52 27 70 27 C88 27 106 34 105 60 C98 46 84 41 70 41 C56 41 42 46 35 60 Z", fill: cor, opacity: 0.35 }),
          forma("M60 46 L54 22 L64 31 L70 9 L76 31 L86 22 L80 46 C74 42 66 42 60 46 Z"),
        ];
      default:   // curto
        return atras ? [] : [forma("M33 62 C31 34 50 24 70 24 C92 24 110 36 107 62 C100 50 90 44 78 44 C72 50 60 50 54 46 C45 48 38 54 33 62 Z")];
    }
  }

  function olhoAberto(cx, cy, ry = 6, olhar = [0, 0]) {
    return [
      f("ellipse", { cx: cx + olhar[0], cy: cy + olhar[1], rx: 4.6, ry, fill: CONTORNO }),
      f("circle", { cx: cx + olhar[0] + 1.6, cy: cy + olhar[1] - 2.2, r: 1.7, fill: "#FFFFFF" }),
    ];
  }

  function rosto(emocao) {
    const sorriso = traco("M60 84 Q70 93 80 84");
    const sobrancelhas = [traco("M50 56 Q56 53 62 56"), traco("M78 56 Q84 53 90 56")];
    switch (emocao) {
      case "rindo":
        return [
          ...sobrancelhas,
          traco("M50 68 Q56 61 62 68"), traco("M78 68 Q84 61 90 68"),
          f("path", comContorno({ d: "M58 81 Q70 99 82 81 Z", fill: "#7A2730" })),
          f("ellipse", { cx: 70, cy: 90, rx: 6, ry: 3, fill: "#FF8A95" }),
        ];
      case "surpreso":
        return [
          traco("M49 52 Q56 47 63 52"), traco("M77 52 Q84 47 91 52"),
          ...olhoAberto(56, 67, 7.5), ...olhoAberto(84, 67, 7.5),
          f("ellipse", comContorno({ cx: 70, cy: 89, rx: 4.5, ry: 6, fill: "#7A2730" })),
        ];
      case "pensativo":
        return [
          traco("M50 57 Q56 55 62 57"), traco("M78 53 Q84 49 90 54"),
          ...olhoAberto(56, 67, 6, [1.5, -2]), ...olhoAberto(84, 67, 6, [1.5, -2]),
          traco("M63 88 Q70 87 78 84"),
        ];
      case "piscadela":
        return [
          ...sobrancelhas,
          traco("M50 67 Q56 71 62 67"), ...olhoAberto(84, 67),
          traco("M60 83 Q72 94 82 82"),
        ];
      case "concentrado":
        return [
          traco("M50 54 L62 58"), traco("M78 58 L90 54"),
          ...olhoAberto(56, 68, 5), ...olhoAberto(84, 68, 5),
          traco("M64 87 Q70 89 76 87"),
        ];
      default:   // feliz
        return [...sobrancelhas, ...olhoAberto(56, 67), ...olhoAberto(84, 67), sorriso];
    }
  }

  /* Formas do avatar num viewBox 0 0 140 160, de trás para a frente. */
  function formasDoAvatar(av) {
    const a = lerAvatar(av, 99, PELES.flatMap((p) => p.paletas || []));
    const pele = achar(PELES, a.pele).cor;
    const corCabelo = achar(CORES_CABELO, a.corCabelo).cor;
    const gola = achar(GOLAS, a.gola).cor;
    const usa = (id) => a.acessorios.includes(id) || a.enfeites.includes(id);
    const formas = [];

    formas.push(...cabelo(a.cabelo, corCabelo, true));
    // jaleco, camisa na cor da gola, lapelas, bolso
    formas.push(f("path", comContorno({ d: "M20 160 C20 134 38 120 70 118 C102 120 120 134 120 160 Z", fill: "#FAFAF7" })));
    formas.push(f("path", comContorno({ d: "M57 119 L70 140 L83 119 C79 117 61 117 57 119 Z", fill: gola })));
    formas.push(traco("M57 119 L63 135 L70 140 L77 135 L83 119", CONTORNO, 1.8), traco("M70 140 L70 160", CONTORNO, 1.6));
    formas.push(f("rect", { x: 86, y: 141, width: 17, height: 13, rx: 2.5, fill: "none", stroke: "#B9BDB8", "stroke-width": 1.6 }));
    formas.push(f("circle", { cx: 70, cy: 148, r: 1.8, fill: "#B9BDB8" }), f("circle", { cx: 70, cy: 156, r: 1.8, fill: "#B9BDB8" }));
    // pescoço, orelhas e cabeça
    formas.push(f("rect", comContorno({ x: 62, y: 94, width: 16, height: 26, rx: 6, fill: pele })));
    formas.push(f("ellipse", { cx: 70, cy: 101, rx: 9, ry: 3.2, fill: "#000000", opacity: 0.12 }));
    formas.push(f("circle", comContorno({ cx: 34, cy: 68, r: 7, fill: pele })), f("circle", comContorno({ cx: 106, cy: 68, r: 7, fill: pele })));
    formas.push(f("circle", comContorno({ cx: 70, cy: 64, r: 36, fill: pele }, 2.4)));
    formas.push(...cabelo(a.cabelo, corCabelo, false));
    if (usa("laco")) {
      formas.push(f("path", comContorno({ d: "M88 30 L100 22 L100 38 Z M88 30 L76 22 L76 38 Z", fill: "#E85A9B" }, 1.6)), f("circle", comContorno({ cx: 88, cy: 30, r: 3.5, fill: "#E85A9B" }, 1.6)));
    }
    // bochechas, sardas, nariz e rosto
    formas.push(f("ellipse", { cx: 49, cy: 79, rx: 7, ry: 4.5, fill: "#FF7A8A", opacity: 0.35 }), f("ellipse", { cx: 91, cy: 79, rx: 7, ry: 4.5, fill: "#FF7A8A", opacity: 0.35 }));
    if (usa("sardas")) {
      for (const [x, y] of [[46, 76], [50, 80], [53, 76], [87, 76], [90, 80], [94, 76]]) formas.push(f("circle", { cx: x, cy: y, r: 1.1, fill: "#8A5A3C" }));
    }
    formas.push(traco("M67 75 Q70 78 73 75", CONTORNO, 1.8));
    formas.push(...rosto(a.emocao));
    if (usa("bigode")) formas.push(f("path", comContorno({ d: "M70 81 C64 77 56 79 54 84 C60 83 64 84 70 83 C76 84 80 83 86 84 C84 79 76 77 70 81 Z", fill: corCabelo }, 1.4)));
    if (usa("grau")) {
      formas.push(f("circle", { cx: 56, cy: 67, r: 10.5, fill: "#FFFFFF", "fill-opacity": 0.15, stroke: CONTORNO, "stroke-width": 2.2 }));
      formas.push(f("circle", { cx: 84, cy: 67, r: 10.5, fill: "#FFFFFF", "fill-opacity": 0.15, stroke: CONTORNO, "stroke-width": 2.2 }));
      formas.push(traco("M66.5 66 Q70 63 73.5 66", CONTORNO, 2), traco("M45.5 66 L36 64", CONTORNO, 2), traco("M94.5 66 L104 64", CONTORNO, 2));
    }
    if (usa("oculos")) {
      formas.push(traco("M36 66 L42 66", "#2F6F8F", 3), traco("M98 66 L104 66", "#2F6F8F", 3));
      formas.push(f("rect", { x: 42, y: 56, width: 56, height: 22, rx: 10, fill: "#9FD8F0", "fill-opacity": 0.5, stroke: "#2F6F8F", "stroke-width": 2.8 }));
      formas.push(f("path", { d: "M47 62 L55 60", stroke: "#FFFFFF", "stroke-width": 2.2, "stroke-linecap": "round", opacity: 0.8 }));
    }
    // nas mãos e no bolso
    if (usa("caneta")) formas.push(f("rect", comContorno({ x: 89, y: 133, width: 3.5, height: 14, rx: 1.5, fill: "#3F51B5" }, 1.2)), f("rect", comContorno({ x: 95, y: 135, width: 3.5, height: 12, rx: 1.5, fill: "#C62828" }, 1.2)));
    if (usa("tubo")) {
      formas.push(f("rect", comContorno({ x: 12, y: 116, width: 11, height: 32, rx: 5.5, fill: "#E8F6FB" }, 1.8)));
      formas.push(f("rect", { x: 13.8, y: 131, width: 7.4, height: 15, rx: 3.7, fill: "#7CB342" }));
      formas.push(f("circle", { cx: 16, cy: 136, r: 1.2, fill: "#FFFFFF" }));
    }
    if (usa("balao")) {
      formas.push(f("path", comContorno({ d: "M113 102 L119 102 L119 122 Q130 128 130 139 Q130 152 116 152 Q102 152 102 139 Q102 128 113 122 Z", fill: "#E8F6FB" }, 1.8)));
      formas.push(f("path", { d: "M103.5 140 Q116 135 128.5 140 Q128 150.5 116 150.5 Q104 150.5 103.5 140 Z", fill: "#D63A7A" }));
    }
    const mao = (x) => (usa("luvas")
      ? f("circle", comContorno({ cx: x, cy: 150, r: 8.5, fill: "#7FC4E8" }, 2))
      : f("circle", comContorno({ cx: x, cy: 150, r: 8, fill: pele }, 2)));
    formas.push(mao(22), mao(118));
    if (usa("capelo")) {
      formas.push(f("path", comContorno({ d: "M50 30 L50 40 C60 46 80 46 90 40 L90 30 Z", fill: "#1F2A33" })));
      formas.push(f("path", comContorno({ d: "M26 26 L70 9 L114 26 L70 43 Z", fill: "#1F2A33" })));
      formas.push(traco("M104 30 L108 50", "#E0B53A", 2.2), f("circle", { cx: 108, cy: 52, r: 3, fill: "#E0B53A" }));
    }
    return formas;
  }

  /* Frase para o leitor de tela (o desenho só reforça). */
  function descricaoDoAvatar(av) {
    const a = lerAvatar(av, 99, PELES.flatMap((p) => p.paletas || []));
    const base = `Avatar: cientista ${achar(EMOCOES, a.emocao).expressao}, de jaleco com gola ${achar(GOLAS, a.gola).nome.toLowerCase()}, pele ${achar(PELES, a.pele).nome.toLowerCase()}, cabelo ${achar(CABELOS, a.cabelo).nome.toLowerCase()}`
      + (a.cabelo === "raspado" ? "" : ` ${achar(CORES_CABELO, a.corCabelo).nome.toLowerCase()}`);
    const itens = [...a.acessorios.map((id) => achar(ACESSORIOS, id).nome), ...a.enfeites.map((id) => achar(ENFEITES, id).nome)].map((n) => n.toLowerCase());
    return itens.length ? `${base}, com ${itens.length > 1 ? `${itens.slice(0, -1).join(", ")} e ${itens.at(-1)}` : itens[0]}.` : `${base}.`;
  }

  /* ---------------- crachá ---------------- */

  const VIEWBOX_CRACHA = "0 0 240 340";
  const APELIDO_MAXIMO = 18;

  function lerApelido(texto) {
    const t = String(texto || "").replace(/\s+/g, " ").trim().slice(0, APELIDO_MAXIMO);
    return t || "Cientista";
  }

  // Código de barras de enfeite, sempre o mesmo para o mesmo apelido.
  function barras(apelido) {
    let h = 7;
    for (const c of apelido) h = (h * 31 + c.charCodeAt(0)) % 9973;
    const lista = [];
    let x = 66;
    while (x < 172) {
      h = (h * 17 + 11) % 9973;
      const largura = 1 + (h % 3);
      lista.push(f("rect", { x, y: 306, width: largura, height: 16, fill: CONTORNO }));
      x += largura + 1 + ((h >> 3) % 3);
    }
    return lista;
  }

  /* O crachá do aluno: o avatar numa moldura, o apelido, o título e as linhas de números. `cor` é a
     cor da faixa (a barra da paleta em uso); `app` é o nome do aplicativo. Os textos entram como
     texto puro (`texto`), nunca como marcação. */
  function formasDoCracha({ avatar, apelido, titulo, linhas = [], cor = "#1B5E3A", app = "SUPER ORGANIC BOX" }) {
    const nome = lerApelido(apelido);
    const corOk = /^#[0-9A-Fa-f]{6}$/.test(cor) ? cor : "#1B5E3A";
    const texto = (x, y, conteudo, extra) => f("text", { x, y, "text-anchor": "middle", "font-family": "'Exo 2', Inter, Arial, Helvetica, sans-serif", "font-style": "normal", ...extra }, { texto: String(conteudo) });
    return [
      f("rect", { x: 108, y: 0, width: 24, height: 28, fill: corOk }),
      f("rect", comContorno({ x: 98, y: 22, width: 44, height: 18, rx: 5, fill: "#B7BEC6" }, 1.8)),
      f("rect", comContorno({ x: 10, y: 34, width: 220, height: 298, rx: 18, fill: "#FFFFFF" })),
      f("path", { d: "M10 52 Q10 34 28 34 L212 34 Q230 34 230 52 L230 92 L10 92 Z", fill: corOk }),
      f("rect", { x: 112, y: 40, width: 16, height: 5, rx: 2.5, fill: "#FFFFFF", opacity: 0.6 }),
      texto(120, 66, app, { "font-size": 15, "font-weight": 700, "font-style": "italic", fill: "#FFFFFF" }),
      texto(120, 83, "CRACHÁ DE LABORATÓRIO", { "font-size": 9.5, "letter-spacing": 1.6, fill: "#FFFFFF" }),
      f("rect", comContorno({ x: 58, y: 100, width: 124, height: 138, rx: 14, fill: "#EEF2F5" }, 1.8)),
      f("g", { transform: "translate(64 104) scale(0.8)" }, { filhos: formasDoAvatar(avatar) }),
      texto(120, 262, nome, { "font-size": 19, "font-weight": 700, fill: CONTORNO }),
      texto(120, 280, titulo || "", { "font-size": 12, "font-weight": 600, fill: corOk }),
      ...linhas.slice(0, 1).map((l) => texto(120, 297, l, { "font-size": 10.5, fill: "#4A5560" })),
      ...barras(nome),
    ];
  }

  window.Avatar = { VIEWBOX_AVATAR, VIEWBOX_CRACHA, APELIDO_MAXIMO, PELES, CABELOS, CORES_CABELO, GOLAS, EMOCOES, ACESSORIOS, ENFEITES, AVATAR_PADRAO: PADRAO, lerAvatar, lerApelido, estadoDasPeles, estadoDosAcessorios, acessoriosDoTitulo, formasDoAvatar, descricaoDoAvatar, formasDoCracha };
})();

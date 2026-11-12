/* ORIGEM: dados/avatar.js (Super Organic Box) (Super Organic Box), convertido por ferramentas/converter_modulo.cjs.
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
  const DESCE_CABECA = 9;   // o pescoço aparecia com 18 de altura; agora, com 9

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
    // Inusitadas: abertas para todo mundo.
    { id: "caveira", nome: "Caveira", cor: "#F2EEE3", inusitada: true },
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
    { id: "ondulado", nome: "Ondulado" },
    { id: "chanel", nome: "Chanel" },
    { id: "topete", nome: "Topete" },
    { id: "dreads", nome: "Dreads" },
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

  // Formato do rosto e cor dos olhos (como nos Mii, em 2D).
  const ROSTOS = [
    { id: "redondo", nome: "Redondo" },
    { id: "oval", nome: "Oval" },
    { id: "quadrado", nome: "Quadrado" },
  ];

  const SOBRANCELHAS = [
    { id: "fina", nome: "Finas", largura: 1.5 },
    { id: "natural", nome: "Naturais", largura: 2.4 },
    { id: "grossa", nome: "Grossas", largura: 4 },
  ];

  const CORES_OLHOS = [
    { id: "escuro", nome: "Escuros", cor: CONTORNO },
    { id: "castanho", nome: "Castanhos", cor: "#6B4423" },
    { id: "mel", nome: "Cor de mel", cor: "#B07A2A" },
    { id: "verde", nome: "Verdes", cor: "#3E8E5A" },
    { id: "azul", nome: "Azuis", cor: "#3B79C9" },
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

  /* Enfeites que todo mundo pode usar desde o começo. `grupo` é a aba do editor em que o enfeite
     aparece; nos grupos de GRUPOS_DE_UM_SO o aluno usa um por vez (um par de óculos, um chapéu). */
  const ENFEITES = [
    { id: "grau", nome: "Óculos redondos", grupo: "oculos" },
    { id: "quadrado", nome: "Óculos quadrados", grupo: "oculos" },
    { id: "escuros", nome: "Óculos escuros", grupo: "oculos" },
    { id: "sardas", nome: "Sardas", grupo: "detalhe" },
    { id: "blush", nome: "Bochechas rosadas", grupo: "detalhe" },
    { id: "bigode", nome: "Bigode", grupo: "barba" },
    { id: "cavanhaque", nome: "Cavanhaque", grupo: "barba" },
    { id: "barba", nome: "Barba", grupo: "barba" },
    { id: "laco", nome: "Laço no cabelo", grupo: "detalhe" },
    { id: "brincos", nome: "Brincos", grupo: "detalhe" },
    { id: "fones", nome: "Fone de ouvido", grupo: "detalhe" },
    { id: "bone", nome: "Boné", grupo: "cabeca" },
    { id: "gorro", nome: "Gorro", grupo: "cabeca" },
    { id: "chapeu", nome: "Chapéu de palha", grupo: "cabeca" },
  ];
  const GRUPOS_DE_UM_SO = ["oculos", "cabeca"];

  /* O fundo da figurinha: sem fundo (como sempre foi) ou uma cor. */
  const FUNDOS = [
    { id: "nenhum", nome: "Sem fundo", cor: "" },
    { id: "ceu", nome: "Céu", cor: "#BFE0FF" },
    { id: "menta", nome: "Menta", cor: "#BFE8CF" },
    { id: "limao", nome: "Limão", cor: "#F5E9A6" },
    { id: "pessego", nome: "Pêssego", cor: "#FFD3B0" },
    { id: "rosa", nome: "Rosa", cor: "#F9C6D8" },
    { id: "lilas", nome: "Lilás", cor: "#D9C8F5" },
    { id: "cinza", nome: "Cinza", cor: "#DADDE3" },
    { id: "noite", nome: "Noite", cor: "#2B2A33" },
  ];

  /* A cor do crachá e do cordão: a da paleta em uso ou a mesma da gola do jaleco. */
  const CORES_CRACHA = [
    { id: "paleta", nome: "Da paleta" },
    { id: "gola", nome: "Da gola do jaleco" },
  ];

  const PADRAO = { pele: "p3", rosto: "redondo", olhos: "escuro", cabelo: "curto", corCabelo: "castanho", gola: "verde", emocao: "feliz", acessorios: [], enfeites: [], cracha: "paleta", sobrancelha: "natural", fundo: "nenhum" };

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
      rosto: valido(ROSTOS, d.rosto, PADRAO.rosto),
      olhos: valido(CORES_OLHOS, d.olhos, PADRAO.olhos),
      cabelo: valido(CABELOS, d.cabelo, PADRAO.cabelo),
      corCabelo: valido(CORES_CABELO, d.corCabelo, PADRAO.corCabelo),
      gola: valido(GOLAS, d.gola, PADRAO.gola),
      emocao: valido(EMOCOES, d.emocao, PADRAO.emocao),
      acessorios: ACESSORIOS.filter((a) => usados.includes(a.id) && a.titulo <= indiceDoTitulo).map((a) => a.id),
      enfeites: ENFEITES.filter((e) => enfeites.includes(e.id)).map((e) => e.id),
      cracha: valido(CORES_CRACHA, d.cracha, PADRAO.cracha),
      sobrancelha: valido(SOBRANCELHAS, d.sobrancelha, PADRAO.sobrancelha),
      fundo: valido(FUNDOS, d.fundo, PADRAO.fundo),
    };
  }

  /* Liga ou desliga um enfeite. Nos grupos de um só (óculos, chapéus), o novo tira o anterior. */
  function alternarEnfeite(usados, id) {
    const item = achar(ENFEITES, id);
    if (!item) return usados;
    if (usados.includes(id)) return usados.filter((x) => x !== id);
    const resto = GRUPOS_DE_UM_SO.includes(item.grupo) ? usados.filter((x) => achar(ENFEITES, x).grupo !== item.grupo) : usados;
    return ENFEITES.filter((e) => e.id === id || resto.includes(e.id)).map((e) => e.id);
  }

  /* Um avatar sorteado só com o que o aluno já abriu. `sorteio`: função como Math.random. */
  function avatarSurpresa(sorteio = Math.random, indiceDoTitulo = 0, paletasAbertas = []) {
    const um = (lista) => lista[Math.floor(sorteio() * lista.length)].id;
    const enfeites = [];
    for (const grupo of ["oculos", "barba", "cabeca", "detalhe"]) {
      if (sorteio() < 0.35) enfeites.push(um(ENFEITES.filter((e) => e.grupo === grupo)));
    }
    return lerAvatar({
      pele: um(PELES.filter((p) => peleAberta(p, paletasAbertas))),
      rosto: um(ROSTOS), olhos: um(CORES_OLHOS), sobrancelha: um(SOBRANCELHAS), cabelo: um(CABELOS), corCabelo: um(CORES_CABELO),
      gola: um(GOLAS), emocao: um(EMOCOES), fundo: um(FUNDOS), enfeites,
      acessorios: ACESSORIOS.filter((a) => a.titulo <= indiceDoTitulo && sorteio() < 0.5).map((a) => a.id),
    }, indiceDoTitulo, paletasAbertas);
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
      case "ondulado":
        return atras
          ? [forma("M31 60 C28 20 112 20 109 60 C117 74 105 84 113 98 C106 106 99 98 95 106 L45 106 C41 98 34 106 27 98 C35 84 23 74 31 60 Z")]
          : [forma("M33 62 C31 32 50 23 70 23 C92 23 110 34 107 62 C102 50 94 50 88 44 C80 50 72 40 64 46 C54 40 42 48 33 62 Z")];
      case "chanel":
        return atras
          ? [forma("M30 60 C27 18 113 18 110 60 L113 92 C105 97 98 95 96 90 L44 90 C42 95 35 97 27 92 Z")]
          : [forma("M33 62 C31 32 50 23 70 23 C92 23 110 34 107 62 L104 49 C90 54 50 54 36 49 Z")];
      case "topete":
        return atras ? [] : [forma("M33 62 C31 38 46 27 60 27 C56 13 86 5 100 20 C109 29 110 46 107 62 C100 50 90 44 76 44 C62 44 42 48 33 62 Z")];
      case "dreads": {
        if (!atras) return [forma(frenteLisa), ...[46, 58, 70, 82, 94].map((x) => traco(`M${x} ${x === 70 ? 24 : x === 46 || x === 94 ? 31 : 26} L${x + (x - 70) * 0.08} 41`, CONTORNO, 1.4))];
        const mecha = (x, altura) => f("rect", comContorno({ x: x - 5, y: 46, width: 10, height: altura, rx: 5, fill: cor }, 2));
        return [mecha(27, 70), mecha(38, 78), mecha(102, 78), mecha(113, 70), ...[[27, 108], [113, 108]].map(([cx, cy]) => f("rect", comContorno({ x: cx - 5, y: cy, width: 10, height: 5, rx: 2, fill: "#E9B824" }, 1.4)))];
      }
      default:   // curto
        return atras ? [] : [forma("M33 62 C31 34 50 24 70 24 C92 24 110 36 107 62 C100 50 90 44 78 44 C72 50 60 50 54 46 C45 48 38 54 33 62 Z")];
    }
  }

  // A luz no cabelo: mechas claras por cima da cor, no lugar em que cada corte tem volume.
  function brilhoDoCabelo(estilo) {
    const luz = (d, largura = 3) => f("path", { d, fill: "none", stroke: "#FFFFFF", "stroke-width": largura, "stroke-linecap": "round", opacity: 0.28 });
    switch (estilo) {
      case "raspado": return [];
      case "moicano": return [luz("M66 30 L69 17", 2.4)];
      case "cacheado": return [[48, 27], [64, 21], [81, 26], [94, 38]].map(([x, y]) => luz(`M${x} ${y + 3} Q${x + 3} ${y - 2} ${x + 8} ${y}`, 2.4));
      case "blackpower": return [luz("M34 30 Q46 12 66 9", 4), luz("M76 9 Q84 10 90 14", 4)];
      case "topete": return [luz("M68 21 Q80 12 93 21", 3.4), luz("M42 40 Q48 33 56 31", 2.6)];
      default: return [luz("M45 37 Q56 28 70 28", 3.4), luz("M78 29 Q86 30 92 35", 3.4)];
    }
  }

  // Olho aberto: o branco do olho, a íris na cor escolhida, a pupila, dois brilhos e a pálpebra.
  function olhoAberto(cx, cy, ry = 6, olhar = [0, 0], cor = CONTORNO) {
    const x = cx + olhar[0] * 0.8;
    const y = cy + olhar[1] * 0.8;
    const iris = cor === CONTORNO ? "#3B2A22" : cor;
    return [
      f("ellipse", { cx, cy, rx: 6.6, ry: ry + 1.4, fill: "#FFFFFF", stroke: CONTORNO, "stroke-width": 1.2 }),
      f("ellipse", { cx: x, cy: y + 0.4, rx: 4.4, ry: Math.min(ry, 5.6), fill: iris }),
      f("ellipse", { cx: x, cy: y + 0.6, rx: 2.3, ry: Math.min(ry, 5.6) * 0.58, fill: "#17161C" }),
      f("circle", { cx: x + 1.7, cy: y - 2, r: 1.6, fill: "#FFFFFF" }),
      f("circle", { cx: x - 1.6, cy: y + 2.2, r: 0.8, fill: "#FFFFFF", opacity: 0.8 }),
      traco(`M${cx - 7} ${cy - ry * 0.55} Q${cx} ${cy - ry - 3.4} ${cx + 7} ${cy - ry * 0.55}`, CONTORNO, 2),
    ];
  }

  function rosto(emocao, corOlhos = CONTORNO, larguraSob = 2.4) {
    const olhoAberto_ = (cx, cy, ry, olhar) => olhoAberto(cx, cy, ry, olhar, corOlhos);
    const sorriso = traco("M60 84 Q70 93 80 84");
    const sob = (d) => traco(d, CONTORNO, larguraSob);
    const sobrancelhas = [sob("M50 56 Q56 53 62 56"), sob("M78 56 Q84 53 90 56")];
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
          sob("M49 52 Q56 47 63 52"), sob("M77 52 Q84 47 91 52"),
          ...olhoAberto_(56, 67, 7.5), ...olhoAberto_(84, 67, 7.5),
          f("ellipse", comContorno({ cx: 70, cy: 89, rx: 4.5, ry: 6, fill: "#7A2730" })),
        ];
      case "pensativo":
        return [
          sob("M50 57 Q56 55 62 57"), sob("M78 53 Q84 49 90 54"),
          ...olhoAberto_(56, 67, 6, [1.5, -2]), ...olhoAberto_(84, 67, 6, [1.5, -2]),
          traco("M63 88 Q70 87 78 84"),
        ];
      case "piscadela":
        return [
          ...sobrancelhas,
          traco("M50 67 Q56 71 62 67"), ...olhoAberto_(84, 67),
          traco("M60 83 Q72 94 82 82"),
        ];
      case "concentrado":
        return [
          sob("M50 54 L62 58"), sob("M78 58 L90 54"),
          ...olhoAberto_(56, 68, 5), ...olhoAberto_(84, 68, 5),
          traco("M64 87 Q70 89 76 87"),
        ];
      default:   // feliz
        return [...sobrancelhas, ...olhoAberto_(56, 67), ...olhoAberto_(84, 67), sorriso];
    }
  }

  /* Rosto de caveira: órbitas escuras com um brilho na cor dos olhos, nariz em triângulo e dentes.
     A emoção muda a boca e as órbitas. */
  function rostoCaveira(emocao, corOlhos) {
    const brilho = corOlhos === CONTORNO ? "#FFFFFF" : corOlhos;
    const orbita = (cx, ry = 9) => [
      f("ellipse", { cx, cy: 66, rx: 8.5, ry, fill: CONTORNO }),
      f("circle", { cx: cx + 1.5, cy: 64, r: 2.4, fill: brilho }),
    ];
    const dentes = (y, altura) => [
      f("rect", comContorno({ x: 57, y, width: 26, height: altura, rx: 3, fill: "#FFFFFF" }, 1.8)),
      ...[63.5, 70, 76.5].map((x) => traco(`M${x} ${y} L${x} ${y + altura}`, CONTORNO, 1.4)),
    ];
    const partes = [
      traco("M82 34 L86 41 L83 46", CONTORNO, 1.4),   // rachadura na testa
      f("path", { d: "M70 73 L66 80 L74 80 Z", fill: CONTORNO }),
    ];
    switch (emocao) {
      case "rindo":
        return [...partes, ...orbita(56, 7), ...orbita(84, 7), f("rect", comContorno({ x: 57, y: 84, width: 26, height: 14, rx: 4, fill: "#5A2230" }, 1.8)), ...dentes(84, 5)];
      case "surpreso":
        return [...partes, ...orbita(56, 10.5), ...orbita(84, 10.5), f("ellipse", comContorno({ cx: 70, cy: 90, rx: 5, ry: 6.5, fill: CONTORNO }, 1.8))];
      case "piscadela":
        return [...partes, traco("M48 67 Q56 71 64 67", CONTORNO, 3), ...orbita(84), ...dentes(85, 8)];
      case "pensativo":
        return [...partes, ...orbita(56), ...orbita(84), f("rect", comContorno({ x: 60, y: 86, width: 20, height: 6, rx: 2, fill: "#FFFFFF" }, 1.8)), traco("M66.5 86 L66.5 92", CONTORNO, 1.2), traco("M73.5 86 L73.5 92", CONTORNO, 1.2)];
      default:
        return [...partes, ...orbita(56), ...orbita(84), ...dentes(85, 8)];
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

    const fundo = achar(FUNDOS, a.fundo).cor;
    if (fundo) formas.push(f("rect", { x: 0, y: 0, width: 140, height: 160, rx: 20, fill: fundo }));
    const iCabeloAtras = formas.length;
    formas.push(...cabelo(a.cabelo, corCabelo, true));
    const iCorpo = formas.length;
    // jaleco, camisa na cor da gola, lapelas, bolso
    formas.push(f("path", comContorno({ d: "M20 160 C20 134 38 120 70 118 C102 120 120 134 120 160 Z", fill: "#FAFAF7" })));
    formas.push(f("path", comContorno({ d: "M57 119 L70 140 L83 119 C79 117 61 117 57 119 Z", fill: gola })));
    formas.push(traco("M57 119 L63 135 L70 140 L77 135 L83 119", CONTORNO, 1.8), traco("M70 140 L70 160", CONTORNO, 1.6));
    formas.push(f("rect", { x: 86, y: 141, width: 17, height: 13, rx: 2.5, fill: "none", stroke: "#B9BDB8", "stroke-width": 1.6 }));
    formas.push(f("circle", { cx: 70, cy: 148, r: 1.8, fill: "#B9BDB8" }), f("circle", { cx: 70, cy: 156, r: 1.8, fill: "#B9BDB8" }));
    // o volume do jaleco: sombra dos lados, dobra das mangas e a luz na gola
    formas.push(f("path", { d: "M21.5 159 C22 138 34 126 50 121.5 C36 132 31 144 31 159 Z", fill: "#DDE3E6", opacity: 0.9 }), f("path", { d: "M118.5 159 C118 138 106 126 90 121.5 C104 132 109 144 109 159 Z", fill: "#DDE3E6", opacity: 0.9 }));
    formas.push(traco("M38 159 Q37 147 41 139", "#B9BDB8", 1.5), traco("M102 159 Q103 147 99 139", "#B9BDB8", 1.5), traco("M88 144.5 H101", "#B9BDB8", 1.4));
    formas.push(f("path", { d: "M60.5 121 L66 130", fill: "none", stroke: "#FFFFFF", "stroke-width": 2, "stroke-linecap": "round", opacity: 0.45 }));
    // pescoço, orelhas e cabeça
    formas.push(f("rect", comContorno({ x: 62, y: 94, width: 16, height: 26, rx: 6, fill: pele })));
    const iCabeca = formas.length;
    formas.push(f("path", { d: "M63 97 H77 V104 Q70 109 63 104 Z", fill: "#000000", opacity: 0.16 }));
    const caveira = a.pele === "caveira";
    if (!caveira) formas.push(f("circle", comContorno({ cx: 34, cy: 68, r: 7, fill: pele })), f("circle", comContorno({ cx: 106, cy: 68, r: 7, fill: pele })));
    if (a.rosto === "oval") formas.push(f("ellipse", comContorno({ cx: 70, cy: 65, rx: 33, ry: 38, fill: pele }, 2.4)));
    else if (a.rosto === "quadrado") formas.push(f("rect", comContorno({ x: 35, y: 29, width: 70, height: 72, rx: 24, fill: pele }, 2.4)));
    else formas.push(f("circle", comContorno({ cx: 70, cy: 64, r: 36, fill: pele }, 2.4)));
    if (!caveira) {
      // o volume do rosto: a curva da orelha, a sombra do queixo e a luz na bochecha
      formas.push(traco("M32.5 65.5 Q30.5 69 33.5 72", CONTORNO, 1.3), traco("M107.5 65.5 Q109.5 69 106.5 72", CONTORNO, 1.3));
      formas.push(f("path", { d: "M45 88 Q70 107 95 88 Q84 100.5 70 100.5 Q56 100.5 45 88 Z", fill: "#000000", opacity: 0.08 }));
      formas.push(f("path", { d: "M40.5 58 Q41 47 48 40", fill: "none", stroke: "#FFFFFF", "stroke-width": 3, "stroke-linecap": "round", opacity: 0.3 }));
    }
    if (usa("brincos")) formas.push(f("circle", comContorno({ cx: 34, cy: 78, r: 3.2, fill: "#E9B824" }, 1.4)), f("circle", comContorno({ cx: 106, cy: 78, r: 3.2, fill: "#E9B824" }, 1.4)));
    formas.push(...cabelo(a.cabelo, corCabelo, false), ...brilhoDoCabelo(a.cabelo));
    if (usa("laco")) {
      formas.push(f("path", comContorno({ d: "M88 30 L100 22 L100 38 Z M88 30 L76 22 L76 38 Z", fill: "#E85A9B" }, 1.6)), f("circle", comContorno({ cx: 88, cy: 30, r: 3.5, fill: "#E85A9B" }, 1.6)));
    }
    if (caveira) {
      formas.push(...rostoCaveira(a.emocao, achar(CORES_OLHOS, a.olhos).cor));
    } else {
      // bochechas rosadas (opcional), sardas, nariz e rosto
      if (usa("blush")) formas.push(f("ellipse", { cx: 49, cy: 79, rx: 7, ry: 4.5, fill: "#FF7A8A", opacity: 0.35 }), f("ellipse", { cx: 91, cy: 79, rx: 7, ry: 4.5, fill: "#FF7A8A", opacity: 0.35 }));
      if (usa("sardas")) {
        for (const [x, y] of [[46, 76], [50, 80], [53, 76], [87, 76], [90, 80], [94, 76]]) formas.push(f("circle", { cx: x, cy: y, r: 1.1, fill: "#8A5A3C" }));
      }
      // A barba entra antes da boca, que fica desenhada por cima.
      if (usa("barba")) formas.push(f("path", comContorno({ d: "M36 70 C35 98 54 107 70 107 C86 107 105 98 104 70 C99 80 92 82 84 79 C76 76 64 76 56 79 C48 82 41 80 36 70 Z", fill: corCabelo }, 2)));
      if (usa("cavanhaque")) formas.push(f("path", comContorno({ d: "M60 93 C61 107 79 107 80 93 C75 98 65 98 60 93 Z", fill: corCabelo }, 1.6)));
      formas.push(traco("M67 75 Q70 78 73 75", CONTORNO, 1.8));
      formas.push(...rosto(a.emocao, achar(CORES_OLHOS, a.olhos).cor, achar(SOBRANCELHAS, a.sobrancelha).largura));
    }
    if (usa("bigode")) formas.push(f("path", comContorno({ d: "M70 81 C64 77 56 79 54 84 C60 83 64 84 70 83 C76 84 80 83 86 84 C84 79 76 77 70 81 Z", fill: corCabelo }, 1.4)));
    if (usa("grau")) {
      formas.push(f("circle", { cx: 56, cy: 67, r: 10.5, fill: "#FFFFFF", "fill-opacity": 0.15, stroke: CONTORNO, "stroke-width": 2.2 }));
      formas.push(f("circle", { cx: 84, cy: 67, r: 10.5, fill: "#FFFFFF", "fill-opacity": 0.15, stroke: CONTORNO, "stroke-width": 2.2 }));
      formas.push(traco("M66.5 66 Q70 63 73.5 66", CONTORNO, 2), traco("M45.5 66 L36 64", CONTORNO, 2), traco("M94.5 66 L104 64", CONTORNO, 2));
    }
    if (usa("quadrado")) {
      formas.push(f("rect", { x: 45, y: 58, width: 22, height: 17, rx: 4, fill: "#FFFFFF", "fill-opacity": 0.15, stroke: CONTORNO, "stroke-width": 2.4 }));
      formas.push(f("rect", { x: 73, y: 58, width: 22, height: 17, rx: 4, fill: "#FFFFFF", "fill-opacity": 0.15, stroke: CONTORNO, "stroke-width": 2.4 }));
      formas.push(traco("M67 65 H73", CONTORNO, 2), traco("M45 64 L36 63", CONTORNO, 2), traco("M95 64 L104 63", CONTORNO, 2));
    }
    if (usa("escuros")) {
      formas.push(traco("M45 63 L36 62", CONTORNO, 2.4), traco("M95 63 L104 62", CONTORNO, 2.4), traco("M66 62 H74", CONTORNO, 2.6));
      formas.push(f("path", comContorno({ d: "M44 59 H67 V68 Q67 78 55.5 78 Q44 78 44 68 Z", fill: "#1F2A33" }, 2)), f("path", comContorno({ d: "M73 59 H96 V68 Q96 78 84.5 78 Q73 78 73 68 Z", fill: "#1F2A33" }, 2)));
      formas.push(traco("M48 63 L54 62", "#FFFFFF", 1.8), traco("M77 63 L83 62", "#FFFFFF", 1.8));
    }
    if (usa("oculos")) {
      formas.push(traco("M36 66 L42 66", "#2F6F8F", 3), traco("M98 66 L104 66", "#2F6F8F", 3));
      formas.push(f("rect", { x: 42, y: 56, width: 56, height: 22, rx: 10, fill: "#9FD8F0", "fill-opacity": 0.5, stroke: "#2F6F8F", "stroke-width": 2.8 }));
      formas.push(f("path", { d: "M47 62 L55 60", stroke: "#FFFFFF", "stroke-width": 2.2, "stroke-linecap": "round", opacity: 0.8 }));
    }
    if (usa("fones")) {
      formas.push(f("path", { d: "M32 64 C30 18 110 18 108 64", fill: "none", stroke: CONTORNO, "stroke-width": 7, "stroke-linecap": "round" }));
      formas.push(f("path", { d: "M32 64 C30 18 110 18 108 64", fill: "none", stroke: "#E85A9B", "stroke-width": 3.5, "stroke-linecap": "round" }));
      formas.push(f("rect", comContorno({ x: 24, y: 58, width: 14, height: 22, rx: 6, fill: "#E85A9B" })), f("rect", comContorno({ x: 102, y: 58, width: 14, height: 22, rx: 6, fill: "#E85A9B" })));
    }
    // na cabeça: boné e gorro na cor da gola, chapéu de palha
    if (usa("bone")) {
      formas.push(f("path", comContorno({ d: "M33 48 C31 16 109 16 107 48 C92 42 48 42 33 48 Z", fill: gola })));
      formas.push(f("path", comContorno({ d: "M62 43 C90 38 118 44 126 54 C108 51 84 50 62 53 Z", fill: gola })));
      formas.push(f("circle", comContorno({ cx: 70, cy: 22, r: 3, fill: gola }, 1.4)));
    }
    if (usa("gorro")) {
      formas.push(f("path", comContorno({ d: "M33 46 C30 10 110 10 107 46 Z", fill: gola })));
      formas.push(f("rect", comContorno({ x: 29, y: 40, width: 82, height: 13, rx: 6.5, fill: "#FAFAF7" })));
      formas.push(...[42, 56, 70, 84, 98].map((x) => traco(`M${x} 42 V51`, "#B9BDB8", 1.4)));
      formas.push(f("circle", comContorno({ cx: 70, cy: 15, r: 7.5, fill: "#FAFAF7" })));
    }
    if (usa("chapeu")) {
      formas.push(f("ellipse", comContorno({ cx: 70, cy: 42, rx: 58, ry: 9.5, fill: "#E2B85F" })));
      formas.push(f("path", comContorno({ d: "M43 41 C41 10 99 10 97 41 C84 45 56 45 43 41 Z", fill: "#EBC773" })));
      formas.push(f("path", { d: "M43.5 35 C56 40 84 40 96.5 35 L97 41 C84 45 56 45 43 41 Z", fill: gola, stroke: CONTORNO, "stroke-width": 1.6, "stroke-linejoin": "round" }));
    }
    const iMaos = formas.length;
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
    formas.push(mao(22), mao(118), traco("M19 146 Q22 150 26 147", CONTORNO, 1.3), traco("M121 146 Q118 150 114 147", CONTORNO, 1.3));
    const iCapelo = formas.length;
    if (usa("capelo")) {
      formas.push(f("path", comContorno({ d: "M50 30 L50 40 C60 46 80 46 90 40 L90 30 Z", fill: "#1F2A33" })));
      formas.push(f("path", comContorno({ d: "M26 26 L70 9 L114 26 L70 43 Z", fill: "#1F2A33" })));
      formas.push(traco("M104 30 L108 50", "#E0B53A", 2.2), f("circle", { cx: 108, cy: 52, r: 3, fill: "#E0B53A" }));
    }
    // A cabeça (com o cabelo, o rosto e o que vai nela) desce DESCE_CABECA: o pescoço fica curto, como
    // pediram as turmas. O corpo, o jaleco e as mãos ficam onde estão.
    const desce = (lista) => (lista.length ? [f("g", { transform: `translate(0 ${DESCE_CABECA})` }, { filhos: lista })] : []);
    return [
      ...formas.slice(0, iCabeloAtras), ...desce(formas.slice(iCabeloAtras, iCorpo)),
      ...formas.slice(iCorpo, iCabeca), ...desce(formas.slice(iCabeca, iMaos)),
      ...formas.slice(iMaos, iCapelo), ...desce(formas.slice(iCapelo)),
    ];
  }

  /* Frase para o leitor de tela (o desenho só reforça). */
  function descricaoDoAvatar(av) {
    const a = lerAvatar(av, 99, PELES.flatMap((p) => p.paletas || []));
    const base = `Avatar: cientista ${achar(EMOCOES, a.emocao).expressao}, de jaleco com gola ${achar(GOLAS, a.gola).nome.toLowerCase()}, pele ${achar(PELES, a.pele).nome.toLowerCase()}, cabelo ${achar(CABELOS, a.cabelo).nome.toLowerCase()}`
      + (a.cabelo === "raspado" ? "" : ` ${achar(CORES_CABELO, a.corCabelo).nome.toLowerCase()}`)
      + (a.olhos === "escuro" ? "" : `, olhos ${achar(CORES_OLHOS, a.olhos).nome.toLowerCase()}`);
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

  // Cor clara (o amarelo da gola, por exemplo) pede texto escuro em cima e no fundo branco.
  function corClara(hex) {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.3;
  }

  /* O crachá do aluno: o avatar numa moldura, o apelido, o título e as linhas de números. `cor` é a
     cor da faixa e do cordão (a barra da paleta em uso), trocada pela cor da gola quando o avatar
     pede (`avatar.cracha === "gola"`); `app` é o nome do aplicativo. Os textos entram como texto
     puro (`texto`), nunca como marcação. */
  function formasDoCracha({ avatar, apelido, titulo, linhas = [], cor = "#1B5E3A", app = "SUPER ORGANIC BOX" }) {
    const nome = lerApelido(apelido);
    const daGola = avatar && avatar.cracha === "gola" && achar(GOLAS, avatar.gola);
    const pedida = daGola ? daGola.cor : cor;
    const corOk = /^#[0-9A-Fa-f]{6}$/.test(pedida) ? pedida : "#1B5E3A";
    const clara = corClara(corOk);
    const sobreFaixa = clara ? CONTORNO : "#FFFFFF";
    const corTitulo = clara ? CONTORNO : corOk;
    const texto = (x, y, conteudo, extra) => f("text", { x, y, "text-anchor": "middle", "font-family": "'Exo 2', Inter, Arial, Helvetica, sans-serif", "font-style": "normal", ...extra }, { texto: String(conteudo) });
    return [
      f("rect", { x: 108, y: 0, width: 24, height: 28, fill: corOk }),
      f("rect", comContorno({ x: 98, y: 22, width: 44, height: 18, rx: 5, fill: "#B7BEC6" }, 1.8)),
      f("rect", comContorno({ x: 10, y: 34, width: 220, height: 298, rx: 18, fill: "#FFFFFF" })),
      f("path", { d: "M10 52 Q10 34 28 34 L212 34 Q230 34 230 52 L230 92 L10 92 Z", fill: corOk }),
      f("rect", { x: 112, y: 40, width: 16, height: 5, rx: 2.5, fill: "#FFFFFF", opacity: 0.6 }),
      texto(120, 66, app, { "font-size": 15, "font-weight": 700, "font-style": "italic", fill: sobreFaixa }),
      texto(120, 83, "CRACHÁ DE LABORATÓRIO", { "font-size": 9.5, "letter-spacing": 1.6, fill: sobreFaixa }),
      f("rect", comContorno({ x: 58, y: 100, width: 124, height: 138, rx: 14, fill: "#EEF2F5" }, 1.8)),
      f("g", { transform: "translate(64 104) scale(0.8)" }, { filhos: formasDoAvatar(avatar) }),
      texto(120, 262, nome, { "font-size": 19, "font-weight": 700, fill: CONTORNO }),
      texto(120, 280, titulo || "", { "font-size": 12, "font-weight": 600, fill: corTitulo }),
      ...linhas.slice(0, 1).map((l) => texto(120, 297, l, { "font-size": 10.5, fill: "#4A5560" })),
      ...barras(nome),
    ];
  }

  window.Avatar = { VIEWBOX_AVATAR, VIEWBOX_CRACHA, APELIDO_MAXIMO, PELES, ROSTOS, CORES_OLHOS, SOBRANCELHAS, FUNDOS, GRUPOS_DE_UM_SO, CABELOS, CORES_CABELO, GOLAS, CORES_CRACHA, EMOCOES, ACESSORIOS, ENFEITES, AVATAR_PADRAO: PADRAO, lerAvatar, alternarEnfeite, avatarSurpresa, lerApelido, estadoDasPeles, estadoDosAcessorios, acessoriosDoTitulo, formasDoAvatar, descricaoDoAvatar, formasDoCracha };
})();

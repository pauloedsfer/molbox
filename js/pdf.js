/* ORIGEM: motor/pdf.js (Super Organic Box), convertido por ferramentas/converter_modulo.cjs.
   Mude lá e converta de novo: os dois aplicativos usam a mesma lógica. */
(function () {
  "use strict";
  /* Gerador de PDF sem dependências: página A4, Helvetica (já embutida em todo leitor de PDF,
     então o texto fica selecionável e o arquivo, pequeno) e imagens JPEG. Recebe os blocos de
     relatorio.js, com cada imagem já convertida: { jpeg: Uint8Array, larguraPx, alturaPx }. */

  const { trechosDeFormula } = window.FormulaTexto;

  const LARGURA = 595; const ALTURA = 842; const MARGEM = 50;
  const AREA = LARGURA - 2 * MARGEM;
  const PONTO_POR_PX = 0.6;   // desenho de 100 px vira 60 pt na página, se couber
  const ENTRELINHA = 1.35;
  const CORPOS = { titulo: 20, secao: 14, subsecao: 12, texto: 10.5, rodape: 8.5 };

  // Larguras da Helvetica (AFM), de 32 a 126, em milésimos do corpo.
  const HELVETICA = [
    278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556,
    556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556,
    556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
  ];
  const FATOR_NEGRITO = 1.06;  // a Helvetica-Bold é um pouco mais larga; a margem evita passar da página

  // O que a Helvetica não tem vira o equivalente mais próximo.
  const TROCAS = new Map([
    ..."₀₁₂₃₄₅₆₇₈₉".split("").map((c, k) => [c, String(k)]), ..."⁰¹²³⁴⁵⁶⁷⁸⁹".split("").map((c, k) => [c, String(k)]),
    ["⁺", "+"], ["⁻", "-"], ["−", "-"], ["→", "->"], ["≡", "="], ["×", "x"], ["≥", ">="], ["≤", "<="],
  ]);
  const WIN_ANSI = new Map([["€", 0x80], ["‚", 0x82], ["„", 0x84], ["…", 0x85], ["‘", 0x91], ["’", 0x92], ["“", 0x93], ["”", 0x94], ["•", 0x95], ["–", 0x96], ["—", 0x97]]);

  function paraWinAnsi(texto) {
    const codigos = [];
    for (const c of String(texto).normalize("NFC")) {
      const troca = TROCAS.get(c);
      if (troca) { for (const t of troca) codigos.push(t.charCodeAt(0)); continue; }
      const especial = WIN_ANSI.get(c);
      const cp = c.codePointAt(0);
      if (especial) codigos.push(especial);
      else if (cp >= 32 && cp <= 126) codigos.push(cp);
      else if (cp >= 160 && cp <= 255) codigos.push(cp);
      else codigos.push(63);   // "?": melhor que sumir com o caractere
    }
    return codigos;
  }

  function larguraCodigo(cod) {
    if (cod >= 32 && cod <= 126) return HELVETICA[cod - 32];
    if (cod >= 192) {
      const base = String.fromCharCode(cod).normalize("NFD").charCodeAt(0);
      if (base >= 32 && base <= 126) return HELVETICA[base - 32];
    }
    return 556;
  }

  function larguraTexto(texto, corpo, negrito = false) {
    const soma = paraWinAnsi(texto).reduce((s, c) => s + larguraCodigo(c), 0);
    return (soma * corpo * (negrito ? FATOR_NEGRITO : 1)) / 1000;
  }

  // Quebra em linhas pela largura real. O primeiro recuo vale só para a primeira linha.
  function quebrarLinhas(texto, corpo, largura, primeiroRecuo = 0, negrito = false) {
    const linhas = [];
    let atual = "";
    const cabe = (t) => larguraTexto(t, corpo, negrito) <= largura - (linhas.length ? 0 : primeiroRecuo);
    for (const palavra of String(texto).split(/\s+/).filter(Boolean)) {
      const tentativa = atual ? `${atual} ${palavra}` : palavra;
      if (cabe(tentativa)) { atual = tentativa; continue; }
      if (atual) { linhas.push(atual); atual = ""; }
      // Palavra maior que a linha (nome longo, SMILES): corta por letras.
      let resto = palavra;
      while (!cabe(resto) && resto.length > 1) {
        let n = resto.length;
        while (n > 1 && !cabe(resto.slice(0, n))) n--;
        linhas.push(resto.slice(0, n));
        resto = resto.slice(n);
      }
      atual = resto;
    }
    if (atual) linhas.push(atual);
    return linhas;
  }

  // Texto literal do PDF: parênteses e barra escapados; acima de ASCII, em octal.
  function literal(texto) {
    let s = "(";
    for (const c of paraWinAnsi(texto)) {
      if (c === 40 || c === 41 || c === 92) s += `\\${String.fromCharCode(c)}`;
      else if (c >= 32 && c <= 126) s += String.fromCharCode(c);
      else s += `\\${c.toString(8).padStart(3, "0")}`;
    }
    return `${s})`;
  }

  const num = (x) => String(Math.round(x * 100) / 100);

  const CORPO_INDICE = 0.7;       // subscrito e sobrescrito, em relação ao corpo do texto
  const SUBIDA = { sub: -0.2, sup: 0.38 };

  // Texto com subscritos e sobrescritos: troca o corpo e a altura (Ts) dentro do mesmo bloco.
  function comIndices(texto, corpo, fonte) {
    return trechosDeFormula(texto).map((t) => (t.tipo === "normal"
      ? `/${fonte} ${num(corpo)} Tf 0 Ts ${literal(t.texto)} Tj`
      : `/${fonte} ${num(corpo * CORPO_INDICE)} Tf ${num(corpo * SUBIDA[t.tipo])} Ts ${literal(t.texto)} Tj`)).join(" ");
  }

  function paginar(blocos) {
    const paginas = [];
    let pagina = null;
    let y = 0;
    const novaPagina = () => { pagina = { ops: [] }; paginas.push(pagina); y = ALTURA - MARGEM; };
    const garantir = (altura) => { if (!pagina || y - altura < MARGEM + 14) novaPagina(); };
    const escrever = (x, texto, corpo, fonte, literalmente = false) => pagina.ops.push(`BT ${num(x)} ${num(y - corpo)} Td ${literalmente ? `/${fonte} ${num(corpo)} Tf ${literal(texto)} Tj` : comIndices(texto, corpo, fonte)} ET`);
    const imagens = [];

    const linhas = (lista, corpo, fonte, x = MARGEM) => {
      for (const l of lista) {
        garantir(corpo * ENTRELINHA);
        escrever(x, l, corpo, fonte);
        y -= corpo * ENTRELINHA;
      }
    };

    blocos.forEach((b, indice) => {
      const proximo = blocos[indice + 1];
      if (b.tipo === "titulo") {
        linhas(quebrarLinhas(b.texto, CORPOS.titulo, AREA, 0, true), CORPOS.titulo, "F2");
        y -= 6;
      } else if (b.tipo === "secao" || b.tipo === "subsecao") {
        const corpo = CORPOS[b.tipo];
        // Título não fica sozinho no pé da página: leva junto o que vem depois.
        const depois = proximo && proximo.tipo === "imagem" ? Math.min(proximo.alturaPx ? 200 : 60, 200) : 40;
        garantir(corpo * 2 + depois);
        y -= b.tipo === "secao" ? 12 : 6;
        escrever(MARGEM, b.texto, corpo, "F2");
        y -= corpo * ENTRELINHA;
        if (b.tipo === "secao") {
          pagina.ops.push(`0.6 w ${num(MARGEM)} ${num(y)} m ${num(LARGURA - MARGEM)} ${num(y)} l S`);
          y -= 6;
        }
      } else if (b.tipo === "texto") {
        linhas(quebrarLinhas(b.texto, CORPOS.texto, AREA), CORPOS.texto, "F1");
        y -= 3;
      } else if (b.tipo === "item") {
        const recuo = 12;
        const lista = quebrarLinhas(b.texto, CORPOS.texto, AREA - recuo);
        garantir(CORPOS.texto * ENTRELINHA);
        escrever(MARGEM, "•", CORPOS.texto, "F1");
        linhas(lista, CORPOS.texto, "F1", MARGEM + recuo);
      } else if (b.tipo === "par") {
        const rotulo = `${b.rotulo}: `;
        const recuo = larguraTexto(rotulo, CORPOS.texto, true) + 2;
        const emLinha = recuo < AREA * 0.6;
        const lista = quebrarLinhas(b.valor, CORPOS.texto, AREA, emLinha ? recuo : 0);
        garantir(CORPOS.texto * ENTRELINHA * 2);
        escrever(MARGEM, rotulo, CORPOS.texto, "F2");
        if (!emLinha) y -= CORPOS.texto * ENTRELINHA;
        lista.forEach((l, k) => {
          if (k > 0) garantir(CORPOS.texto * ENTRELINHA);
          escrever(k === 0 && emLinha ? MARGEM + recuo : MARGEM, l, CORPOS.texto, "F1", b.literal);
          y -= CORPOS.texto * ENTRELINHA;
        });
        y -= 2;
      } else if (b.tipo === "imagem") {
        const escala = Math.min(PONTO_POR_PX, AREA / b.larguraPx, 300 / b.alturaPx);
        const l = b.larguraPx * escala; const a = b.alturaPx * escala;
        garantir(a + 8);
        imagens.push(b);
        pagina.imagens = [...(pagina.imagens || []), imagens.length];
        pagina.ops.push(`q ${num(l)} 0 0 ${num(a)} ${num(MARGEM + (AREA - l) / 2)} ${num(y - a)} cm /Im${imagens.length} Do Q`);
        y -= a + 8;
      }
    });
    if (!paginas.length) novaPagina();
    return { paginas, imagens };
  }

  function gerarPdf({ titulo, blocos, rodape }) {
    const { paginas, imagens } = paginar(blocos);
    paginas.forEach((p, k) => {
      p.ops.push(`BT /F1 ${CORPOS.rodape} Tf ${MARGEM} 30 Td ${literal(`${rodape}${rodape ? " – " : ""}página ${k + 1} de ${paginas.length}`)} Tj ET`);
    });

    // Objetos: 1 catálogo, 2 páginas, 3 e 4 fontes, 5 informações; depois imagens e páginas.
    const n0Imagem = 6;
    const n0Pagina = n0Imagem + imagens.length;
    const nPagina = (k) => n0Pagina + k * 2;
    const objetos = [];
    objetos[1] = "<< /Type /Catalog /Pages 2 0 R >>";
    objetos[2] = `<< /Type /Pages /Count ${paginas.length} /Kids [${paginas.map((_, k) => `${nPagina(k)} 0 R`).join(" ")}] >>`;
    objetos[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
    objetos[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
    objetos[5] = `<< /Title ${literal(titulo)} /Producer (Super Organic Box) >>`;
    imagens.forEach((im, k) => {
      objetos[n0Imagem + k] = {
        cabecalho: `<< /Type /XObject /Subtype /Image /Width ${im.larguraPx} /Height ${im.alturaPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.jpeg.length} >>`,
        dados: im.jpeg,
      };
    });
    paginas.forEach((p, k) => {
      const conteudo = p.ops.join("\n");
      const xobjetos = (p.imagens || []).map((n) => `/Im${n} ${n0Imagem + n - 1} 0 R`).join(" ");
      objetos[nPagina(k)] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${LARGURA} ${ALTURA}] /Contents ${nPagina(k) + 1} 0 R `
        + `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << ${xobjetos} >> >> >>`;
      objetos[nPagina(k) + 1] = { cabecalho: `<< /Length ${conteudo.length} >>`, dados: conteudo };
    });

    const pedacos = [];
    let tamanho = 0;
    // Todo texto do PDF é ASCII puro (os acentos vão em octal), então um byte por caractere.
    const por = (x) => {
      const b = typeof x === "string" ? Uint8Array.from(x, (c) => c.charCodeAt(0)) : x;
      pedacos.push(b);
      tamanho += b.length;
    };
    por("%PDF-1.4\n");
    const posicoes = [];
    for (let n = 1; n < objetos.length; n++) {
      posicoes[n] = tamanho;
      const o = objetos[n];
      por(`${n} 0 obj\n`);
      if (typeof o === "string") por(o);
      else { por(`${o.cabecalho}\nstream\n`); por(o.dados); por("\nendstream"); }
      por("\nendobj\n");
    }
    const xref = tamanho;
    por(`xref\n0 ${objetos.length}\n0000000000 65535 f \n`);
    for (let n = 1; n < objetos.length; n++) por(`${String(posicoes[n]).padStart(10, "0")} 00000 n \n`);
    por(`trailer\n<< /Size ${objetos.length} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${xref}\n%%EOF\n`);

    const saida = new Uint8Array(tamanho);
    let p = 0;
    for (const b of pedacos) { saida.set(b, p); p += b.length; }
    return saida;
  }

  window.Pdf = { gerarPdf, paraWinAnsi, larguraTexto, quebrarLinhas, literal };
})();

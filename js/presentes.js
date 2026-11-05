/* SUPER MOLBOX — presentes do aluno: enfeites que nunca escondem conteúdo.

   - Paletas de cor com nome de indicador ácido-base, o assunto da titulação. O Tornassol é o
     presente de boas-vindas (o primeiro acerto no Treino); os outros abrem com os degraus da
     escada. As cores estão em paletas.css, geradas e medidas por ferramentas/gerar_paletas.cjs
     (contraste AA nos dois temas). As cores com significado (acerto, erro, energia, atenção,
     reagente e produto) não mudam.
   - Títulos pela escada do Treino, e o último também pelo Treino de Balanceamento. Cada título
     novo abre um acessório para o avatar (js/avatar.js).

   O mesmo desenho do Super Organic Box (dados/presentes.js de lá), com o conteúdo do MOLBOX.
   Funções puras, publicadas em window.Presentes. */
(function () {
  "use strict";

  const CHAVE_PREFERENCIAS = "molbox.preferencias.v1";
  const PALETA_PADRAO = "institucional";

  /* `abre(p)`: a paleta está aberta com este progresso? */
  const PALETAS = [
    { id: "institucional", nome: "Institucional", descricao: "A paleta original do SUPER MOLBOX.", condicao: "", abre: () => true, indicador: null },
    {
      id: "tornassol", nome: "Tornassol", descricao: "O roxo do papel de tornassol.",
      condicao: "Abre com o primeiro acerto no Treino.", abre: (p) => p.totalAcertos >= 1,
      indicador: { acido: "vermelho", base: "azul", faixa: "de 4,5 a 8,3",
        texto: "Extraído de liquens, é um dos indicadores mais antigos. O papel de tornassol fica vermelho em meio ácido e azul em meio básico: serve para dizer de que lado está a solução, não o pH exato." },
    },
    {
      id: "fenolftaleina", nome: "Fenolftaleína", descricao: "O rosa do fim da titulação.",
      condicao: "Abre com o degrau Contagem.", abre: (p) => p.desbloqueado >= 2,
      indicador: { acido: "incolor", base: "rosa", faixa: "de 8,2 a 10",
        texto: "O indicador clássico da titulação de ácido forte com base forte: a solução fica incolor até o ponto de equivalência e ganha um rosa claro com a primeira gota de base em excesso." },
    },
    {
      id: "alaranjado", nome: "Alaranjado de metila", descricao: "Do vermelho ao amarelo.",
      condicao: "Abre com o degrau Mol.", abre: (p) => p.desbloqueado >= 3,
      indicador: { acido: "vermelho", base: "amarelo", faixa: "de 3,1 a 4,4",
        texto: "Muda de cor em meio bem ácido. Por isso é o escolhido para titular uma base fraca com um ácido forte, quando o ponto de equivalência fica abaixo de pH 7." },
    },
    {
      id: "bromocresol", nome: "Verde de bromocresol", descricao: "Do amarelo ao azul, passando pelo verde.",
      condicao: "Abre com o degrau Reação.", abre: (p) => p.desbloqueado >= 4,
      indicador: { acido: "amarelo", base: "azul", faixa: "de 3,8 a 5,4",
        texto: "Amarelo em meio ácido, azul em meio menos ácido, e verde no meio da viragem. No laboratório clínico, também é usado para dosar a albumina do sangue." },
    },
  ];

  const TITULOS = [
    "Aprendiz de bancada",
    "Curioso(a) do átomo",
    "Leitor(a) de fórmulas",
    "Contador(a) de partículas",
    "Construtor(a) de pontes",
    "Estequiometrista",
    "Químico(a) de bancada",
  ];

  const ACERTOS_NO_ULTIMO = 5;
  const ACERTOS_BALANCEAMENTO = 10;

  const inteiro = (v) => (Number.isInteger(v) && v >= 0 ? v : 0);

  /* Índice do título: um por degrau aberto; Estequiometrista com 5 acertos no degrau Reação;
     Químico(a) de bancada com isso e mais 10 acertos no Treino de Balanceamento. */
  function indiceDoTitulo(p) {
    const aberto = Math.min(inteiro(p && p.desbloqueado), 4);
    if (aberto < 4) return aberto;
    const reacao = (p.porDegrau && p.porDegrau[4] && p.porDegrau[4].acertos) || 0;
    if (reacao < ACERTOS_NO_ULTIMO) return 4;
    const bal = (p.extras && p.extras.balanceamento && p.extras.balanceamento.acertos) || 0;
    return bal >= ACERTOS_BALANCEAMENTO ? 6 : 5;
  }

  function tituloDo(p) { return TITULOS[indiceDoTitulo(p)]; }

  function proximoTitulo(p) {
    const i = indiceDoTitulo(p);
    if (i >= TITULOS.length - 1) return "";
    if (i < 4) return `Próximo título: ${TITULOS[i + 1]}. Ele abre com o próximo degrau do Treino.`;
    if (i === 4) {
      const feitos = (p.porDegrau && p.porDegrau[4] && p.porDegrau[4].acertos) || 0;
      const faltam = Math.max(1, ACERTOS_NO_ULTIMO - feitos);
      return `Próximo título: ${TITULOS[5]}. ${faltam === 1 ? "Falta 1 acerto" : `Faltam ${faltam} acertos`} no degrau Reação.`;
    }
    const bal = (p.extras && p.extras.balanceamento && p.extras.balanceamento.acertos) || 0;
    const faltam = Math.max(1, ACERTOS_BALANCEAMENTO - bal);
    return `Próximo título: ${TITULOS[6]}. ${faltam === 1 ? "Falta 1 acerto" : `Faltam ${faltam} acertos`} no Treino: Balanceamento.`;
  }

  function estadoDasPaletas(p) {
    return PALETAS.map((x) => {
      let aberta = false;
      try { aberta = !!p && x.abre(p); } catch (e) { aberta = false; }
      return { ...x, aberta };
    });
  }

  function paletaAberta(id, p) {
    const x = PALETAS.find((y) => y.id === id);
    return !!x && estadoDasPaletas(p).some((y) => y.id === id && y.aberta);
  }

  /* As paletas que abriram entre dois progressos (para a comemoração no Treino). */
  function paletasQueAbriram(antes, depois) {
    const a = new Set(estadoDasPaletas(antes).filter((x) => x.aberta).map((x) => x.id));
    return estadoDasPaletas(depois).filter((x) => x.aberta && !a.has(x.id) && x.id !== PALETA_PADRAO);
  }

  function lerPreferencias(bruto) {
    // `apelido`: o nome do crachá do avatar; não sai do aparelho.
    const padrao = { paleta: PALETA_PADRAO, vistas: 0, avatar: null, linkTurma: "", nome: "", apelido: "" };
    try {
      const d = JSON.parse(bruto);
      if (!d || typeof d !== "object" || Array.isArray(d)) return padrao;
      return {
        paleta: typeof d.paleta === "string" && PALETAS.some((x) => x.id === d.paleta) ? d.paleta : PALETA_PADRAO,
        vistas: Number.isInteger(d.vistas) && d.vistas >= 0 ? d.vistas : 0,
        avatar: d.avatar && typeof d.avatar === "object" && !Array.isArray(d.avatar) ? d.avatar : null,
        linkTurma: typeof d.linkTurma === "string" ? d.linkTurma.slice(0, 300) : "",
        nome: typeof d.nome === "string" ? d.nome.slice(0, 60) : "",
        apelido: typeof d.apelido === "string" ? d.apelido.slice(0, 18) : "",
      };
    } catch (e) {
      return padrao;
    }
  }

  window.Presentes = {
    CHAVE_PREFERENCIAS, PALETA_PADRAO, PALETAS, TITULOS,
    indiceDoTitulo, tituloDo, proximoTitulo, estadoDasPaletas, paletaAberta, paletasQueAbriram, lerPreferencias,
  };
})();

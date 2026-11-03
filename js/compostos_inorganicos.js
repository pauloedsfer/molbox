/* SUPER MOLBOX — a prateleira de troféus da nomenclatura inorgânica: 52 compostos do
   cotidiano e da bancada (lista aprovada pelo professor em 03/11/2026). Cada um é montado na
   tela Nomenclatura inorgânica; quem monta ganha o troféu. `formula` é exatamente a que
   NomenclaturaInorganica.montar gera (um teste confere que todos são montáveis), e `usual` é
   o nome do dia a dia que aparece na prateleira. Os textos aguardam a revisão do professor.

   Os troféus ficam guardados no aparelho (molbox.trofeus.v1), como no Super Organic Box. */
(function () {
  "use strict";

  const CHAVE_TROFEUS = "molbox.trofeus.v1";

  const t = (formula, funcao, usual) => ({ id: formula, formula, funcao, usual });

  const TROFEUS = [
    // ácidos
    t("HCl", "acido", "ácido muriático, na limpeza pesada; também é o ácido do estômago"),
    t("HF", "acido", "usado para gravar vidro"),
    t("H2S", "acido", "o cheiro de ovo podre"),
    t("HCN", "acido", "gás muito tóxico; os cianetos aparecem na mineração de ouro"),
    t("H2SO4", "acido", "ácido de bateria, o mais produzido pela indústria"),
    t("HNO3", "acido", "matéria-prima de fertilizantes e explosivos"),
    t("H3PO4", "acido", "acidulante dos refrigerantes de cola"),
    t("H2CO3", "acido", "forma-se na água com gás"),
    t("CH3COOH", "acido", "o ácido do vinagre"),
    t("HClO", "acido", "forma-se na água clorada e desinfeta"),
    t("HClO4", "acido", "um dos ácidos mais fortes da bancada"),
    t("HNO2", "acido", "seus sais, os nitritos, conservam carnes"),
    // bases
    t("NaOH", "base", "soda cáustica, no desentupidor e na fabricação de sabão"),
    t("KOH", "base", "potassa cáustica, no sabão mole"),
    t("Ca(OH)2", "base", "cal hidratada, na argamassa e na caiação"),
    t("Mg(OH)2", "base", "leite de magnésia, antiácido e laxante"),
    t("Al(OH)3", "base", "antiácido; também no tratamento de água"),
    t("NH4OH", "base", "amoníaco, em produtos de limpeza"),
    t("Ba(OH)2", "base", "base forte da bancada, para titulações"),
    t("Fe(OH)3", "base", "o precipitado castanho-avermelhado que aparece quando o ferro enferruja na água"),
    // sais
    t("NaCl", "sal", "sal de cozinha e soro fisiológico"),
    t("KCl", "sal", "sal light e reposição de potássio"),
    t("NaHCO3", "sal", "bicarbonato de sódio, no fermento e no antiácido"),
    t("Na2CO3", "sal", "barrilha, na fabricação de vidro e no tratamento de piscina"),
    t("CaCO3", "sal", "calcário, mármore, giz e casca de ovo"),
    t("NaClO", "sal", "água sanitária"),
    t("NaF", "sal", "o flúor do creme dental"),
    t("KI", "sal", "o iodo do sal iodado"),
    t("KNO3", "sal", "salitre, em fertilizantes e na pólvora"),
    t("NH4Cl", "sal", "sal amoníaco, nas pilhas secas e na solda"),
    t("NH4NO3", "sal", "fertilizante nitrogenado e compressa fria"),
    t("CaSO4·2H2O", "sal", "gesso"),
    t("CuSO4·5H2O", "sal", "os cristais azuis da bancada; fungicida na agricultura"),
    t("KMnO4", "sal", "permanganato, antisséptico e oxidante de titulação"),
    t("K2Cr2O7", "sal", "dicromato, oxidante laranja da bancada"),
    t("AgNO3", "sal", "nitrato de prata, na análise de cloretos"),
    t("Ca3(PO4)2", "sal", "o mineral dos ossos e dos dentes"),
    t("FeSO4", "sal", "suplemento de ferro contra anemia"),
    t("MgSO4·7H2O", "sal", "sal amargo (sal de Epsom), laxante e banho de pés"),
    t("Al2(SO4)3", "sal", "coagulante no tratamento de água"),
    // óxidos
    t("CaO", "oxido", "cal virgem, na construção"),
    t("MgO", "oxido", "magnésia, em antiácidos e tijolos refratários"),
    t("Al2O3", "oxido", "alumina, de onde se tira o alumínio; também na lixa"),
    t("ZnO", "oxido", "pomada contra assaduras e protetor solar"),
    t("Fe2O3", "oxido", "a ferrugem e o minério de ferro (hematita)"),
    t("CO2", "oxido", "gás carbônico, na respiração e no refrigerante"),
    t("CO", "oxido", "gás tóxico da queima incompleta"),
    t("SO2", "oxido", "poluente que forma chuva ácida; conservante de vinho"),
    t("NO2", "oxido", "o gás castanho da poluição dos carros"),
    t("N2O", "oxido", "gás hilariante, anestésico do dentista"),
    t("SiO2", "oxido", "areia, quartzo e vidro"),
    t("H2O2", "oxido", "água oxigenada"),
  ];

  const lerLista = (bruto) => {
    try {
      const d = JSON.parse(bruto);
      return Array.isArray(d) ? d.filter((x) => x && typeof x.id === "string" && TROFEUS.some((y) => y.id === x.id)) : [];
    } catch (e) { return []; }
  };

  function carregarTrofeus(armazenamento) {
    try { return lerLista(armazenamento && armazenamento.getItem(CHAVE_TROFEUS)); } catch (e) { return []; }
  }

  /* Devolve se o troféu é novo. Lê de novo antes de gravar: outra aba pode ter ganhado um. */
  function ganharTrofeu(armazenamento, id, quando) {
    if (!TROFEUS.some((x) => x.id === id)) return false;
    const lista = carregarTrofeus(armazenamento);
    if (lista.some((x) => x.id === id)) return false;
    try { armazenamento.setItem(CHAVE_TROFEUS, JSON.stringify(lista.concat({ id, em: quando }))); } catch (e) { /* segue sem guardar */ }
    return true;
  }

  const trofeuDaFormula = (formula) => TROFEUS.find((x) => x.formula === formula) || null;

  window.CompostosInorganicos = { CHAVE_TROFEUS, TROFEUS, carregarTrofeus, ganharTrofeu, trofeuDaFormula };
})();

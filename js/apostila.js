/* MOLBOX — apostila viva.
   Fichas de consulta rápida: constantes, solubilidade, série eletroquímica
   e prefixos do SI. Todo valor aqui é curado à mão, nunca calculado — o
   objetivo é ser fonte de referência, não de cálculo. A ficha de
   indicadores não tem array próprio: app.js lê INDICADORES direto de
   acidobase.js, para não ter dois lugares com a mesma faixa de viragem. */

const FICHA_CONSTANTES = [
  { nome: "Constante de Avogadro", simbolo: "NA", valor: CONSTANTES.AVOGADRO, unidade: "mol⁻¹",
    nota: "número de entidades em um mol; valor exato desde a redefinição do SI em 2019" },
  { nome: "Produto iônico da água a 25 °C", simbolo: "Kw", valor: KW_25, unidade: "—",
    nota: "[H⁺]×[OH⁻]; base da relação pH + pOH = 14 a 25 °C" },
  { nome: "Constante dos gases ideais", simbolo: "R", valor: 0.082057, unidade: "atm·L·mol⁻¹·K⁻¹",
    nota: "forma usada com pressão em atm e volume em litros" },
  { nome: "Constante dos gases ideais", simbolo: "R", valor: 8.31446, unidade: "J·mol⁻¹·K⁻¹",
    nota: "forma usada em unidades do SI, energia em joules" },
  { nome: "Constante de Faraday", simbolo: "F", valor: 96485, unidade: "C·mol⁻¹",
    nota: "carga elétrica de um mol de elétrons" },
  ...VOLUMES_MOLARES.map((v) => ({
    nome: "Volume molar — " + v.rotulo, simbolo: "Vm", valor: v.valor, unidade: "L/mol", nota: v.detalhe,
  })),
];

const FICHA_SOLUBILIDADE = [
  { grupo: "Nitratos (NO3⁻) e acetatos (CH3COO⁻)",
    regra: "Sempre solúveis", excecoes: "Nenhuma exceção relevante." },
  { grupo: "Sais de metais alcalinos e de amônio (NH4⁺)",
    regra: "Sempre solúveis", excecoes: "Nenhuma exceção relevante." },
  { grupo: "Cloretos, brometos e iodetos",
    regra: "Geralmente solúveis", excecoes: "Exceto com Ag⁺, Pb²⁺ e Hg2²⁺." },
  { grupo: "Sulfatos (SO4²⁻)",
    regra: "Geralmente solúveis", excecoes: "Exceto com Ba²⁺, Sr²⁺ e Pb²⁺; CaSO4 é pouco solúvel." },
  { grupo: "Carbonatos, fosfatos e sulfetos",
    regra: "Geralmente insolúveis", excecoes: "Exceto com metais alcalinos e amônio." },
  { grupo: "Hidróxidos (OH⁻)",
    regra: "Geralmente insolúveis", excecoes: "Exceto com metais alcalinos; Ba(OH)2 e Ca(OH)2 se dissolvem em grau menor." },
];

const FICHA_ELETROQUIMICA = [
  { nome: "Lítio",      semirreacao: "Li⁺ + e⁻ ⇌ Li",   potencial: -3.04 },
  { nome: "Potássio",   semirreacao: "K⁺ + e⁻ ⇌ K",     potencial: -2.93 },
  { nome: "Cálcio",     semirreacao: "Ca²⁺ + 2e⁻ ⇌ Ca", potencial: -2.87 },
  { nome: "Sódio",      semirreacao: "Na⁺ + e⁻ ⇌ Na",   potencial: -2.71 },
  { nome: "Magnésio",   semirreacao: "Mg²⁺ + 2e⁻ ⇌ Mg", potencial: -2.36 },
  { nome: "Alumínio",   semirreacao: "Al³⁺ + 3e⁻ ⇌ Al", potencial: -1.66 },
  { nome: "Zinco",      semirreacao: "Zn²⁺ + 2e⁻ ⇌ Zn", potencial: -0.76 },
  { nome: "Ferro",      semirreacao: "Fe²⁺ + 2e⁻ ⇌ Fe", potencial: -0.44 },
  { nome: "Níquel",     semirreacao: "Ni²⁺ + 2e⁻ ⇌ Ni", potencial: -0.25 },
  { nome: "Estanho",    semirreacao: "Sn²⁺ + 2e⁻ ⇌ Sn", potencial: -0.14 },
  { nome: "Chumbo",     semirreacao: "Pb²⁺ + 2e⁻ ⇌ Pb", potencial: -0.13 },
  { nome: "Hidrogênio", semirreacao: "H⁺ + e⁻ ⇌ ½H₂",   potencial: 0.00 },
  { nome: "Cobre",      semirreacao: "Cu²⁺ + 2e⁻ ⇌ Cu", potencial: 0.34 },
  { nome: "Prata",      semirreacao: "Ag⁺ + e⁻ ⇌ Ag",   potencial: 0.80 },
  { nome: "Ouro",       semirreacao: "Au³⁺ + 3e⁻ ⇌ Au", potencial: 1.50 },
];

const FICHA_PREFIXOS = [
  { nome: "Giga",  simbolo: "G",  potencia: 9 },
  { nome: "Mega",  simbolo: "M",  potencia: 6 },
  { nome: "Quilo", simbolo: "k",  potencia: 3 },
  { nome: "Hecto", simbolo: "h",  potencia: 2 },
  { nome: "Deca",  simbolo: "da", potencia: 1 },
  { nome: "Deci",  simbolo: "d",  potencia: -1 },
  { nome: "Centi", simbolo: "c",  potencia: -2 },
  { nome: "Mili",  simbolo: "m",  potencia: -3 },
  { nome: "Micro", simbolo: "µ",  potencia: -6 },
  { nome: "Nano",  simbolo: "n",  potencia: -9 },
  { nome: "Pico",  simbolo: "p",  potencia: -12 },
];

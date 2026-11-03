/* Gera paletas.css (presentes do aluno, js/presentes.js) e mede o contraste antes de escrever.
   Uso: node ferramentas/gerar_paletas.cjs. Só as cores de marca e de superfície mudam; acerto,
   erro, energia, atenção, reagente e produto continuam iguais, porque carregam significado. */
const fs = require("fs");
const path = require("path");

const PALETAS = {
  tornassol: {
    claro: { fundo: "#F7F5FB", "superficie-2": "#EFEAF7", borda: "#DCD2EC", "borda-forte": "#A99CC4", estrutura: "#4A2C82", barra: "#4A2C82", interacao: "#5B3A99", "interacao-bg": "#EEE8F8" },
    escuro: { fundo: "#120E1C", superficie: "#1A1528", "superficie-2": "#241D36", borda: "#3A3052", "borda-forte": "#5A4C7E", texto: "#EDE8F7", "texto-2": "#BDB1D6", estrutura: "#C9B3F2", barra: "#1B1330", interacao: "#C9B3F2", "interacao-bg": "#2A2040", "texto-inv": "#120E1C" },
  },
  fenolftaleina: {
    claro: { fundo: "#FCF4F8", "superficie-2": "#F8E6EF", borda: "#ECCBDB", "borda-forte": "#C99AB2", estrutura: "#9C1458", barra: "#9C1458", interacao: "#A3195B", "interacao-bg": "#FBE7F0" },
    escuro: { fundo: "#1C0E15", superficie: "#28141E", "superficie-2": "#341B28", borda: "#50293C", "borda-forte": "#7A4560", texto: "#F8E8F0", "texto-2": "#DDB5C8", estrutura: "#FF9ECB", barra: "#24101A", interacao: "#FF9ECB", "interacao-bg": "#3A1A2A", "texto-inv": "#1C0E15" },
  },
  alaranjado: {
    claro: { fundo: "#FDF7F1", "superficie-2": "#FBEBDC", borda: "#F0D6BE", "borda-forte": "#D2A77F", estrutura: "#9C3D0A", barra: "#9C3D0A", interacao: "#A64A0C", "interacao-bg": "#FDEEE2" },
    escuro: { fundo: "#1C120B", superficie: "#271A10", "superficie-2": "#332317", borda: "#4D3522", "borda-forte": "#7A5536", texto: "#F7E9DC", "texto-2": "#D6B9A0", estrutura: "#FFB47A", barra: "#22150C", interacao: "#FFB47A", "interacao-bg": "#3A2414", "texto-inv": "#1C120B" },
  },
  bromocresol: {
    claro: { fundo: "#F2F9F8", "superficie-2": "#E3F1EE", borda: "#C7E2DD", "borda-forte": "#8EBDB5", estrutura: "#0F6158", barra: "#0F6158", interacao: "#0E6B61", "interacao-bg": "#E2F4F1" },
    escuro: { fundo: "#0A1716", superficie: "#10211F", "superficie-2": "#172D2A", borda: "#2A4744", "borda-forte": "#41706B", texto: "#E3F3F0", "texto-2": "#A7CCC6", estrutura: "#7FDCCD", barra: "#0B1D1B", interacao: "#7FDCCD", "interacao-bg": "#12302C", "texto-inv": "#0A1716" },
  },
};

// O que a paleta não troca: os valores de tokens.css (claro e escuro).
const BASE = {
  claro: { superficie: "#FFFFFF", texto: "#0F172A", "texto-2": "#475569", acerto: "#1B7A3A", erro: "#B3271E", energia: "#C43C0E", atencao: "#8A5200" },
  escuro: { acerto: "#4FD07A", erro: "#FF8A80", energia: "#FF7A45", atencao: "#E8B341" },
};

const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const PARES = [["texto", "fundo"], ["texto", "superficie"], ["texto-2", "superficie"], ["texto-2", "superficie-2"], ["estrutura", "fundo"], ["estrutura", "superficie"],
  ["interacao", "superficie"], ["interacao", "interacao-bg"], ["acerto", "superficie"], ["erro", "superficie"], ["energia", "superficie"], ["atencao", "superficie"]];

let ruins = 0;
for (const [nome, p] of Object.entries(PALETAS)) for (const tema of ["claro", "escuro"]) {
  const c = { ...BASE[tema], ...p[tema] };
  const medidas = PARES.map(([a, b]) => [`${a}/${b}`, contraste(c[a], c[b])]);
  medidas.push(["branco/barra", contraste("#FFFFFF", c.barra)]);
  if (tema === "claro") medidas.push(["branco/botão", contraste("#FFFFFF", c.interacao)]);
  for (const [par, v] of medidas) if (v < 4.5) { ruins++; console.error(`${nome} ${tema} ${par} = ${v.toFixed(2)}`); }
}
if (ruins) { console.error("contraste abaixo de 4,5: nada foi escrito"); process.exit(1); }

const bloco = (sel, c, ind) => `${ind}${sel} {\n${Object.entries(c).map(([k, v]) => `${ind}  --mb-${k}: ${v};`).join("\n")}\n${ind}}`;
let css = `/* Paletas de presente (js/presentes.js). Gerado por ferramentas/gerar_paletas.cjs: mude as cores
   lá. Este arquivo vem depois de tokens.css; a versão escura de cada paleta vem depois da clara e,
   com o mesmo seletor, ganha dela no tema escuro. */
`;
// O menu lateral fica sempre na cor escura da marca da paleta (no original, o azul institucional).
for (const p of Object.values(PALETAS)) { p.claro["lateral-fundo"] = p.claro.barra; p.escuro["lateral-fundo"] = p.claro.barra; }
for (const [n, p] of Object.entries(PALETAS)) {
  css += `\n/* ---------- ${n} ---------- */\n\n` + bloco(`:root[data-paleta="${n}"]`, p.claro, "") + "\n\n";
  css += "@media (prefers-color-scheme: dark) {\n" + bloco(`:root[data-paleta="${n}"]`, p.escuro, "  ") + "\n}\n";
}
fs.writeFileSync(path.join(__dirname, "..", "paletas.css"), css);
console.log("paletas.css");

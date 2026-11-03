/* Gera marca/molbox-negativo-<paleta>.svg: a marca negativa (sobre a barra) recolorida para cada
   paleta de presente. Troca o laranja do SUPER (e do ponto central) e o azul-claro do BOX.
   Uso: node ferramentas/gerar_marcas.cjs */
const fs = require("fs");
const path = require("path");
const raiz = path.join(__dirname, "..", "marca");
const base = fs.readFileSync(path.join(raiz, "molbox-negativo.svg"), "utf8");
const CORES = {
  tornassol: { super: "#FF9AAE", box: "#B4C2FF" },
  fenolftaleina: { super: "#FFD1E6", box: "#FF9ECB" },
  alaranjado: { super: "#FFE066", box: "#FFB47A" },
  bromocresol: { super: "#F4E06D", box: "#8FD8F0" },
};
for (const [nome, c] of Object.entries(CORES)) {
  const svg = base.replaceAll("#E84910", c.super).replaceAll("#6FC5F0", c.box);
  fs.writeFileSync(path.join(raiz, `molbox-negativo-${nome}.svg`), svg);
  console.log(`marca/molbox-negativo-${nome}.svg`);
}

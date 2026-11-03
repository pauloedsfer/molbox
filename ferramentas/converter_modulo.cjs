/* Converte um módulo ES do Super Organic Box em script clássico do MOLBOX: tira import/export,
   embrulha numa função e publica os nomes exportados em window[global].
   Uso: node ferramentas/converter_modulo.cjs <origem.js> <destino.js> <NomeGlobal> <caminho de origem para o cabeçalho> */
const fs = require("fs");
const [origem, destino, nomeGlobal, rotulo] = process.argv.slice(2);
const texto = fs.readFileSync(origem, "utf8");
const exp = texto.match(/^export \{([\s\S]*?)\};?\s*$/m);
if (!exp) throw new Error("sem export no fim: " + origem);
const nomes = exp[1].split(",").map((s) => s.trim()).filter(Boolean).map((s) => {
  const m = s.match(/^(\w+)(?:\s+as\s+(\w+))?$/);
  return { local: m[1], publico: m[2] || m[1] };
});
const corpo = texto.replace(exp[0], "").replace(/^import .*$/gm, "").trimEnd();
const saida = `/* ORIGEM: ${rotulo} (Super Organic Box), convertido por ferramentas/converter_modulo.cjs.
   Mude lá e converta de novo: os dois aplicativos usam a mesma lógica. */
(function () {
  "use strict";
${corpo.split("\n").map((l) => (l ? "  " + l : l)).join("\n")}

  window.${nomeGlobal} = { ${nomes.map((n) => (n.local === n.publico ? n.local : `${n.publico}: ${n.local}`)).join(", ")} };
})();
`;
fs.writeFileSync(destino, saida);
console.log(destino, "->", nomes.map((n) => n.publico).join(", "));

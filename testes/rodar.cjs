/* Executor de testes do SUPER MOLBOX: node testes/rodar.cjs [trecho]
   Carrega os scripts clássicos de js/ num contexto isolado (como o navegador faria, em ordem) e
   roda cada testes/teste_*.cjs. Sai com código 1 se algum teste falhar. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RAIZ = path.join(__dirname, "..");
function carregar(arquivos) {
  const ctx = { console, window: {}, Date, Math, JSON };
  vm.createContext(ctx);
  for (const a of arquivos) vm.runInContext(fs.readFileSync(path.join(RAIZ, a), "utf8"), ctx, { filename: a });
  return ctx;
}

const testes = [];
const teste = (nome, fn) => testes.push({ nome, fn });
function igual(obtido, esperado, msg) {
  const a = JSON.stringify(obtido), b = JSON.stringify(esperado);
  if (a !== b) throw new Error(`${msg ? msg + ": " : ""}obtido ${a}; esperado ${b}`);
}
function verdadeiro(v, msg) { if (!v) throw new Error(msg || "esperava verdadeiro"); }

const trecho = process.argv[2] || "";
for (const f of fs.readdirSync(__dirname).filter((f) => /^teste_.*\.cjs$/.test(f) && f.includes(trecho)).sort()) {
  require(path.join(__dirname, f))({ teste, igual, verdadeiro, carregar, RAIZ });
}
let falhas = 0;
for (const { nome, fn } of testes) {
  try { fn(); console.log(`✓ ${nome}`); } catch (e) { falhas++; console.log(`✗ ${nome} — ${e.message}`); }
}
console.log(`${testes.length} testes, ${falhas} falhas`);
process.exitCode = falhas ? 1 : 0;

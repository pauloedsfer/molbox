/* O pacote: o que a página carrega existe e está no service worker (senão some sem internet). */
const fs = require("fs");
const path = require("path");
module.exports = ({ teste, igual, verdadeiro, carregar, RAIZ }) => {
  const ler = (f) => fs.readFileSync(path.join(RAIZ, f), "utf8");
  const html = ler("index.html");
  const sw = ler("sw.js");
  const listados = new Set([...sw.match(/const ARQUIVOS = \[([\s\S]*?)\];/)[1].matchAll(/"\.\/([^"]*)"/g)].map((m) => m[1]).filter(Boolean));

  teste("todo script e estilo da página existe e está no sw.js", () => {
    const usados = [...html.matchAll(/(?:src|href)="((?:js|marca|icones)\/[^"]+|[\w-]+\.css)"/g)].map((m) => m[1]);
    verdadeiro(usados.length > 20);
    for (const u of usados) {
      verdadeiro(fs.existsSync(path.join(RAIZ, u)), "não existe: " + u);
      verdadeiro(listados.has(u), "falta no sw.js: " + u);
    }
  });

  teste("tudo o que o sw.js lista existe", () => {
    for (const a of listados) verdadeiro(fs.existsSync(path.join(RAIZ, a)), "listado mas inexistente: " + a);
    for (const p of ["tornassol", "fenolftaleina", "alaranjado", "bromocresol"]) verdadeiro(listados.has(`marca/molbox-negativo-${p}.svg`), p);
  });

  teste("a ordem dos scripts respeita as dependências", () => {
    const ordem = [...html.matchAll(/<script src="js\/([\w]+)\.js"/g)].map((m) => m[1]);
    const antes = (a, b) => verdadeiro(ordem.indexOf(a) >= 0 && ordem.indexOf(a) < ordem.indexOf(b), `${a} antes de ${b}`);
    antes("parser", "app"); antes("formula_texto", "pdf"); antes("nomenclatura_inorganica", "app"); antes("compostos_inorganicos", "app");
    antes("presentes", "app"); antes("tempo", "app"); antes("pdf", "app");
  });

  teste("resumo do professor leva tempo de uso e compostos da prateleira", () => {
    const ctx = carregar(["js/progresso.js"]);
    const p = { xp: 10, totalAcertos: 1, totalTentativas: 2, acertosSemDica: 1, melhorSequencia: 1, desbloqueado: 0, melhorOfensiva: 1, ofensiva: 1, ultimoDia: null, porDegrau: { 0: { acertos: 1, erros: 1 } }, porTipo: {}, extras: {} };
    const linha = ctx.exportarProgresso(p, "MASO07", { tempoMin: 95, moleculas: { encontradas: 12, total: 52 } });
    verdadeiro(linha.startsWith("MOLBOX1;cod=MASO07;") && linha.includes(";tmp=95") && linha.includes(";mol=12/52"), linha);
    verdadeiro(!ctx.exportarProgresso(p, "MASO07").includes("mol="));
  });

  teste("o gerador de PDF convertido do Organic produz um PDF", () => {
    const ctx = carregar(["js/formula_texto.js", "js/pdf.js"]);
    const b = ctx.window.Pdf.gerarPdf({ titulo: "Certificado", blocos: [{ tipo: "titulo", texto: "Certificado" }, { tipo: "secao", texto: "Ana Júlia" }], rodape: "SUPER MOLBOX" });
    igual(Buffer.from(b.slice(0, 8)).toString(), "%PDF-1.4");
  });

  teste("presentes: título, paletas e preferências com lixo", () => {
    const ctx = carregar(["js/presentes.js"]);
    const P = ctx.window.Presentes;
    igual(P.tituloDo({ desbloqueado: 0 }), "Aprendiz de bancada");
    igual(P.tituloDo({ desbloqueado: 4, porDegrau: { 4: { acertos: 5 } }, extras: { balanceamento: { acertos: 10 } } }), "Químico(a) de bancada");
    igual(P.estadoDasPaletas({ desbloqueado: 0, totalAcertos: 1 }).filter((x) => x.aberta).map((x) => x.id).join(","), "institucional,tornassol");
    igual(JSON.stringify(P.lerPreferencias("{lixo")), JSON.stringify({ paleta: "institucional", vistas: 0, avatar: null, linkTurma: "", nome: "", apelido: "" }));
  });
};

# MOLBOX v0.5

Do átomo ao mol, do mol à bancada.

Site estático. Sem backend, sem CDN, sem build. Funciona offline depois da
primeira visita e instala como aplicativo no celular.

## Telas

**Fundamentos** — massa molar com estrutura e núcleo, ponte do mol, tabela
periódica.

**Reações** — balanceamento por álgebra linear exata, estequiometria com
reagente limitante, pureza e rendimento.

**Soluções** — concentração em sete unidades, diluição, mistura; preparo de
bancada; pH de ácidos, bases e tampões; simulador de titulação.

**Prática** — treino com diagnóstico de erro e painel de progresso.

## Rodar localmente

```
cd app
python3 -m http.server 8000
```

## Publicar na Vercel

```
cd app
npx vercel --prod
```

## Rodar os testes

```
npm install jsdom
node testes/teste_fase0.js        #  27 — fórmulas, conversões, tabela
node testes/teste_fase1.js        #  45 — menu, treino, progresso
node testes/teste_fase2.js        #  44 — balanceamento, estequiometria
node testes/teste_ferramentas.js  #  60 — calculadora, estrutura, núcleo
node testes/teste_fase3.js        # 111 — soluções, preparo, pH, titulação
```

## O que a Fase 3 acrescenta

**Concentração.** Sete unidades que convertem entre si sem perda: mol/L, g/L,
% m/m, % m/v, ppm, molalidade e título. Mais fração molar, diluição por
C₁V₁ = C₂V₂ resolvendo o campo em branco, e mistura de soluções.

**Preparo de bancada.** Quanto pesar considerando a pureza do rótulo, qual
balança, qual balão, qual pipeta, e o roteiro na ordem certa. Reagentes
líquidos entram pela densidade e pela porcentagem do frasco.

**pH.** Ácido forte, ácido fraco de um a três prótons, base forte, base fraca
e tampão, com acervo de quinze ácidos e sete bases.

**Titulação.** Curva completa ponto a ponto, pontos de equivalência marcados,
nove indicadores com o erro percentual que cada um introduz, e o veredito de
qual serve.

## A decisão de projeto que sustenta tudo isso

Nenhum pH sai de fórmula aproximada. Todos saem do balanço de cargas resolvido
numericamente:

```
[H⁺] + [cátions fortes] = Σ (carga dos ânions) + [OH⁻]
```

Essa equação vale em qualquer ponto: no início, na meia-neutralização, na
equivalência e no excesso. A função é monótona em [H⁺], o que permite resolver
por bisseção em escala logarítmica — que converge sempre, sem chute inicial e
sem o risco de divergência do método de Newton.

A diferença aparece justamente onde o aluno tem dúvida:

- HCl 10⁻⁸ mol/L dá **pH 6,98**, não 8. A fórmula pH = −log(C) devolve um
  valor básico para um ácido, resultado impossível que ainda circula em
  material didático.
- Um tampão acetato 1:1 a 10⁻⁴ mol/L **não** fica no pKa. O aplicativo mostra
  o valor exato ao lado do que Henderson-Hasselbalch previu e avisa quando a
  aproximação falhou.
- Na meia-neutralização do ácido fosfórico o pH é **2,27**, não 2,12. O atalho
  "pH = pKa₁" supõe ionização desprezível, o que deixa de valer quando Ka₁ é
  grande em relação à concentração.
- A equivalência do ácido acético cai em **pH 8,72**, não em 7. Quem escolhe
  indicador supondo neutralidade erra por mais de 5% de volume.

## Erro de titulação

O analista para quando enxerga a virada, o que acontece perto do fim da faixa
do indicador. O aplicativo inverte a curva numericamente para achar em que
volume aquele pH é atingido e compara com a equivalência. Na titulação de
ácido acético com NaOH, a fenolftaleína erra 0,2% e o alaranjado de metila
erra mais de 5% — e é por isso que ninguém titula ácido fraco com alaranjado.

## Estrutura

```
app/
  index.html          onze telas, menu lateral agrupado
  js/
    elementos.js      118 elementos, massas IUPAC 2021, isótopo mais abundante
    parser.js         analisador de fórmulas
    converter.js      conversões e leitura de notação científica
    balanceador.js    balanceamento por álgebra linear exata
    estequiometria.js limitante, excesso, pureza, rendimento
    moleculas.js      estruturas, insaturação, núcleo
    calculadora.js    avaliador de expressões sem eval
    solucoes.js       unidades de concentração, diluição, mistura
    preparo.js        massa a pesar, vidraria, roteiro de bancada
    acidobase.js      pH por balanço de cargas, tampões, titulação
    exercicios.js     gerador paramétrico e diagnóstico de erro
    progresso.js      XP, degraus, ofensiva, medalhas
    app.js            interface
```

## Privacidade

O progresso fica em `localStorage`, neste aparelho. Não há cadastro, não há
servidor, nada é enviado para lugar nenhum.

## Próxima fase

Apostila viva: fichas de consulta rápida com busca instantânea, modo impressão
A5, e o modo docente com geração de listas e gabaritos.

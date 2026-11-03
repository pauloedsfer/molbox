# SUPER MOLBOX — Nomenclatura inorgânica e prateleira de troféus

**Objetivo:** o aluno monta um composto inorgânico juntando um cátion e um ânion, e o app mostra a fórmula, o nome, a função e o porquê. Os compostos importantes encontrados viram troféus numa prateleira, como no Super Organic Box.

**Ramo:** `nomenclatura-inorganica`. Scripts clássicos, como o resto do MOLBOX; lógica pura em arquivo próprio, testada em Node.

## Decisões (do professor, 03/11/2026)

1. **Funções:** ácidos (hidrácidos e oxiácidos: -ídrico, -ico, -oso, hipo-, per-), bases, sais (inclusive hidratados) e óxidos (básicos, ácidos, neutros, anfóteros e peróxidos).
2. **Montagem:** cátion + ânion. Ácido = H⁺ + ânion; base = cátion + OH⁻; sal = cátion + ânion; óxido de metal = cátion + O²⁻; peróxido = cátion + O₂²⁻.
3. **Cátion de carga variável:** número romano no nome oficial (cloreto de ferro(III)). O nome antigo com -oso/-ico aparece ao lado, como "também chamado de" (cloreto férrico).
4. **Prefixos (mono-, di-, tri-, penta-):** só nos óxidos de não metal (dióxido de carbono, trióxido de enxofre), com o nome usual ao lado (gás carbônico). Óxidos de metal sem prefixo (óxido de cálcio).
5. **Hidratos:** depois de montar o sal, o aluno escolhe as águas de hidratação: sulfato de cobre(II) penta-hidratado.

## Como funciona

- **Íons curados à mão** (`js/ions.js`), cada um com fórmula, carga, nome e, nos ânions, o nome do ácido correspondente (sulfato → sulfúrico, sulfito → sulfuroso, cloreto → clorídrico, hipoclorito → hipocloroso). A regra de sufixo (-eto → -ídrico, -ato → -ico, -ito → -oso) é conferida por teste em todo o banco, mas o nome vem do banco: nada de nome inventado.
  - Cátions: H⁺, Li⁺, Na⁺, K⁺, Ag⁺, NH₄⁺, Mg²⁺, Ca²⁺, Ba²⁺, Zn²⁺, Al³⁺, Fe²⁺/Fe³⁺, Cu⁺/Cu²⁺, Sn²⁺/Sn⁴⁺, Pb²⁺/Pb⁴⁺.
  - Ânions: F⁻, Cl⁻, Br⁻, I⁻, S²⁻, CN⁻, ClO⁻, ClO₂⁻, ClO₃⁻, ClO₄⁻, NO₂⁻, NO₃⁻, SO₃²⁻, SO₄²⁻, HSO₄⁻, CO₃²⁻, HCO₃⁻, PO₄³⁻, CH₃COO⁻, MnO₄⁻, CrO₄²⁻, Cr₂O₇²⁻, OH⁻, O²⁻, O₂²⁻.
- **Fórmula pela carga:** os índices saem do MMC das cargas (Al³⁺ + SO₄²⁻ → Al₂(SO₄)₃), com parênteses no íon composto repetido. O app mostra a conta: 2 × (+3) + 3 × (−2) = 0.
- **Óxidos de não metal** (C, N, S, P, Si): o aluno escolhe o elemento e o número de oxigênios entre os óxidos que existem e o app conhece (CO, CO₂, NO, NO₂, N₂O, SO₂, SO₃, P₂O₅, SiO₂). Combinação que o app não conhece é recusada com o motivo.
- **Classificação dos óxidos** gravada por óxido (não deduzida): básico, ácido, neutro, anfótero ou peróxido, com a frase da regra.
- **Combinações sem sentido** são recusadas com explicação: H⁺ + OH⁻ ("isso é a água: neutralização"), H⁺ + O²⁻, cátion + H⁺.
- **Ligação com o resto do app:** botão "Ver a massa molar" (leva a fórmula para a tela Massa Molar) e "Usar numa equação".

## Prateleira (52 compostos do cotidiano e da bancada)

| Função | Compostos (nome usual) |
|---|---|
| Ácidos (12) | HCl (ácido muriático), HF, H₂S, HCN, H₂SO₄ (ácido de bateria), HNO₃, H₃PO₄ (refrigerante de cola), H₂CO₃ (água com gás), CH₃COOH (vinagre), HClO, HClO₄, HNO₂ |
| Bases (8) | NaOH (soda cáustica), KOH, Ca(OH)₂ (cal hidratada), Mg(OH)₂ (leite de magnésia), Al(OH)₃ (antiácido), NH₄OH (amoníaco), Ba(OH)₂, Fe(OH)₃ |
| Sais (20) | NaCl (sal de cozinha), KCl (sal light), NaHCO₃ (bicarbonato), Na₂CO₃ (barrilha), CaCO₃ (calcário, giz), NaClO (água sanitária), NaF (creme dental), KI (sal iodado), KNO₃ (salitre), NH₄Cl (sal amoníaco), NH₄NO₃ (fertilizante), CaSO₄·2H₂O (gesso), CuSO₄·5H₂O (sulfato de cobre), KMnO₄ (permanganato), K₂Cr₂O₇ (dicromato), AgNO₃ (nitrato de prata), Ca₃(PO₄)₂ (ossos), FeSO₄ (suplemento de ferro), MgSO₄·7H₂O (sal amargo), Al₂(SO₄)₃ (tratamento de água) |
| Óxidos (12) | CaO (cal virgem), MgO, Al₂O₃ (alumina), ZnO (pomada), Fe₂O₃ (ferrugem), CO₂ (gás carbônico), CO, SO₂, NO₂, N₂O (gás hilariante), SiO₂ (areia), H₂O₂ (água oxigenada) |

O que falta aparece só com a fórmula, como pista. Os troféus entram nas medalhas (1, 10 e todos), no resumo do professor (`mol=12/52`) e no certificado.

## Tarefas

1. **Íons e regras de nome** (`js/ions.js`, `js/nomenclatura_inorganica.js`) e testes em Node (`testes/`): fórmula pela carga, nome, função, classificação, recusas; todos os 52 da prateleira montáveis e com o nome esperado; a fórmula gerada é lida pelo analisador do MOLBOX sem erro.
2. **Tela "Nomenclatura inorgânica"** (`#nomenclatura`, menu Fundamentos): abas Ácido, Base, Sal, Óxido; chips de cátion e de ânion; resultado com fórmula, nome, função, a conta das cargas, a regra e os botões de ligação. Funciona em 375 px e nos dois temas.
3. **Prateleira e troféus** na tela Presentes e Troféus, medalhas por troféu, `mol=` no resumo e certificado em PDF (quem encontrou todos e abriu os cinco degraus).
4. **Verificação no navegador** (desktop e 375 px, claro e escuro, offline) e `sw.js` com os arquivos novos.

## Para o professor conferir depois

Os nomes usuais da prateleira, a classificação de cada óxido e a lista de íons.

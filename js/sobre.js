/* SUPER MOLBOX — a página Sobre.

   O conteúdo fica aqui, separado da interface, para que possa ser editado sem
   mexer em lógica nenhuma. Se algum dado mudar — o canal, a instituição, um
   novo colaborador —, basta alterar as constantes abaixo.
*/

const AUTOR = {
  nome: "Prof. Paulo Fernandes",
  titulo: "Químico Industrial, Farmacêutico e Docente de Química",
  // ATENÇÃO: confirme o endereço do canal antes de publicar. Este link aponta
  // para o vídeo que já está no aplicativo, não para a página do canal.
  canal: {
    url: "https://www.youtube.com/@pauloedsfer",
    rotulo: "Canal no YouTube",
    aviso: true,
  },
  apresentacao: [
    "Farmacêutico de formação, professor por escolha. Atua no ensino técnico de Química, " +
    "onde o desafio diário é o mesmo que deu origem a este aplicativo: fazer o estudante " +
    "entender de verdade, e não decorar uma fórmula que ele esquece na semana seguinte.",

    "A experiência em farmácia hospitalar, farmácia de manipulação e em controle de qualidade " +
    "aparece em cada tela. " +
    "As contas do aplicativo são as contas da bancada, e os avisos de segurança são os que " +
    "se aprende trabalhando, não os que se lê num manual.",
  ],
};

const PORQUE_EXISTE = [
  {
    titulo: "O problema",
    texto: "O mol é a porta de entrada da Química, e é onde a maioria dos estudantes trava. " +
      "Não porque a conta seja difícil — ela é uma multiplicação —, mas porque ninguém " +
      "consegue sentir o tamanho de 6,02×10²³. Sem essa intuição, o aluno decora o " +
      "procedimento e esquece assim que a prova acaba.",
  },
  {
    titulo: "A aposta",
    texto: "Que dá para fazer o número caber na cabeça antes de usá-lo. Por isso o aplicativo " +
      "começa pela analogia da dúzia e por comparações calculadas na hora, e só depois " +
      "chega à fórmula. Entender primeiro, calcular depois.",
  },
  {
    titulo: "O que ele não é",
    texto: "Não é uma lista de exercícios digitalizada nem um substituto do laboratório. " +
      "É um guia de bolso que continua útil depois da formatura — para conferir uma massa " +
      "molar às pressas, lembrar a ordem de adição de um ácido ou simular uma titulação " +
      "antes de fazer a de verdade.",
  },
  {
    titulo: "Por que é gratuito e funciona sem internet",
    texto: "Porque a rede da escola cai, o laboratório costuma ser um ponto cego de sinal e " +
      "nem todo aluno tem dados móveis sobrando. Nada aqui exige cadastro, e o progresso " +
      "fica guardado no próprio aparelho — não há servidor, não há coleta de dados.",
  },
];

const COLABORACAO = [
  {
    quem: "Professores de Química",
    texto: "Revisaram o conteúdo, apontaram onde a linguagem estava técnica demais e ajudaram " +
      "a decidir a sequência dos assuntos.",
  },
  {
    quem: "Professores de Informática",
    texto: "Contribuíram com as decisões de arquitetura que mantêm o aplicativo leve, offline " +
      "e sem dependências externas.",
  },
  {
    quem: "Os alunos",
    texto: "Foram eles que testaram em sala e trouxeram o que nenhuma revisão de escritório " +
      "encontraria: que dava para acumular pontos repetindo o degrau mais fácil, que o " +
      "desbloqueio de um degrau novo passava despercebido, e que o teclado do celular " +
      "fechava a cada dígito digitado. Cada um desses relatos virou correção. " +
      "Este aplicativo é, em boa parte, obra deles.",
  },
];

function dadosDoAutor() { return AUTOR; }
function motivosDoAplicativo() { return PORQUE_EXISTE; }
function colaboradores() { return COLABORACAO; }

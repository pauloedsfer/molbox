# Receber o progresso dos alunos pela internet

Com isto, o aluno toca em **Enviar pela internet** na tela Progresso, e o texto de progresso dele cai numa planilha do Google que é **sua**. Serve para o Super Organic Box e para o Super MOLBOX, e cada professor monta a própria planilha: nenhum dado passa por servidor nosso.

O aplicativo continua funcionando sem internet. A rede só é usada no momento do envio, e o que vai é exatamente o texto que o aluno vê na tela: um código que ele mesmo inventou, sem nome, e os números do treino, das moléculas encontradas e do tempo de uso.

## Montar a planilha (uma vez, cerca de 5 minutos)

1. Abra o [Google Planilhas](https://sheets.google.com) e crie uma planilha em branco. Dê um nome, por exemplo "Progresso — 3º ano".
2. No menu, vá em **Extensões → Apps Script**.
3. Apague o que estiver no editor e cole todo o conteúdo do arquivo `planilha-da-turma.gs` (está nesta mesma pasta). Clique em **Salvar**.
4. Clique em **Implantar → Nova implantação**. Em "Selecione o tipo", escolha **App da Web**.
   - **Executar como:** Eu.
   - **Quem pode acessar:** Qualquer pessoa.
5. Clique em **Implantar**. O Google pede para autorizar: escolha sua conta e permita (o aviso "app não verificado" aparece porque o script é seu; clique em "Avançado" e continue).
6. Copie o **URL do app da Web**. Ele começa com `https://script.google.com/macros/s/` e termina com `/exec`. Esse é o **link da turma**.

Para conferir, abra o link no navegador: deve aparecer "Planilha da turma no ar".

## Passar o link aos alunos

- Mande o link pelo canal da turma ou mostre um QR code dele na aula.
- Para separar turmas na mesma planilha, acrescente `?turma=` e o nome no fim do link, por exemplo:
  `https://script.google.com/macros/s/AKfy.../exec?turma=3A`
- O aluno cola o link uma vez na tela Progresso (no SUPER MOLBOX, depois de tocar em "Gerar meu resumo"); o aplicativo guarda o link no aparelho.

O aplicativo só aceita links desse formato. Um link de outro site é recusado, para ninguém desviar o texto dos alunos.

## Ler a planilha

Cada envio vira uma linha na aba **Envios**: quando chegou, a turma, o aplicativo, o código do aluno e uma coluna para cada número. As colunas mais úteis:

| Coluna | O que é |
|---|---|
| `cod` | código que o aluno inventou |
| `xp`, `ac`, `te` | XP, acertos e tentativas no Treino |
| `dg` | degrau mais alto aberto (0 a 5) |
| `mol` | moléculas encontradas no editor (só no Super Organic Box, ex.: `27/54`) |
| `bal` | acertos/tentativas no Treino: Balanceamento (só no SUPER MOLBOX) |
| `tmp` | tempo de uso, em minutos |
| `tip` | acertos/tentativas por tipo de exercício |

O mesmo aluno pode enviar várias vezes: a linha mais nova é a situação atual. Com **Dados → Criar filtro** você vê só uma turma ou um código.

## Se mudar o código do script

Depois de editar, use **Implantar → Gerenciar implantações → Editar → Nova versão**. Assim o link continua o mesmo. Uma "Nova implantação" cria um link diferente.

## Privacidade

- O texto não tem nome, e-mail nem identificação do aparelho. Combine com a turma a lista de códigos, se precisar saber quem é quem.
- A planilha fica na sua conta do Google, com as regras de privacidade dela.
- Para parar de receber, vá em **Implantar → Gerenciar implantações** e arquive a implantação.

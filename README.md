# Sistema Planilha - Front

Angular 20 (standalone components). Quatro abas: **Uber** (planilha de ganhos diários de Vagner e Filipe), **Despesas**, **Empréstimos** e **Relatórios**.

## Executar
Requer o backend rodando em `http://localhost:8080` (ver `Sistema-Planilha-Back`). O front chama a API em `/api` (`src/app/api.config.ts`); em desenvolvimento o `ng serve` repassa `/api` ao backend (`proxy.conf.json`).
```bash
npm install
npm start        # http://localhost:4200
npm test
```
Ao abrir, aparece a **tela de login** (usuários criados pelo backend, veja o README dele). Depois de entrar, o topo mostra o usuário, "Alterar senha" e "Sair". Se a sessão expirar, o sistema volta sozinho para o login.

## Produção
O `Dockerfile` compila o Angular e serve os arquivos com o Caddy (HTTPS automático, repasse de `/api` ao backend, cache dos arquivos com hash). Passo a passo de publicação em `Sistema-Planilha-Back/DEPLOY.md`.

## Tela
- Filtro de período (Semana de segunda a domingo / Mês / Tudo) com setas ‹ › e "Hoje"; os cartões e a planilha respeitam o período. Ao salvar um lançamento fora do período exibido, a tela pula para o período dele.
- Cartões no topo: horas e faturamento bruto/líquido (juntos e individual) e carga do posto discriminada por pessoa (sem somar).
- Planilha: Data, Dia da semana, Hora inicial/final e Total de horas de cada pessoa (Vagner e Filipe; opcionais), Km inicial/final, Total de Km,
  R$ Carga Posto Vagner, R$ Carga Posto Filipe, Valor Vagner, Valor Filipe, Líquido Vagner, Líquido Filipe.
- Cada pessoa informa a sua Carga Posto, descontada só do seu valor (Líquido = Valor − Carga Posto).
- A última linha (verde) é a de entrada: mostra os campos calculados ao vivo; o backend recalcula ao salvar.
  "Editar" carrega a linha nessa entrada; "Excluir" remove o lançamento.

## Aba Despesas
- Categorias: Carro, Energia elétrica, Moto, Plano de saúde, Farmácia, Despesas Lord e Amora, Despesas Filipe, Despesas Vagner, Despesas Romilda e Internet e Telefone. Cada botão mostra o total da categoria no período; "Todas" mostra o total geral.
- Formulário "Nova despesa" no topo: data da compra, categoria, nome, forma de pagamento (Dinheiro, Cartão, Cheque ou Boleto), valor e, no cartão, o número de parcelas. Enquanto você preenche um cartão aparece a prévia (ex.: "3x de R$ 666,67 — vencem de 25/10/2026 a 25/12/2026").
- **Vencimentos por mês:** a tabela e os totais mostram o que **vence** no período. Fora do cartão há um vencimento (na data da compra); no cartão, uma parcela por mês (a 1ª na data da compra), com "Parcela 2/3" e a compra de origem. A última parcela absorve o arredondamento.
- ✎ edita e ✕ remove a **compra inteira** (todas as parcelas), a partir de qualquer linha dela.
- O nome aceita texto livre; ao digitar aparecem as sugestões da categoria (lista em `src/app/despesas/despesas-catalogo.ts`).
- Usa o mesmo filtro de período (semana/mês/tudo) da aba Uber.

## Aba Empréstimos
- Onde foi pego: Romilda, Verônica, Banco do Brasil, Banco Itaú ou Terceiros (neste caso informa-se o nome de quem emprestou; nomes já usados aparecem como sugestão).
- Campos: data, valor do empréstimo, vezes (em quantas parcelas foi dividido) e valor pago. A tabela mostra o valor de cada parcela, o saldo a pagar e a situação (% pago ou "Quitado").
- Cartões no topo: total emprestado, total pago e saldo a pagar. Cada botão de origem mostra o saldo daquela origem e filtra a lista.
- Para registrar um novo pagamento, edite o empréstimo (✎) e atualize o "Valor pago".

## Aba Relatórios
Painel consolidado, com período de 3 meses, 6 meses, 12 meses (padrão) ou ano atual:
- **Cartões:** receita (faturamento líquido), despesas, parcelas de empréstimos e resultado (receita − despesas − empréstimos) do período.
- **Receita × saídas por mês:** uma coluna de receita ao lado de uma coluna empilhada de despesas + parcelas de empréstimos. Passe o mouse (ou use Tab) sobre um mês para ver todos os valores.
- **Resultado do mês:** colunas para cima (sobrou) e para baixo (faltou).
- **O que mais gera despesa:** ranking das despesas por categoria e os 10 itens mais caros, com o maior em destaque e o percentual do total.
- **Histórico mensal:** a tabela com os números de cada mês e o total.
- Despesas contam pelo vencimento; as parcelas de empréstimo são previstas (valor ÷ vezes, a 1ª um mês após a data do empréstimo), pois o sistema guarda só o total pago.

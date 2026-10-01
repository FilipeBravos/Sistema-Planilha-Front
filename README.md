# Sistema Planilha - Front

Angular 20 (standalone components). Duas abas: **Uber** (planilha de ganhos diários de Vagner e Filipe) e **Despesas**.

## Executar
Requer o backend rodando em `http://localhost:8080` (ver `Sistema-Planilha-Back`; URL em `src/app/api.config.ts`).
```bash
npm install
npm start        # http://localhost:4200
npm test
```

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

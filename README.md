# Sistema Planilha - Front

Angular 20 (standalone components). Aba **Uber**: planilha de ganhos diários de Vagner e Filipe.

## Executar
Requer o backend rodando em `http://localhost:8080` (ver `Sistema-Planilha-Back`; URL em `src/app/api.config.ts`).
```bash
npm install
npm start        # http://localhost:4200
npm test
```

## Tela
- Cartões no topo: horas e faturamento bruto/líquido (juntos e individual) e carga do posto discriminada por pessoa (sem somar).
- Planilha: Data, Dia da semana, Hora inicial/final e Total de horas de cada pessoa (Vagner e Filipe; opcionais), Km inicial/final, Total de Km,
  R$ Carga Posto, Valor Vagner, Valor Filipe, Líquido Vagner, Líquido Filipe.
- Cada pessoa informa a sua Carga Posto, descontada só do seu valor (Líquido = Valor − Carga Posto).
- A última linha (verde) é a de entrada: mostra os campos calculados ao vivo; o backend recalcula ao salvar.
  "Editar" carrega a linha nessa entrada; "Excluir" remove o lançamento.

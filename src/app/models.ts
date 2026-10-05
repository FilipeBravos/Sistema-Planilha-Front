export interface RegistroRequest {
  data: string;
  horaInicialVagner: string | null;
  horaFinalVagner: string | null;
  horaInicialFilipe: string | null;
  horaFinalFilipe: string | null;
  /** Km é opcional: pode vir em branco (null). */
  kmInicial: number | null;
  kmFinal: number | null;
  cargaPostoVagner: number;
  cargaPostoFilipe: number;
  valorVagner: number;
  valorFilipe: number;
}

export interface Registro extends RegistroRequest {
  id: number;
  diaSemana: string;
  totalMinutosVagner: number;
  totalMinutosFilipe: number;
  totalMinutos: number;
  /** Só existe quando os dois Km foram informados. */
  totalKm: number | null;
  liquidoVagner: number;
  liquidoFilipe: number;
}

export interface Resumo {
  minutosTotal: number;
  minutosVagner: number;
  minutosFilipe: number;
  brutoVagner: number;
  brutoFilipe: number;
  brutoTotal: number;
  cargaPostoVagner: number;
  cargaPostoFilipe: number;
  liquidoVagner: number;
  liquidoFilipe: number;
  liquidoTotal: number;
  kmTotal: number;
}

export type CategoriaDespesa =
  | 'CARRO'
  | 'ENERGIA_ELETRICA'
  | 'MOTO'
  | 'PLANO_DE_SAUDE'
  | 'FARMACIA'
  | 'LORD_E_AMORA'
  | 'FILIPE'
  | 'VAGNER'
  | 'ROMILDA'
  | 'INTERNET_E_TELEFONE';

export type FormaPagamento = 'DINHEIRO' | 'CARTAO' | 'CHEQUE' | 'BOLETO';

export interface DespesaRequest {
  categoria: CategoriaDespesa;
  nome: string;
  data: string;
  valor: number;
  formaPagamento: FormaPagamento;
  parcelas: number | null;
}

export interface Despesa extends DespesaRequest {
  id: number;
  valorParcela: number | null;
}

export interface DespesaResumo {
  total: number;
  porCategoria: { categoria: CategoriaDespesa; total: number }[];
}

/** Um pagamento a vencer (despesa fora do cartão = 1 vencimento; no cartão = 1 por parcela). */
export interface Vencimento {
  despesaId: number;
  categoria: CategoriaDespesa;
  nome: string;
  formaPagamento: FormaPagamento;
  dataCompra: string;
  valorTotal: number;
  parcelas: number | null;
  numeroParcela: number | null;
  vencimento: string;
  valor: number;
}

export type Credor = 'ROMILDA' | 'VERONICA' | 'BANCO_DO_BRASIL' | 'BANCO_ITAU' | 'TERCEIROS';

export interface EmprestimoRequest {
  credor: Credor;
  nomeTerceiro: string | null;
  data: string;
  valor: number;
  parcelas: number;
  valorPago: number;
}

export interface Emprestimo extends EmprestimoRequest {
  id: number;
  valorParcela: number;
  saldo: number;
  quitado: boolean;
}

export interface EmprestimoResumo {
  totalEmprestado: number;
  totalPago: number;
  saldo: number;
  porCredor: { credor: Credor; emprestado: number; pago: number; saldo: number }[];
}

export interface MesRelatorio {
  mes: string;
  faturamentoBruto: number;
  cargaPosto: number;
  faturamentoLiquido: number;
  despesas: number;
  parcelasEmprestimos: number;
  resultado: number;
}

export interface Relatorio {
  inicio: string;
  fim: string;
  meses: MesRelatorio[];
  totais: MesRelatorio;
  despesasPorCategoria: { categoria: CategoriaDespesa; total: number; percentual: number }[];
  maioresDespesas: { categoria: CategoriaDespesa; nome: string; total: number; percentual: number }[];
  emprestimos: { totalEmprestado: number; totalPago: number; saldoDevedor: number };
}

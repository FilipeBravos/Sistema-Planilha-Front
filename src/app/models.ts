export interface RegistroRequest {
  data: string;
  horaInicialVagner: string | null;
  horaFinalVagner: string | null;
  horaInicialFilipe: string | null;
  horaFinalFilipe: string | null;
  kmInicial: number;
  kmFinal: number;
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
  totalKm: number;
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

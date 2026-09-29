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
  liquidoVagner: number;
  liquidoFilipe: number;
  liquidoTotal: number;
  kmTotal: number;
}

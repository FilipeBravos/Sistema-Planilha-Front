export interface RegistroRequest {
  data: string;
  horaInicial: string;
  horaFinal: string;
  kmInicial: number;
  kmFinal: number;
  cargaPosto: number;
  valorVagner: number;
  valorFilipe: number;
}

export interface Registro extends RegistroRequest {
  id: number;
  diaSemana: string;
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

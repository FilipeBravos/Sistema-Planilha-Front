/** 570 -> "9h30" */
export function formatarMinutos(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${h}h${String(m).padStart(2, '0')}`;
}

/** "08:00:00" -> "08:00" (valor aceito por <input type="time">) */
export function hhmm(hora: string | null): string {
  return hora ? hora.slice(0, 5) : '';
}

/** "2026-09-28" -> "28/09/2026" (sem passar por Date, evitando fuso) */
export function formatarData(iso: string): string {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

const DIAS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

/** Dia da semana de uma data ISO (yyyy-MM-dd), calculado em UTC para não sofrer com fuso. */
export function diaDaSemana(iso: string): string {
  if (!iso) return '';
  const [a, m, d] = iso.split('-').map(Number);
  return DIAS[new Date(Date.UTC(a, m - 1, d)).getUTCDay()];
}

/** Minutos entre duas horas "HH:mm"; se a final for menor, o turno virou a meia-noite. */
export function minutosEntre(inicial: string, final: string): number {
  if (!inicial || !final) return 0;
  const [hi, mi] = inicial.split(':').map(Number);
  const [hf, mf] = final.split(':').map(Number);
  const dif = hf * 60 + mf - (hi * 60 + mi);
  return dif < 0 ? dif + 24 * 60 : dif;
}

export type ModoPeriodo = 'semana' | 'mes' | 'tudo';

export interface Periodo {
  inicio: string | null;
  fim: string | null;
  rotulo: string;
}

/** Date local -> "yyyy-MM-dd" (sem passar por UTC). */
export function paraIso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

/** "yyyy-MM-dd" -> Date local ao meio-dia (evita saltos de horário de verão). */
export function deIso(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d, 12);
}

/**
 * Período que contém a data de referência. Semana vai de segunda a domingo.
 * "tudo" não tem limites.
 */
export function calcularPeriodo(modo: ModoPeriodo, ref: Date): Periodo {
  if (modo === 'tudo') {
    return { inicio: null, fim: null, rotulo: 'Todos os lançamentos' };
  }
  if (modo === 'mes') {
    const ini = new Date(ref.getFullYear(), ref.getMonth(), 1, 12);
    const fim = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 12);
    const nome = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(ini);
    return { inicio: paraIso(ini), fim: paraIso(fim), rotulo: nome.charAt(0).toUpperCase() + nome.slice(1) };
  }
  const ini = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - ((ref.getDay() + 6) % 7), 12);
  const fim = new Date(ini.getFullYear(), ini.getMonth(), ini.getDate() + 6, 12);
  const curto = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  return { inicio: paraIso(ini), fim: paraIso(fim), rotulo: `${curto(ini)} a ${curto(fim)}/${fim.getFullYear()}` };
}

/** Move a referência uma semana ou um mês para frente (+1) ou para trás (-1). */
export function deslocar(modo: ModoPeriodo, ref: Date, sentido: 1 | -1): Date {
  if (modo === 'mes') {
    return new Date(ref.getFullYear(), ref.getMonth() + sentido, 1, 12);
  }
  return new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + 7 * sentido, 12);
}

/** 570 -> "9h30" */
export function formatarMinutos(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${h}h${String(m).padStart(2, '0')}`;
}

/** "08:00:00" -> "08:00" (valor aceito por <input type="time">) */
export function hhmm(hora: string): string {
  return hora.slice(0, 5);
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

/** 570 -> "9h30" */
export function formatarMinutos(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${h}h${String(m).padStart(2, '0')}`;
}

/** "08:00:00" -> "08:00" (formato usado no formulário) */
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

/** "2026-10-01" -> "01/10/2026"; vazio ou inválido -> "". */
export function isoParaBr(iso: string | null | undefined): string {
  return iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? formatarData(iso) : '';
}

/** Vai pondo as barras enquanto a pessoa digita: "01102026" -> "01/10/2026" (aceita só números). */
export function mascararData(texto: string): string {
  const d = texto.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) {
    return d;
  }
  return d.length <= 4 ? `${d.slice(0, 2)}/${d.slice(2)}` : `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** "01/10/2026" -> "2026-10-01". Devolve "" se estiver incompleta ou não for uma data real (ex.: 31/02/2026). */
export function brParaIso(texto: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!m) {
    return '';
  }
  const [dia, mes, ano] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (ano < 1900 || ano > 2100) {
    return '';
  }
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  const real = d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
  return real ? `${m[3]}-${m[2]}-${m[1]}` : '';
}

/** Digitar "0830" vira "08:30" (só números; no máximo 4 dígitos). */
export function mascararHora(texto: string): string {
  const d = texto.replace(/\D/g, '').slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}:${d.slice(2)}`;
}

/** "08:30" -> "08:30" (24 h); devolve "" se estiver incompleta ou fora de 00:00–23:59. */
export function validarHora(texto: string): string {
  const m = /^(\d{2}):(\d{2})$/.exec(texto);
  return m && Number(m[1]) <= 23 && Number(m[2]) <= 59 ? texto : '';
}

/** Ao sair do campo: "830" vira "08:30" e "8" vira "08:00"; o resto fica como está. */
export function completarHora(texto: string): string {
  const d = texto.replace(/\D/g, '');
  if (d.length === 3) {
    return mascararHora(`0${d}`);
  }
  if (d.length >= 1 && d.length <= 2 && !texto.includes(':')) {
    return `${d.padStart(2, '0')}:00`;
  }
  return texto;
}

/** 1234.5 -> "1.234,50" (sempre com vírgula e 2 casas, em qualquer navegador). */
export function formatarValorBr(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Lê um valor digitado em reais: "1.234,50", "1234,5", "200", "12.5" (ponto no fim = decimal) e "R$ 10,00".
 * Com vírgula, os pontos antes dela são milhar. Sem vírgula, "12.5" é decimal e "1.234" é mil duzentos e trinta e quatro.
 * Devolve null se estiver vazio ou não der para entender.
 */
export function lerValorBr(texto: string): number | null {
  const t = texto.trim().replace(/^R\$\s*/i, '').replace(/\s/g, '');
  if (!/\d/.test(t)) {
    return null;
  }
  let inteira: string;
  let decimal = '';
  if (t.includes(',')) {
    const partes = t.split(',');
    if (partes.length !== 2 || !/^\d{0,2}$/.test(partes[1])) {
      return null;
    }
    inteira = partes[0].replace(/\./g, '');
    decimal = partes[1];
  } else if (/^\d+\.\d{1,2}$/.test(t)) {
    [inteira, decimal] = t.split('.');
  } else {
    inteira = t.replace(/\./g, '');
  }
  if (!/^\d*$/.test(inteira) || inteira.length > 10) {
    return null;
  }
  return Number(`${inteira || '0'}.${decimal.padEnd(2, '0')}`);
}

/**
 * Enquanto digita: só números, vírgula e pontos; uma única vírgula, com no máximo 2 casas depois dela.
 * Os pontos são mantidos como digitados (milhar ou decimal): quem decide é `lerValorBr`, para que
 * "2.500,00" nunca vire "2,50" no meio da digitação.
 */
export function limparValorDigitado(texto: string): string {
  let t = texto.replace(/[^\d.,]/g, '');
  const i = t.indexOf(',');
  if (i >= 0) {
    t = `${t.slice(0, i + 1)}${t.slice(i + 1).replace(/[^\d]/g, '').slice(0, 2)}`;
  }
  return t;
}

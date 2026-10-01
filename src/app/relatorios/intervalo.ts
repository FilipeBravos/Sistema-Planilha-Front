import { paraIso } from '../format';

export type Preset = 3 | 6 | 12 | 'ano';

/** Um intervalo de meses completos; `inicio` e `fim` no formato "AAAA-MM". */
export interface IntervaloRelatorio {
  /** Qual botão pronto está ativo; "personalizado" quando o mês foi escolhido à mão. */
  preset: Preset | 'personalizado';
  inicio: string;
  fim: string;
}

/** O backend aceita até 120 meses (10 anos). */
export const MAX_MESES = 120;

export function mesDe(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
}

/** Meses completos terminando no mês de `hoje`. */
export function intervaloDoPreset(preset: Preset, hoje: Date): IntervaloRelatorio {
  const inicio = preset === 'ano' ? new Date(hoje.getFullYear(), 0, 1) : new Date(hoje.getFullYear(), hoje.getMonth() - (preset - 1), 1);
  return { preset, inicio: mesDe(inicio), fim: mesDe(hoje) };
}

export function quantidadeDeMeses(inicio: string, fim: string): number {
  const [ai, mi] = inicio.split('-').map(Number);
  const [af, mf] = fim.split('-').map(Number);
  return (af - ai) * 12 + (mf - mi) + 1;
}

/** Texto do problema, ou null se o intervalo é válido. */
export function validarIntervalo(inicio: string, fim: string): string | null {
  const meses = quantidadeDeMeses(inicio, fim);
  if (meses < 1) {
    return 'O mês inicial é depois do mês final.';
  }
  if (meses > MAX_MESES) {
    return `O período pode ter no máximo ${MAX_MESES / 12} anos (${MAX_MESES} meses).`;
  }
  return null;
}

/** "2026-02" a "2026-04" -> 1º dia de fevereiro e último dia de abril, em AAAA-MM-DD. */
export function limitesEmIso(inicio: string, fim: string): { inicio: string; fim: string } {
  const [af, mf] = fim.split('-').map(Number);
  return { inicio: `${inicio}-01`, fim: paraIso(new Date(af, mf, 0)) };
}

/** Anos oferecidos nas listas: 10 anos para trás e 5 para frente (parcelas futuras também entram no relatório). */
export function anosDisponiveis(hoje: Date): string[] {
  const ano = hoje.getFullYear();
  return Array.from({ length: 16 }, (_, i) => String(ano - 10 + i));
}

export const MESES_DO_ANO: { valor: string; rotulo: string }[] = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
].map((rotulo, i) => ({ valor: String(i + 1).padStart(2, '0'), rotulo }));

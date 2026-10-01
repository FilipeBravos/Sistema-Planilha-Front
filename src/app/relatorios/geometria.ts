import { MesRelatorio } from '../models';

// Área do gráfico (viewBox) e margens. As colunas têm no máximo 24px de largura.
export const LARGURA = 960;
export const ALTURA = 300;
const MARGEM = { esq: 64, dir: 12, topo: 14, base: 32 };
const COLUNA_MAX = 24;
const RAIO = 4;
const FOLGA = 2; // espaço da cor da superfície entre segmentos que se tocam

export interface Tick {
  y: number;
  rotulo: string;
}

export interface ColunaMes {
  indice: number;
  rotulo: string;
  xCentro: number;
  hitX: number;
  hitLargura: number;
}

export interface GraficoReceitaSaidas {
  ticks: Tick[];
  yBase: number;
  colunas: (ColunaMes & { receita: string | null; despesas: string | null; emprestimos: string | null })[];
}

export interface GraficoResultado {
  ticks: Tick[];
  yZero: number;
  colunas: (ColunaMes & { barra: string | null; positivo: boolean; rotuloValor: { x: number; y: number } | null })[];
}

const compacto = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });

/** 1500 -> "1,5 mil" */
export function formatarEixo(valor: number): string {
  return compacto.format(valor).replace(/\u00a0/g, ' ');
}

/** Passo "redondo" (1, 2, 2,5, 5 × 10^n) que cobre o intervalo com cerca de `alvo` divisões. */
export function passoRedondo(intervalo: number, alvo = 4): number {
  if (intervalo <= 0) {
    return 25;
  }
  const bruto = intervalo / alvo;
  const potencia = Math.pow(10, Math.floor(Math.log10(bruto)));
  const candidatos = [1, 2, 2.5, 5, 10].map((c) => c * potencia);
  return candidatos.find((c) => c >= bruto) ?? 10 * potencia;
}

/** Limites do eixo e valores dos ticks, sempre incluindo o zero. */
export function escala(minimo: number, maximo: number): { min: number; max: number; valores: number[] } {
  const baixo = Math.min(minimo, 0);
  const alto = Math.max(maximo, 0);
  const passo = passoRedondo(alto - baixo || 100);
  const min = Math.floor(baixo / passo) * passo;
  const max = Math.max(Math.ceil(alto / passo) * passo, passo);
  const valores: number[] = [];
  for (let v = min; v <= max + passo / 1000; v += passo) {
    valores.push(Math.round(v * 100) / 100);
  }
  return { min, max, valores };
}

/** Coluna com o fim do dado arredondado (4px) e o lado oposto reto. `y1` é a borda de cima, `y2` a de baixo. */
export function caminhoColuna(x: number, y1: number, y2: number, largura: number, fimDoDado: 'topo' | 'base' | 'nenhum'): string {
  const altura = y2 - y1;
  const r = fimDoDado === 'nenhum' ? 0 : Math.min(RAIO, altura, largura / 2);
  const f = (n: number) => Math.round(n * 100) / 100;
  const x2 = x + largura;
  if (r <= 0) {
    return `M${f(x)},${f(y2)}V${f(y1)}H${f(x2)}V${f(y2)}Z`;
  }
  if (fimDoDado === 'topo') {
    return `M${f(x)},${f(y2)}V${f(y1 + r)}Q${f(x)},${f(y1)} ${f(x + r)},${f(y1)}H${f(x2 - r)}Q${f(x2)},${f(y1)} ${f(x2)},${f(y1 + r)}V${f(y2)}Z`;
  }
  return `M${f(x)},${f(y1)}V${f(y2 - r)}Q${f(x)},${f(y2)} ${f(x + r)},${f(y2)}H${f(x2 - r)}Q${f(x2)},${f(y2)} ${f(x2)},${f(y2 - r)}V${f(y1)}Z`;
}

const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES_LONGOS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** "2026-10" -> "out/26" */
export function rotuloMesCurto(mes: string): string {
  const [ano, m] = mes.split('-');
  return `${MESES_CURTOS[Number(m) - 1]}/${ano.slice(2)}`;
}

/** "2026-10" -> "Outubro de 2026" */
export function rotuloMesLongo(mes: string): string {
  const [ano, m] = mes.split('-');
  const nome = MESES_LONGOS[Number(m) - 1];
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} de ${ano}`;
}

function bandas(meses: MesRelatorio[]): ColunaMes[] {
  const largura = LARGURA - MARGEM.esq - MARGEM.dir;
  const faixa = largura / Math.max(meses.length, 1);
  return meses.map((m, indice) => ({
    indice,
    rotulo: rotuloMesCurto(m.mes),
    xCentro: MARGEM.esq + faixa * indice + faixa / 2,
    hitX: MARGEM.esq + faixa * indice,
    hitLargura: faixa,
  }));
}

/** Por mês: coluna de receita ao lado de uma coluna empilhada de saídas (despesas + empréstimos). */
export function graficoReceitaSaidas(meses: MesRelatorio[]): GraficoReceitaSaidas {
  const altura = ALTURA - MARGEM.topo - MARGEM.base;
  const yBase = MARGEM.topo + altura;
  const maior = Math.max(0, ...meses.map((m) => Math.max(m.faturamentoLiquido, m.despesas + m.parcelasEmprestimos)));
  const eixo = escala(0, maior);
  const y = (v: number) => yBase - (v / eixo.max) * altura;
  const ticks = eixo.valores.map((v) => ({ y: y(v), rotulo: formatarEixo(v) }));

  const faixa = (LARGURA - MARGEM.esq - MARGEM.dir) / Math.max(meses.length, 1);
  const larguraColuna = Math.min(COLUNA_MAX, faixa * 0.28);
  const entre = 4;

  const colunas = bandas(meses).map((banda, i) => {
    const m = meses[i];
    const xReceita = banda.xCentro - larguraColuna - entre / 2;
    const xSaidas = banda.xCentro + entre / 2;
    const receita = m.faturamentoLiquido > 0 ? caminhoColuna(xReceita, y(m.faturamentoLiquido), yBase, larguraColuna, 'topo') : null;

    const hDespesas = (m.despesas / eixo.max) * altura;
    const hEmprestimos = (m.parcelasEmprestimos / eixo.max) * altura;
    const temEmprestimos = m.parcelasEmprestimos > 0;
    const temDespesas = m.despesas > 0;
    const despesas = temDespesas
      ? caminhoColuna(xSaidas, yBase - hDespesas, yBase, larguraColuna, temEmprestimos ? 'nenhum' : 'topo')
      : null;
    const folga = temDespesas && hEmprestimos > FOLGA * 2 ? FOLGA : 0;
    const emprestimos = temEmprestimos
      ? caminhoColuna(xSaidas, yBase - hDespesas - hEmprestimos, yBase - hDespesas - folga, larguraColuna, 'topo')
      : null;
    return { ...banda, receita, despesas, emprestimos };
  });
  return { ticks, yBase, colunas };
}

/** Resultado mensal: colunas para cima (sobrou) e para baixo (faltou) a partir do zero. */
export function graficoResultado(meses: MesRelatorio[]): GraficoResultado {
  const altura = ALTURA - MARGEM.topo - MARGEM.base;
  const eixo = escala(Math.min(0, ...meses.map((m) => m.resultado)), Math.max(0, ...meses.map((m) => m.resultado)));
  const intervalo = eixo.max - eixo.min;
  const y = (v: number) => MARGEM.topo + ((eixo.max - v) / intervalo) * altura;
  const yZero = y(0);
  const ticks = eixo.valores.map((v) => ({ y: y(v), rotulo: formatarEixo(v) }));

  const faixa = (LARGURA - MARGEM.esq - MARGEM.dir) / Math.max(meses.length, 1);
  const larguraColuna = Math.min(COLUNA_MAX, faixa * 0.4);
  const ultimo = meses.length - 1;

  const colunas = bandas(meses).map((banda, i) => {
    const v = meses[i].resultado;
    const x = banda.xCentro - larguraColuna / 2;
    const positivo = v >= 0;
    const barra =
      v === 0 ? null : positivo ? caminhoColuna(x, y(v), yZero, larguraColuna, 'topo') : caminhoColuna(x, yZero, y(v), larguraColuna, 'base');
    const rotuloValor = i === ultimo && v !== 0 ? { x: banda.xCentro, y: positivo ? y(v) - 6 : y(v) + 14 } : null;
    return { ...banda, barra, positivo, rotuloValor };
  });
  return { ticks, yZero, colunas };
}

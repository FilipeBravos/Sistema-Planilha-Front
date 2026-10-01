import { MesRelatorio } from '../models';
import {
  caminhoColuna,
  escala,
  formatarEixo,
  graficoReceitaSaidas,
  graficoResultado,
  passoRedondo,
  rotuloMesCurto,
  rotuloMesLongo,
} from './geometria';

function mes(m: string, liquido: number, despesas: number, emprestimos: number): MesRelatorio {
  return {
    mes: m,
    faturamentoBruto: liquido,
    cargaPosto: 0,
    faturamentoLiquido: liquido,
    despesas,
    parcelasEmprestimos: emprestimos,
    resultado: liquido - despesas - emprestimos,
  };
}

describe('geometria dos gráficos', () => {
  it('escolhe passos redondos', () => {
    expect(passoRedondo(1000)).toBe(250);
    expect(passoRedondo(4200)).toBe(2000);
    expect(passoRedondo(0)).toBe(25);
  });

  it('a escala sempre inclui o zero e cobre os valores', () => {
    const e = escala(0, 4200);
    expect(e.valores[0]).toBe(0);
    expect(e.max).toBeGreaterThanOrEqual(4200);
    const n = escala(-3000, 1000);
    expect(n.min).toBeLessThanOrEqual(-3000);
    expect(n.valores).toContain(0);
  });

  it('formata eixo e rótulos de mês', () => {
    expect(formatarEixo(1500)).toBe('1,5 mil');
    expect(rotuloMesCurto('2026-10')).toBe('out/26');
    expect(rotuloMesLongo('2026-03')).toBe('Março de 2026');
  });

  it('coluna tem fim arredondado só de um lado', () => {
    expect(caminhoColuna(0, 0, 100, 24, 'topo')).toContain('Q');
    expect(caminhoColuna(0, 0, 100, 24, 'nenhum')).not.toContain('Q');
  });

  it('receita × saídas: uma banda por mês, coluna vazia vira null e a altura é proporcional', () => {
    const g = graficoReceitaSaidas([mes('2026-09', 1000, 400, 100), mes('2026-10', 0, 0, 0)]);
    expect(g.colunas.length).toBe(2);
    expect(g.colunas[0].receita).not.toBeNull();
    expect(g.colunas[0].despesas).not.toBeNull();
    expect(g.colunas[0].emprestimos).not.toBeNull();
    expect(g.colunas[1].receita).toBeNull();
    expect(g.colunas[1].despesas).toBeNull();
    expect(g.colunas[1].emprestimos).toBeNull();
    expect(g.colunas[0].hitLargura).toBeCloseTo(g.colunas[1].hitLargura);
  });

  it('resultado: positivo sobe, negativo desce e zero não desenha', () => {
    const g = graficoResultado([mes('2026-09', 1000, 400, 100), mes('2026-10', 0, 300, 0), mes('2026-11', 100, 100, 0)]);
    expect(g.colunas[0].positivo).toBeTrue();
    expect(g.colunas[1].positivo).toBeFalse();
    expect(g.colunas[2].barra).toBeNull();
    expect(g.ticks.some((t) => Math.abs(t.y - g.yZero) < 0.01)).toBeTrue();
  });

  it('sem dados ainda gera um eixo válido', () => {
    const g = graficoReceitaSaidas([mes('2026-09', 0, 0, 0)]);
    expect(g.ticks.length).toBeGreaterThan(1);
  });

  it('mostra todos os rótulos de mês com poucos meses e os espaça quando há muitos', () => {
    const doze = Array.from({ length: 12 }, (_, i) => mes(`2026-${String(i + 1).padStart(2, '0')}`, 100, 50, 0));
    expect(graficoReceitaSaidas(doze).colunas.every((c) => c.mostrarRotulo)).toBeTrue();

    const muitos = Array.from({ length: 120 }, (_, i) => mes(`${2016 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`, 100, 50, 0));
    const colunas = graficoResultado(muitos).colunas;
    const visiveis = colunas.filter((c) => c.mostrarRotulo).length;
    expect(visiveis).toBeGreaterThan(5);
    expect(visiveis).toBeLessThan(40);
    expect(colunas[0].mostrarRotulo).toBeTrue();
  });
});

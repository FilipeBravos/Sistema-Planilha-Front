import { calcularParcelas, somarMeses } from './parcelas';

describe('parcelas', () => {
  it('soma meses mantendo o dia, ou usando o último dia do mês', () => {
    expect(somarMeses('2026-10-02', 1)).toBe('2026-11-02');
    expect(somarMeses('2026-11-15', 2)).toBe('2027-01-15');
    expect(somarMeses('2026-01-31', 1)).toBe('2026-02-28');
    expect(somarMeses('2026-01-31', 2)).toBe('2026-03-31');
    expect(somarMeses('2026-12-10', 12)).toBe('2027-12-10');
  });

  it('divide em parcelas mensais e a última absorve o arredondamento', () => {
    const p = calcularParcelas('2026-10-02', 200, 3);
    expect(p.map((x) => x.vencimento)).toEqual(['2026-10-02', '2026-11-02', '2026-12-02']);
    expect(p.map((x) => x.valor)).toEqual([66.67, 66.67, 66.66]);
    expect(Math.round(p.reduce((s, x) => s + x.valor, 0) * 100)).toBe(20000);
  });

  it('uma parcela só tem o valor total', () => {
    expect(calcularParcelas('2026-10-02', 150.5, 1)).toEqual([{ numero: 1, vencimento: '2026-10-02', valor: 150.5 }]);
  });
});

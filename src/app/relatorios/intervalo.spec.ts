import { anosDisponiveis, intervaloDoPreset, limitesEmIso, mesDe, quantidadeDeMeses, validarIntervalo } from './intervalo';

describe('intervalo dos relatórios', () => {
  const hoje = new Date(2026, 9, 15); // 15/10/2026

  it('os botões prontos terminam no mês atual', () => {
    expect(intervaloDoPreset(3, hoje)).toEqual({ preset: 3, inicio: '2026-08', fim: '2026-10' });
    expect(intervaloDoPreset(12, hoje)).toEqual({ preset: 12, inicio: '2025-11', fim: '2026-10' });
    expect(intervaloDoPreset('ano', hoje)).toEqual({ preset: 'ano', inicio: '2026-01', fim: '2026-10' });
    expect(intervaloDoPreset(6, new Date(2026, 1, 3))).toEqual({ preset: 6, inicio: '2025-09', fim: '2026-02' });
  });

  it('conta meses e valida o intervalo', () => {
    expect(quantidadeDeMeses('2026-03', '2026-03')).toBe(1);
    expect(quantidadeDeMeses('2025-11', '2026-10')).toBe(12);
    expect(validarIntervalo('2026-03', '2026-03')).toBeNull();
    expect(validarIntervalo('2026-04', '2026-03')).toContain('depois');
    expect(validarIntervalo('2016-01', '2026-01')).toContain('máximo');
    expect(validarIntervalo('2016-11', '2026-10')).toBeNull(); // exatamente 120 meses
  });

  it('os limites vão do dia 1º ao último dia do mês final', () => {
    expect(limitesEmIso('2026-02', '2026-04')).toEqual({ inicio: '2026-02-01', fim: '2026-04-30' });
    expect(limitesEmIso('2024-01', '2024-02')).toEqual({ inicio: '2024-01-01', fim: '2024-02-29' });
  });

  it('oferece 10 anos para trás e 5 para frente', () => {
    const anos = anosDisponiveis(hoje);
    expect(anos[0]).toBe('2016');
    expect(anos[anos.length - 1]).toBe('2031');
    expect(mesDe(hoje)).toBe('2026-10');
  });
});

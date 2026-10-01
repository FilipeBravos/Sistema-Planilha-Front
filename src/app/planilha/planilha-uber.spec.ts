import { diaDaSemana, formatarData, formatarMinutos, minutosEntre } from '../format';

describe('format', () => {
  it('formata minutos em horas', () => {
    expect(formatarMinutos(570)).toBe('9h30');
    expect(formatarMinutos(5)).toBe('0h05');
  });

  it('calcula minutos entre horas, inclusive virando a meia-noite', () => {
    expect(minutosEntre('08:00', '17:30')).toBe(570);
    expect(minutosEntre('22:00', '02:30')).toBe(270);
    expect(minutosEntre('', '02:30')).toBe(0);
  });

  it('calcula o dia da semana sem depender de fuso', () => {
    expect(diaDaSemana('2026-09-28')).toBe('Segunda-feira');
    expect(diaDaSemana('')).toBe('');
  });

  it('formata data ISO', () => {
    expect(formatarData('2026-09-28')).toBe('28/09/2026');
  });
});

import { calcularPeriodo, deslocar, deIso } from '../format';

describe('período', () => {
  it('semana vai de segunda a domingo', () => {
    // 30/09/2026 é quarta-feira
    const p = calcularPeriodo('semana', deIso('2026-09-30'));
    expect(p.inicio).toBe('2026-09-28');
    expect(p.fim).toBe('2026-10-04');
    expect(p.rotulo).toBe('28/09 a 04/10/2026');
  });

  it('domingo pertence à semana que começou na segunda anterior', () => {
    const p = calcularPeriodo('semana', deIso('2026-10-04'));
    expect(p.inicio).toBe('2026-09-28');
  });

  it('mês cobre do dia 1 ao último dia', () => {
    const p = calcularPeriodo('mes', deIso('2026-02-10'));
    expect(p.inicio).toBe('2026-02-01');
    expect(p.fim).toBe('2026-02-28');
    expect(p.rotulo).toBe('Fevereiro de 2026');
  });

  it('tudo não tem limites', () => {
    const p = calcularPeriodo('tudo', new Date());
    expect(p.inicio).toBeNull();
    expect(p.fim).toBeNull();
  });

  it('desloca semana e mês', () => {
    expect(calcularPeriodo('semana', deslocar('semana', deIso('2026-09-30'), 1)).inicio).toBe('2026-10-05');
    expect(calcularPeriodo('mes', deslocar('mes', deIso('2026-01-31'), 1)).inicio).toBe('2026-02-01');
    expect(calcularPeriodo('mes', deslocar('mes', deIso('2026-01-15'), -1)).inicio).toBe('2025-12-01');
  });
});

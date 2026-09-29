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

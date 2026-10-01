import { CREDORES, percentualPago, rotuloCredor } from './credores';

describe('credores', () => {
  it('tem Romilda, Verônica, Banco do Brasil, Banco Itaú e Terceiros', () => {
    expect(CREDORES.map((c) => c.rotulo)).toEqual(['Romilda', 'Verônica', 'Banco do Brasil', 'Banco Itaú', 'Terceiros']);
  });

  it('mostra o nome de quem emprestou só em Terceiros', () => {
    expect(rotuloCredor('TERCEIROS', 'João')).toBe('Terceiros — João');
    expect(rotuloCredor('TERCEIROS')).toBe('Terceiros');
    expect(rotuloCredor('ROMILDA', 'ignorado')).toBe('Romilda');
  });

  it('calcula o percentual pago entre 0 e 100', () => {
    expect(percentualPago(1000, 250)).toBe(25);
    expect(percentualPago(1000, 1200)).toBe(100);
    expect(percentualPago(0, 10)).toBe(0);
  });
});

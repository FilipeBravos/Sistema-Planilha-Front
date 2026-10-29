import { CATEGORIAS, FORMAS_PAGAMENTO, parcelavel, rotuloCategoria, rotuloForma } from './despesas-catalogo';

describe('catálogo de despesas', () => {
  it('tem as 10 categorias, cada uma com id único', () => {
    expect(CATEGORIAS.length).toBe(10);
    expect(new Set(CATEGORIAS.map((c) => c.id)).size).toBe(10);
  });

  it('traz os nomes sugeridos de cada categoria', () => {
    const itens = (id: string) => CATEGORIAS.find((c) => c.id === id)!.itens;
    expect(itens('CARRO').length).toBe(18);
    expect(itens('MOTO').length).toBe(8);
    expect(itens('ENERGIA_ELETRICA')).toEqual(['CEMIG']);
    expect(itens('PLANO_DE_SAUDE')).toEqual(['VAGNER', 'ROMILDA', 'FILIPE']);
    expect(itens('INTERNET_E_TELEFONE')).toEqual(['VIVO', 'CELULARES', 'CAPINHA', 'IB TELECON']);
    expect(itens('VAGNER')).toEqual([]);
  });

  it('oferece dinheiro, cartão, cheque, boleto e cartão Verônica', () => {
    expect(FORMAS_PAGAMENTO.map((f) => f.id)).toEqual(['DINHEIRO', 'CARTAO', 'CHEQUE', 'BOLETO', 'CARTAO_VERONICA']);
    expect(rotuloForma('CARTAO')).toBe('Cartão');
    expect(rotuloCategoria('LORD_E_AMORA')).toBe('Despesas Lord e Amora');
  });
});

describe('formas de pagamento', () => {
  it('oferece o Cartão Verônica e o trata como parcelável (como o cartão)', () => {
    expect(FORMAS_PAGAMENTO.map((f) => f.id)).toContain('CARTAO_VERONICA');
    expect(rotuloForma('CARTAO_VERONICA')).toBe('Cartão Verônica');
    expect(parcelavel('CARTAO_VERONICA')).toBeTrue();
    expect(parcelavel('BOLETO')).toBeTrue();
    expect(parcelavel('DINHEIRO')).toBeFalse();
    expect(parcelavel('CHEQUE')).toBeFalse();
  });
});

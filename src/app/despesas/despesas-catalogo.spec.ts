import { CATEGORIAS, FORMAS_PAGAMENTO, rotuloCategoria, rotuloForma } from './despesas-catalogo';

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

  it('oferece dinheiro, cartão, cheque e boleto', () => {
    expect(FORMAS_PAGAMENTO.map((f) => f.id)).toEqual(['DINHEIRO', 'CARTAO', 'CHEQUE', 'BOLETO']);
    expect(rotuloForma('CARTAO')).toBe('Cartão');
    expect(rotuloCategoria('LORD_E_AMORA')).toBe('Despesas Lord e Amora');
  });
});

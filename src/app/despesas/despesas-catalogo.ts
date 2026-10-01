import { CategoriaDespesa, FormaPagamento } from '../models';

export interface InfoCategoria {
  id: CategoriaDespesa;
  rotulo: string;
  /** Nomes sugeridos ao lançar uma despesa; o campo aceita também texto livre. */
  itens: string[];
}

export const CATEGORIAS: InfoCategoria[] = [
  {
    id: 'CARRO',
    rotulo: 'Carro',
    itens: [
      'PRESTAÇÃO',
      'IPVA 2025',
      'IPVA 2026 BYD',
      'REVISÃO',
      'PNEUS/2025',
      'PNEUS DIANT 2026/',
      'PNEUS TRAZ 2026/',
      'SEGURO',
      'TURBO CARGA',
      'ACESSÓRIOS',
      'MANUTENÇÃO ACIDENTES',
      'EMPLAMENTO/INSULFILME',
      'DESPACHANTE',
      'FIAT MOB SEGURO',
      'MOVIDA',
      'GASOLINA',
      'LIMPESA/DUCHA RÁPIDA',
      'BORRACHEIRO',
    ],
  },
  { id: 'ENERGIA_ELETRICA', rotulo: 'Energia elétrica', itens: ['CEMIG'] },
  {
    id: 'MOTO',
    rotulo: 'Moto',
    itens: [
      'CORRENTES',
      'TROCA DE ÓLEO',
      'PNEU DIANTEIRO',
      'PNEU TRAZEIRO',
      'MANUTENÇÃO MOTOR',
      'SEGURO',
      'DEPACHANTE',
      'IPVA',
    ],
  },
  { id: 'PLANO_DE_SAUDE', rotulo: 'Plano de saúde', itens: ['VAGNER', 'ROMILDA', 'FILIPE'] },
  { id: 'FARMACIA', rotulo: 'Farmácia', itens: ['VAGNER', 'ROMILDA', 'FILIPE'] },
  { id: 'LORD_E_AMORA', rotulo: 'Despesas Lord e Amora', itens: ['RAÇÃO', 'REMÉDIOS', 'VETERINÁRIO'] },
  {
    id: 'FILIPE',
    rotulo: 'Despesas Filipe',
    itens: [
      'FIES',
      'NOTEBOOK',
      'ESCOLA',
      'RECARGA PAY',
      'MULTA MEI e CNPJ',
      'ACADEMIA FILIPE - CONTA VAGNER',
    ],
  },
  { id: 'VAGNER', rotulo: 'Despesas Vagner', itens: [] },
  {
    id: 'ROMILDA',
    rotulo: 'Despesas Romilda',
    itens: [
      'IRMÃOS MATTAR',
      'SUPERMERCADO',
      'FRANCIS COSMÉSTICOS',
      'UK CALÇADOS',
      'AUTO ESCOLA',
      'LIVRARIA',
      'BUSE',
      'ACADEMIA VITOR',
      'SACOLÃO',
      'CARTÃO ÔNIBUS',
      'UBER',
      'MANUTENÇÃO MÁQUINA COSTURA',
      'AVIAMENTOS',
      'DIVERSOS',
      'INSS/PREVIDÊNCIA/PIC',
      'CONSTRULAR VAGNER',
    ],
  },
  {
    id: 'INTERNET_E_TELEFONE',
    rotulo: 'Internet e Telefone',
    itens: ['VIVO', 'CELULARES', 'CAPINHA', 'IB TELECON'],
  },
];

export const FORMAS_PAGAMENTO: { id: FormaPagamento; rotulo: string }[] = [
  { id: 'DINHEIRO', rotulo: 'Dinheiro' },
  { id: 'CARTAO', rotulo: 'Cartão' },
  { id: 'CHEQUE', rotulo: 'Cheque' },
  { id: 'BOLETO', rotulo: 'Boleto' },
];

export function rotuloCategoria(id: CategoriaDespesa): string {
  return CATEGORIAS.find((c) => c.id === id)?.rotulo ?? id;
}

export function rotuloForma(id: FormaPagamento): string {
  return FORMAS_PAGAMENTO.find((f) => f.id === id)?.rotulo ?? id;
}

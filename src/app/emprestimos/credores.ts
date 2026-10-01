import { Credor } from '../models';

export const CREDORES: { id: Credor; rotulo: string }[] = [
  { id: 'ROMILDA', rotulo: 'Romilda' },
  { id: 'VERONICA', rotulo: 'Verônica' },
  { id: 'BANCO_DO_BRASIL', rotulo: 'Banco do Brasil' },
  { id: 'BANCO_ITAU', rotulo: 'Banco Itaú' },
  { id: 'TERCEIROS', rotulo: 'Terceiros' },
];

export function rotuloCredor(id: Credor, nomeTerceiro?: string | null): string {
  const base = CREDORES.find((c) => c.id === id)?.rotulo ?? id;
  return id === 'TERCEIROS' && nomeTerceiro ? `${base} — ${nomeTerceiro}` : base;
}

/** Percentual pago do empréstimo, de 0 a 100. */
export function percentualPago(valor: number, pago: number): number {
  return valor > 0 ? Math.min(100, Math.round((pago / valor) * 100)) : 0;
}

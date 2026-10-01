export interface ParcelaPrevia {
  numero: number;
  vencimento: string;
  valor: number;
}

/** "2026-01-31" + 1 mês -> "2026-02-28" (dia inexistente vai para o último dia do mês). */
export function somarMeses(iso: string, meses: number): string {
  const [a, m, d] = iso.split('-').map(Number);
  const indice = a * 12 + (m - 1) + meses;
  const ano = Math.floor(indice / 12);
  const mes = (indice % 12) + 1;
  const ultimoDia = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const dia = Math.min(d, ultimoDia);
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

/**
 * Parcelas de uma compra no cartão, igual ao cálculo do backend: a 1ª vence na data da compra, as demais
 * nos meses seguintes; a última parcela absorve o arredondamento.
 */
export function calcularParcelas(data: string, valor: number, parcelas: number): ParcelaPrevia[] {
  const centavos = Math.round(valor * 100);
  const base = Math.round(centavos / parcelas);
  const lista: ParcelaPrevia[] = [];
  let acumulado = 0;
  for (let i = 1; i <= parcelas; i++) {
    const cent = i < parcelas ? base : centavos - acumulado;
    acumulado += cent;
    lista.push({ numero: i, vencimento: somarMeses(data, i - 1), valor: cent / 100 });
  }
  return lista;
}

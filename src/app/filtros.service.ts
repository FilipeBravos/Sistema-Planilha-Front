import { Injectable, signal } from '@angular/core';
import { ModoPeriodo } from './format';
import { IntervaloRelatorio, intervaloDoPreset } from './relatorios/intervalo';

/**
 * Guarda os filtros escolhidos enquanto a página está aberta, para que trocar de aba não volte ao mês atual.
 * Uber e Despesas compartilham o mesmo período; os Relatórios têm o próprio intervalo de meses.
 */
@Injectable({ providedIn: 'root' })
export class FiltrosService {
  readonly modo = signal<ModoPeriodo>('mes');
  readonly referencia = signal(new Date());
  readonly relatorio = signal<IntervaloRelatorio>(intervaloDoPreset(12, new Date()));

  /** Volta tudo ao padrão (usado ao sair do sistema). */
  reiniciar(): void {
    this.modo.set('mes');
    this.referencia.set(new Date());
    this.relatorio.set(intervaloDoPreset(12, new Date()));
  }
}

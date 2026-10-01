import { Component, OnInit, computed, inject, output } from '@angular/core';
import { FiltrosService } from '../filtros.service';
import { ModoPeriodo, Periodo, calcularPeriodo, deIso, deslocar } from '../format';

/** Seletor de período (semana, mês ou tudo) com navegação; emite o período a cada mudança. */
@Component({
  selector: 'app-filtro-periodo',
  templateUrl: './filtro-periodo.html',
  styleUrl: './filtro-periodo.css',
})
export class FiltroPeriodo implements OnInit {
  readonly periodoChange = output<Periodo>();

  private readonly filtros = inject(FiltrosService);
  // O período fica guardado no serviço: ao trocar de aba e voltar, continua o mesmo.
  protected readonly modo = this.filtros.modo;
  private readonly referencia = this.filtros.referencia;
  protected readonly periodo = computed(() => calcularPeriodo(this.modo(), this.referencia()));

  ngOnInit(): void {
    this.periodoChange.emit(this.periodo());
  }

  protected mudarModo(modo: ModoPeriodo): void {
    this.modo.set(modo);
    this.periodoChange.emit(this.periodo());
  }

  protected navegar(sentido: 1 | -1): void {
    this.referencia.set(deslocar(this.modo(), this.referencia(), sentido));
    this.periodoChange.emit(this.periodo());
  }

  protected hoje(): void {
    this.referencia.set(new Date());
    this.periodoChange.emit(this.periodo());
  }

  /**
   * Se a data (yyyy-MM-dd) estiver fora do período exibido, passa para o período dela.
   * Devolve true quando o período mudou (e portanto foi emitido).
   */
  mostrarData(data: string): boolean {
    const { inicio, fim } = this.periodo();
    if ((inicio && data < inicio) || (fim && data > fim)) {
      this.referencia.set(deIso(data));
      this.periodoChange.emit(this.periodo());
      return true;
    }
    return false;
  }
}

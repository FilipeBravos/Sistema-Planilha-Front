import { TestBed } from '@angular/core/testing';
import { FiltroPeriodo } from './filtro-periodo/filtro-periodo';
import { FiltrosService } from './filtros.service';

describe('filtros lembrados entre as abas', () => {
  /** Abre o filtro (como ao entrar numa aba), devolve o período emitido e a instância. */
  function abrir(): { periodo: { inicio: string | null; fim: string | null }; instancia: any; destruir: () => void } {
    const fixture = TestBed.createComponent(FiltroPeriodo);
    let periodo: any = null;
    fixture.componentInstance.periodoChange.subscribe((p) => (periodo = p));
    fixture.detectChanges();
    return { periodo, instancia: fixture.componentInstance, destruir: () => fixture.destroy() };
  }

  it('ao voltar para a aba, o período escolhido continua o mesmo', () => {
    const primeira = abrir();
    primeira.instancia.mudarModo('semana');
    primeira.instancia.navegar(-1);
    primeira.instancia.navegar(-1);
    const escolhido = primeira.instancia.periodo();
    primeira.destruir(); // trocou de aba

    const segunda = abrir(); // voltou
    expect(segunda.periodo).toEqual(escolhido);
    expect(segunda.instancia.periodo().inicio).toBe(escolhido.inicio);
    expect(segunda.instancia.modo()).toBe('semana');
  });

  it('reiniciar volta ao mês atual', () => {
    const filtros = TestBed.inject(FiltrosService);
    filtros.modo.set('tudo');
    filtros.referencia.set(new Date(2020, 0, 1));
    filtros.relatorio.set({ preset: 'personalizado', inicio: '2020-01', fim: '2020-03' });

    filtros.reiniciar();

    expect(filtros.modo()).toBe('mes');
    expect(filtros.referencia().getFullYear()).toBe(new Date().getFullYear());
    expect(filtros.relatorio().preset).toBe(12);
  });
});

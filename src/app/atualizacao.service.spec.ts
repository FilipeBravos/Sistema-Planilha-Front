import { signal } from '@angular/core';
import { discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AtualizacaoService, INTERVALO_ATUALIZACAO_MS, definirSeMudou, mesmosDados } from './atualizacao.service';

describe('atualização automática', () => {
  function criar(): { servico: AtualizacaoService; pedidos: () => number } {
    const servico = TestBed.inject(AtualizacaoService);
    let n = 0;
    servico.pedido$.subscribe(() => n++);
    return { servico, pedidos: () => n };
  }

  it('pede atualização a cada 15 segundos com a aba visível', fakeAsync(() => {
    spyOnProperty(document, 'hidden', 'get').and.returnValue(false);
    const { pedidos } = criar();

    tick(INTERVALO_ATUALIZACAO_MS - 1);
    expect(pedidos()).toBe(0);
    tick(1);
    expect(pedidos()).toBe(1);
    tick(INTERVALO_ATUALIZACAO_MS * 2);
    expect(pedidos()).toBe(3);
    discardPeriodicTasks();
  }));

  it('não pede com a aba oculta, mas pede ao voltar para ela', fakeAsync(() => {
    const oculta = spyOnProperty(document, 'hidden', 'get').and.returnValue(true);
    const { pedidos } = criar();

    tick(INTERVALO_ATUALIZACAO_MS * 3);
    expect(pedidos()).toBe(0);

    oculta.and.returnValue(false);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(pedidos()).toBe(1);
    discardPeriodicTasks();
  }));

  it('agora() pede na hora e registrar() guarda a hora da última carga', fakeAsync(() => {
    spyOnProperty(document, 'hidden', 'get').and.returnValue(false);
    const { servico, pedidos } = criar();

    servico.agora();
    expect(pedidos()).toBe(1);

    expect(servico.ultima()).toBeNull();
    servico.registrar();
    expect(servico.ultima()).toBeInstanceOf(Date);
    discardPeriodicTasks();
  }));

  it('só troca o valor quando os dados mudaram', () => {
    expect(mesmosDados([{ a: 1 }], [{ a: 1 }])).toBeTrue();
    expect(mesmosDados([{ a: 1 }], [{ a: 2 }])).toBeFalse();

    const original = [{ id: 1 }];
    const s = signal(original);
    definirSeMudou(s, [{ id: 1 }]);
    expect(s()).toBe(original); // mesma referência: nada foi redesenhado
    definirSeMudou(s, [{ id: 1 }, { id: 2 }]);
    expect(s().length).toBe(2);
  });
});

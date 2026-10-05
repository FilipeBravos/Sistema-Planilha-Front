import { TestBed } from '@angular/core/testing';
import { brParaIso, isoParaBr, mascararData } from '../format';
import { CampoData } from './campo-data';

describe('datas em dd/mm/aaaa', () => {
  it('converte entre o valor do formulário (aaaa-mm-dd) e o texto (dd/mm/aaaa)', () => {
    expect(isoParaBr('2026-10-01')).toBe('01/10/2026');
    expect(isoParaBr('')).toBe('');
    expect(isoParaBr(null)).toBe('');
    expect(brParaIso('01/10/2026')).toBe('2026-10-01');
  });

  it('recusa datas incompletas, inexistentes ou fora do intervalo', () => {
    expect(brParaIso('01/10/20')).toBe('');
    expect(brParaIso('31/02/2026')).toBe('');
    expect(brParaIso('29/02/2026')).toBe('');
    expect(brParaIso('29/02/2028')).toBe('2028-02-29');
    expect(brParaIso('00/10/2026')).toBe('');
    expect(brParaIso('01/13/2026')).toBe('');
    expect(brParaIso('01/10/1800')).toBe('');
  });

  it('coloca as barras enquanto digita e ignora o que não é número', () => {
    expect(mascararData('0')).toBe('0');
    expect(mascararData('01')).toBe('01');
    expect(mascararData('011')).toBe('01/1');
    expect(mascararData('0110')).toBe('01/10');
    expect(mascararData('01102')).toBe('01/10/2');
    expect(mascararData('01102026')).toBe('01/10/2026');
    expect(mascararData('01/10/2026abc99')).toBe('01/10/2026');
    expect(mascararData('')).toBe('');
  });
});

describe('CampoData', () => {
  function criar() {
    const fixture = TestBed.createComponent(CampoData);
    const comp = fixture.componentInstance;
    let valor: string | undefined;
    comp.registerOnChange((v) => (valor = v));
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const campo = el.querySelector('input[type=text]') as HTMLInputElement;
    const digitar = (texto: string) => {
      campo.value = texto;
      campo.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };
    return { fixture, comp, el, campo, digitar, valor: () => valor };
  }

  it('mostra o valor recebido como dd/mm/aaaa', () => {
    const { comp, fixture, campo } = criar();
    comp.writeValue('2026-10-01');
    fixture.detectChanges();
    expect(campo.value).toBe('01/10/2026');
  });

  it('digitar só números monta a data e devolve aaaa-mm-dd ao formulário', () => {
    const { campo, digitar, valor } = criar();
    digitar('0110');
    expect(campo.value).toBe('01/10');
    expect(valor()).toBe('');
    digitar('01102026');
    expect(campo.value).toBe('01/10/2026');
    expect(valor()).toBe('2026-10-01');
  });

  it('data completa mas inexistente: marca como inválida e deixa o valor vazio', () => {
    const { campo, digitar, valor, el } = criar();
    digitar('31022026');
    expect(valor()).toBe('');
    expect(campo.classList).toContain('invalida');
    expect(campo.getAttribute('aria-invalid')).toBe('true');

    digitar('28022026');
    expect(valor()).toBe('2026-02-28');
    expect(el.querySelector('input.invalida')).toBeNull();
  });

  it('apagar o texto limpa o valor', () => {
    const { digitar, valor } = criar();
    digitar('01102026');
    digitar('');
    expect(valor()).toBe('');
  });

  it('escolher no calendário preenche o texto e o valor', () => {
    const { fixture, el, campo, valor } = criar();
    const seletor = el.querySelector('input.seletor') as HTMLInputElement;
    seletor.value = '2026-12-25';
    seletor.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(campo.value).toBe('25/12/2026');
    expect(valor()).toBe('2026-12-25');
  });
});

import { TestBed } from '@angular/core/testing';
import { completarHora, mascararHora, validarHora } from '../format';
import { CampoHora } from './campo-hora';

describe('horas em 24 h (hh:mm)', () => {
  it('coloca os dois pontos enquanto digita e ignora o que não é número', () => {
    expect(mascararHora('0')).toBe('0');
    expect(mascararHora('08')).toBe('08');
    expect(mascararHora('083')).toBe('08:3');
    expect(mascararHora('0830')).toBe('08:30');
    expect(mascararHora('08:30pm')).toBe('08:30');
    expect(mascararHora('083099')).toBe('08:30');
  });

  it('aceita de 00:00 a 23:59 e recusa o resto', () => {
    expect(validarHora('00:00')).toBe('00:00');
    expect(validarHora('23:59')).toBe('23:59');
    expect(validarHora('17:30')).toBe('17:30');
    expect(validarHora('24:00')).toBe('');
    expect(validarHora('25:10')).toBe('');
    expect(validarHora('12:60')).toBe('');
    expect(validarHora('08:3')).toBe('');
    expect(validarHora('')).toBe('');
  });

  it('ao sair do campo completa "830" e "8"', () => {
    expect(completarHora('83:0')).toBe('08:30'); // digitou 830
    expect(completarHora('13')).toBe('13:00');
    expect(completarHora('8')).toBe('08:00');
    expect(completarHora('08:30')).toBe('08:30');
    expect(completarHora('')).toBe('');
  });
});

describe('CampoHora', () => {
  function criar() {
    const fixture = TestBed.createComponent(CampoHora);
    const comp = fixture.componentInstance;
    let valor: string | undefined;
    comp.registerOnChange((v) => (valor = v));
    fixture.detectChanges();
    const campo = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    const digitar = (texto: string) => {
      campo.value = texto;
      campo.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };
    const sair = () => {
      campo.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
    };
    return { fixture, comp, campo, digitar, sair, valor: () => valor };
  }

  it('mostra o valor recebido em 24 h (sem segundos)', () => {
    const { comp, fixture, campo } = criar();
    comp.writeValue('17:30:00');
    fixture.detectChanges();
    expect(campo.value).toBe('17:30');
  });

  it('digitar 0830 devolve 08:30 ao formulário', () => {
    const { campo, digitar, valor } = criar();
    digitar('083');
    expect(valor()).toBe('');
    digitar('0830');
    expect(campo.value).toBe('08:30');
    expect(valor()).toBe('08:30');
  });

  it('hora inexistente fica vermelha e não vai para o formulário', () => {
    const { campo, digitar, valor } = criar();
    digitar('2500');
    expect(valor()).toBe('');
    expect(campo.classList).toContain('invalida');
    digitar('2359');
    expect(valor()).toBe('23:59');
    expect(campo.classList).not.toContain('invalida');
  });

  it('ao sair, "830" vira 08:30 e apagar limpa o valor', () => {
    const { campo, digitar, sair, valor } = criar();
    digitar('830');
    sair();
    expect(campo.value).toBe('08:30');
    expect(valor()).toBe('08:30');
    digitar('');
    sair();
    expect(valor()).toBe('');
    expect(campo.classList).not.toContain('invalida');
  });
});

import { TestBed } from '@angular/core/testing';
import { formatarValorBr, lerValorBr, limparValorDigitado } from '../format';
import { CampoValor } from './campo-valor';

describe('valores em reais (0,00)', () => {
  it('formata com vírgula e 2 casas', () => {
    expect(formatarValorBr(0)).toBe('0,00');
    expect(formatarValorBr(200)).toBe('200,00');
    expect(formatarValorBr(1234.5)).toBe('1.234,50');
    expect(formatarValorBr(1000000)).toBe('1.000.000,00');
  });

  it('lê o que a pessoa digita', () => {
    expect(lerValorBr('200')).toBe(200);
    expect(lerValorBr('1234,5')).toBe(1234.5);
    expect(lerValorBr('1.234,56')).toBe(1234.56);
    expect(lerValorBr('0,00')).toBe(0);
    expect(lerValorBr(',5')).toBe(0.5);
    expect(lerValorBr('150,')).toBe(150);
    expect(lerValorBr('R$ 10,50')).toBe(10.5);
    expect(lerValorBr('12.5')).toBe(12.5); // ponto com 1–2 casas = decimal
    expect(lerValorBr('0.50')).toBe(0.5);
    expect(lerValorBr('1.234')).toBe(1234); // ponto com 3 casas = milhar
    expect(lerValorBr('1.234.567')).toBe(1234567);
  });

  it('vazio ou ilegível vira null', () => {
    expect(lerValorBr('')).toBeNull();
    expect(lerValorBr('  ')).toBeNull();
    expect(lerValorBr(',')).toBeNull();
    expect(lerValorBr('1,2,3')).toBeNull();
    expect(lerValorBr('1,234')).toBeNull(); // 3 casas depois da vírgula
    expect(lerValorBr('12345678901')).toBeNull(); // grande demais
  });

  it('enquanto digita: só números, vírgula e pontos, uma vírgula e 2 casas', () => {
    expect(limparValorDigitado('12a3')).toBe('123');
    expect(limparValorDigitado('-5')).toBe('5');
    expect(limparValorDigitado('12.')).toBe('12.'); // ponto é mantido: decide-se só ao ler
    expect(limparValorDigitado('1.234')).toBe('1.234'); // milhar é mantido
    expect(limparValorDigitado('12,345')).toBe('12,34');
    expect(limparValorDigitado('1,2,3')).toBe('1,23');
    expect(limparValorDigitado('1.234,5.6')).toBe('1.234,56');
  });
});

describe('CampoValor', () => {
  function criar() {
    const fixture = TestBed.createComponent(CampoValor);
    const comp = fixture.componentInstance;
    let valor: number | null | undefined;
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

  it('mostra o valor recebido com vírgula', () => {
    const { comp, fixture, campo } = criar();
    comp.writeValue(1234.5);
    fixture.detectChanges();
    expect(campo.value).toBe('1.234,50');
    comp.writeValue(0);
    fixture.detectChanges();
    expect(campo.value).toBe('0,00');
    comp.writeValue(null);
    fixture.detectChanges();
    expect(campo.value).toBe('');
  });

  it('digitar atualiza o número do formulário e ao sair formata como 0,00', () => {
    const { campo, digitar, sair, valor } = criar();
    digitar('1234,5');
    expect(valor()).toBe(1234.5);
    expect(campo.value).toBe('1234,5');
    sair();
    expect(campo.value).toBe('1.234,50');
    expect(valor()).toBe(1234.5);
  });

  it('letras são ignoradas e 12.5 (ponto decimal) vira 12,50', () => {
    const { campo, digitar, sair, valor } = criar();
    digitar('12.5');
    expect(valor()).toBe(12.5);
    digitar('12,5abc');
    expect(campo.value).toBe('12,5');
    sair();
    expect(campo.value).toBe('12,50');
    expect(valor()).toBe(12.5);
  });

  it('digitar o milhar com ponto, tecla por tecla, nunca altera o valor (2.500,00 = 2500)', () => {
    const { campo, digitar, sair, valor } = criar();
    let texto = '';
    for (const tecla of '2.500,00') {
      texto += tecla;
      digitar(texto);
    }
    expect(campo.value).toBe('2.500,00');
    expect(valor()).toBe(2500);
    sair();
    expect(campo.value).toBe('2.500,00');
    expect(valor()).toBe(2500);
  });

  it('apagar deixa o campo e o valor vazios', () => {
    const { campo, digitar, sair, valor } = criar();
    digitar('50');
    digitar('');
    sair();
    expect(campo.value).toBe('');
    expect(valor()).toBeNull();
  });
});

import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { formatarValorBr, lerValorBr, limparValorDigitado } from '../format';

/**
 * Campo de valor em reais com vírgula (0,00) em qualquer navegador: o campo numérico nativo segue o idioma do
 * navegador e pode mostrar 0.00. O valor do formulário continua sendo um número (ou null quando vazio).
 */
@Component({
  selector: 'app-campo-valor',
  templateUrl: './campo-valor.html',
  styleUrl: './campo-valor.css',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CampoValor), multi: true }],
})
export class CampoValor implements ControlValueAccessor {
  readonly nome = input<string>('');
  readonly rotulo = input<string>('Valor');

  protected readonly texto = signal('');

  private aoMudar: (valor: number | null) => void = () => undefined;
  private aoTocar: () => void = () => undefined;

  writeValue(valor: number | null): void {
    this.texto.set(valor === null || valor === undefined ? '' : formatarValorBr(valor));
  }

  registerOnChange(fn: (valor: number | null) => void): void {
    this.aoMudar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.aoTocar = fn;
  }

  protected digitou(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const limpo = limparValorDigitado(entrada.value);
    if (limpo !== entrada.value) {
      entrada.value = limpo; // só mexe no campo se algo foi corrigido (evita pular o cursor)
    }
    this.texto.set(limpo);
    this.aoMudar(lerValorBr(limpo));
  }

  /** Ao sair do campo: "1234,5" vira "1.234,50"; "200" vira "200,00". */
  protected saiu(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const valor = lerValorBr(entrada.value);
    const formatado = valor === null ? '' : formatarValorBr(valor);
    entrada.value = formatado;
    this.texto.set(formatado);
    this.aoMudar(valor);
    this.aoTocar();
  }
}

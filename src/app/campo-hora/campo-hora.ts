import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { completarHora, mascararHora, validarHora } from '../format';

/**
 * Campo de hora em 24 h (hh:mm), igual em qualquer navegador (o campo de hora nativo segue o idioma do
 * navegador e pode mostrar AM/PM). O valor do formulário continua sendo "HH:mm".
 */
@Component({
  selector: 'app-campo-hora',
  templateUrl: './campo-hora.html',
  styleUrl: './campo-hora.css',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CampoHora), multi: true }],
})
export class CampoHora implements ControlValueAccessor {
  readonly nome = input<string>('');
  readonly rotulo = input<string>('Hora');

  protected readonly texto = signal('');
  /** Texto preenchido que não é uma hora válida (ex.: 25:00 ou 08:3). */
  protected readonly invalida = signal(false);

  private aoMudar: (valor: string) => void = () => undefined;
  private aoTocar: () => void = () => undefined;

  writeValue(valor: string | null): void {
    this.texto.set(valor ? valor.slice(0, 5) : '');
    this.invalida.set(false);
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.aoMudar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.aoTocar = fn;
  }

  protected digitou(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const formatado = mascararHora(entrada.value);
    entrada.value = formatado;
    this.atualizar(formatado, formatado.length === 5);
  }

  protected saiu(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const completo = mascararHora(completarHora(entrada.value));
    entrada.value = completo;
    this.atualizar(completo, completo.length > 0);
    this.aoTocar();
  }

  private atualizar(texto: string, conferir: boolean): void {
    const valor = validarHora(texto);
    this.texto.set(texto);
    this.invalida.set(conferir && !valor);
    this.aoMudar(valor);
  }
}

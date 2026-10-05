import { Component, ElementRef, forwardRef, input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { brParaIso, isoParaBr, mascararData } from '../format';

/**
 * Campo de data no formato dd/mm/aaaa, igual em qualquer navegador (o campo de data nativo segue o idioma do
 * navegador e pode aparecer como mm/dd/yyyy). O valor do formulário continua sendo "aaaa-mm-dd".
 */
@Component({
  selector: 'app-campo-data',
  templateUrl: './campo-data.html',
  styleUrl: './campo-data.css',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CampoData), multi: true }],
})
export class CampoData implements ControlValueAccessor {
  readonly nome = input<string>('');
  readonly rotulo = input<string>('Data');

  protected readonly texto = signal('');
  protected readonly iso = signal('');
  /** Preenchida por inteiro, mas não é uma data real (ex.: 31/02/2026). */
  protected readonly invalida = signal(false);

  private readonly seletor = viewChild.required<ElementRef<HTMLInputElement>>('seletor');
  private aoMudar: (valor: string) => void = () => undefined;
  private aoTocar: () => void = () => undefined;

  writeValue(valor: string | null): void {
    this.iso.set(valor ?? '');
    this.texto.set(isoParaBr(valor));
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
    const formatado = mascararData(entrada.value);
    entrada.value = formatado;
    this.texto.set(formatado);
    this.atualizar(brParaIso(formatado), formatado.length === 10);
  }

  protected escolheuNoCalendario(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    if (valor) {
      this.texto.set(isoParaBr(valor));
      this.atualizar(valor, false);
    }
  }

  protected abrirCalendario(): void {
    const campo = this.seletor().nativeElement;
    campo.value = this.iso();
    if (typeof campo.showPicker === 'function') {
      campo.showPicker();
    } else {
      campo.focus();
      campo.click();
    }
  }

  protected tocou(): void {
    this.aoTocar();
  }

  private atualizar(iso: string, completo: boolean): void {
    this.iso.set(iso);
    this.invalida.set(completo && !iso);
    this.aoMudar(iso);
  }
}

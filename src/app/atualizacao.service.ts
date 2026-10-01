import { Injectable, WritableSignal, signal } from '@angular/core';
import { Subject, filter, fromEvent, interval } from 'rxjs';

/** De quanto em quanto tempo as telas buscam dados novos (enquanto a aba do navegador está visível). */
export const INTERVALO_ATUALIZACAO_MS = 15_000;

export const MSG_SEM_CONEXAO = 'Não foi possível conectar ao servidor.';

export function mesmosDados(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Só troca o valor se os dados mudaram: evita redesenhar a tela (e piscar) a cada atualização. */
export function definirSeMudou<T>(sinal: WritableSignal<T>, novo: T): void {
  if (!mesmosDados(sinal(), novo)) {
    sinal.set(novo);
  }
}

/**
 * Pede às telas que recarreguem os dados: a cada 15 s com a aba visível, ao voltar para a aba e quando
 * alguém clica em "Atualizado às…". Quem mexe em dados em outro computador aparece aqui sem apertar F5.
 */
@Injectable({ providedIn: 'root' })
export class AtualizacaoService {
  private readonly pedidos = new Subject<void>();
  readonly pedido$ = this.pedidos.asObservable();
  /** Hora da última carga de dados bem-sucedida. */
  readonly ultima = signal<Date | null>(null);

  constructor() {
    interval(INTERVALO_ATUALIZACAO_MS)
      .pipe(filter(() => !document.hidden))
      .subscribe(() => this.pedidos.next());
    fromEvent(document, 'visibilitychange')
      .pipe(filter(() => !document.hidden))
      .subscribe(() => this.pedidos.next());
  }

  agora(): void {
    this.pedidos.next();
  }

  registrar(): void {
    this.ultima.set(new Date());
  }
}

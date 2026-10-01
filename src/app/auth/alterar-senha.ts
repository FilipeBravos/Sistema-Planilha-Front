import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';

const TAMANHO_MINIMO = 8;

@Component({
  selector: 'app-alterar-senha',
  imports: [FormsModule],
  templateUrl: './alterar-senha.html',
  styleUrl: './alterar-senha.css',
})
export class AlterarSenha {
  private readonly auth = inject(AuthService);
  readonly fechar = output<void>();

  protected atual = '';
  protected nova = '';
  protected confirmacao = '';
  protected readonly erro = signal('');
  protected readonly concluido = signal(false);
  protected readonly enviando = signal(false);

  protected salvar(): void {
    if (!this.atual || !this.nova) {
      this.erro.set('Preencha a senha atual e a nova senha.');
      return;
    }
    if (this.nova.length < TAMANHO_MINIMO) {
      this.erro.set(`A nova senha precisa ter pelo menos ${TAMANHO_MINIMO} caracteres.`);
      return;
    }
    if (this.nova !== this.confirmacao) {
      this.erro.set('A confirmação não é igual à nova senha.');
      return;
    }
    this.erro.set('');
    this.enviando.set(true);
    this.auth.alterarSenha(this.atual, this.nova).subscribe({
      next: () => {
        this.enviando.set(false);
        this.concluido.set(true);
      },
      error: (e: HttpErrorResponse) => {
        this.enviando.set(false);
        const erros = e.error?.erros as Record<string, string> | undefined;
        this.erro.set(erros ? Object.values(erros).join(' ') : (e.error?.mensagem ?? 'Não foi possível alterar a senha.'));
      },
    });
  }
}

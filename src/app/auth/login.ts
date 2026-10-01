import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);

  protected usuario = '';
  protected senha = '';
  protected readonly erro = signal('');
  protected readonly enviando = signal(false);

  protected entrar(): void {
    if (!this.usuario.trim() || !this.senha) {
      this.erro.set('Informe o usuário e a senha.');
      return;
    }
    this.erro.set('');
    this.enviando.set(true);
    this.auth.entrar(this.usuario, this.senha).subscribe({
      next: () => {
        this.senha = '';
        this.enviando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.senha = '';
        this.enviando.set(false);
        this.erro.set(
          e.status === 0 ? 'Não foi possível conectar ao servidor.' : (e.error?.mensagem ?? 'Não foi possível entrar.'),
        );
      },
    });
  }
}

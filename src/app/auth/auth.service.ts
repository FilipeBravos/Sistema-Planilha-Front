import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of, switchMap, tap, throwError } from 'rxjs';
import { API_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  /** Login de quem está logado; null = ninguém. */
  readonly usuario = signal<string | null>(null);
  /** true enquanto se descobre, ao abrir o site, se já existe uma sessão. */
  readonly verificando = signal(true);

  iniciar(): void {
    this.http.get<{ usuario: string }>(`${API_URL}/auth/eu`).subscribe({
      next: (r) => this.finalizarVerificacao(r.usuario),
      error: () => this.finalizarVerificacao(null),
    });
  }

  /**
   * Ao sair, o servidor apaga o token anti-CSRF; o primeiro login seguinte volta 403. Nesse caso busca um
   * token novo (qualquer GET devolve o cookie) e tenta uma única vez de novo.
   */
  entrar(usuario: string, senha: string): Observable<{ usuario: string }> {
    const tentar = () => this.http.post<{ usuario: string }>(`${API_URL}/auth/login`, { usuario, senha });
    return tentar().pipe(
      catchError((e: unknown) =>
        e instanceof HttpErrorResponse && e.status === 403
          ? this.http.get(`${API_URL}/auth/eu`).pipe(
              catchError(() => of(null)),
              switchMap(() => tentar()),
            )
          : throwError(() => e),
      ),
      tap((r) => this.usuario.set(r.usuario)),
    );
  }

  sair(): void {
    const encerrar = () => this.usuario.set(null);
    this.http.post<void>(`${API_URL}/auth/logout`, {}).subscribe({ next: encerrar, error: encerrar });
  }

  alterarSenha(senhaAtual: string, novaSenha: string): Observable<{ mensagem: string }> {
    return this.http.post<{ mensagem: string }>(`${API_URL}/auth/senha`, { senhaAtual, novaSenha });
  }

  /** Chamado quando o servidor responde 401 (sessão expirou): volta para a tela de login. */
  sessaoExpirou(): void {
    this.usuario.set(null);
  }

  private finalizarVerificacao(usuario: string | null): void {
    this.usuario.set(usuario);
    this.verificando.set(false);
  }
}

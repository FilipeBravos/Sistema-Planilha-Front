import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Se a API responder 401 em qualquer chamada de dados, a sessão acabou: volta para o login. */
export const sessaoInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  return next(req).pipe(
    catchError((erro: unknown) => {
      const ehAuth = req.url.includes('/auth/');
      if (erro instanceof HttpErrorResponse && erro.status === 401 && !ehAuth) {
        auth.sessaoExpirou();
      }
      return throwError(() => erro);
    }),
  );
};

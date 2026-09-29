import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api.config';
import { Periodo } from './format';
import { Registro, RegistroRequest, Resumo } from './models';

@Injectable({ providedIn: 'root' })
export class RegistroService {
  private readonly http = inject(HttpClient);

  listar(periodo?: Periodo): Observable<Registro[]> {
    return this.http.get<Registro[]>(`${API_URL}/registros`, { params: this.params(periodo) });
  }

  resumo(periodo?: Periodo): Observable<Resumo> {
    return this.http.get<Resumo>(`${API_URL}/resumo`, { params: this.params(periodo) });
  }

  private params(periodo?: Periodo): HttpParams {
    let params = new HttpParams();
    if (periodo?.inicio) {
      params = params.set('inicio', periodo.inicio);
    }
    if (periodo?.fim) {
      params = params.set('fim', periodo.fim);
    }
    return params;
  }

  criar(registro: RegistroRequest): Observable<Registro> {
    return this.http.post<Registro>(`${API_URL}/registros`, registro);
  }

  atualizar(id: number, registro: RegistroRequest): Observable<Registro> {
    return this.http.put<Registro>(`${API_URL}/registros/${id}`, registro);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/registros/${id}`);
  }
}

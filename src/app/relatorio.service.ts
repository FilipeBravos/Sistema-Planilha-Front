import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api.config';
import { Relatorio } from './models';

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  private readonly http = inject(HttpClient);

  dashboard(inicio: string, fim: string): Observable<Relatorio> {
    const params = new HttpParams().set('inicio', inicio).set('fim', fim);
    return this.http.get<Relatorio>(`${API_URL}/relatorios/dashboard`, { params });
  }
}

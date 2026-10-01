import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api.config';
import { Periodo } from './format';
import { CategoriaDespesa, Despesa, DespesaRequest, DespesaResumo } from './models';

@Injectable({ providedIn: 'root' })
export class DespesaService {
  private readonly http = inject(HttpClient);

  listar(categoria: CategoriaDespesa | null, periodo: Periodo): Observable<Despesa[]> {
    let params = this.params(periodo);
    if (categoria) {
      params = params.set('categoria', categoria);
    }
    return this.http.get<Despesa[]>(`${API_URL}/despesas`, { params });
  }

  resumo(periodo: Periodo): Observable<DespesaResumo> {
    return this.http.get<DespesaResumo>(`${API_URL}/despesas/resumo`, { params: this.params(periodo) });
  }

  criar(despesa: DespesaRequest): Observable<Despesa> {
    return this.http.post<Despesa>(`${API_URL}/despesas`, despesa);
  }

  atualizar(id: number, despesa: DespesaRequest): Observable<Despesa> {
    return this.http.put<Despesa>(`${API_URL}/despesas/${id}`, despesa);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/despesas/${id}`);
  }

  private params(periodo: Periodo): HttpParams {
    let params = new HttpParams();
    if (periodo.inicio) {
      params = params.set('inicio', periodo.inicio);
    }
    if (periodo.fim) {
      params = params.set('fim', periodo.fim);
    }
    return params;
  }
}

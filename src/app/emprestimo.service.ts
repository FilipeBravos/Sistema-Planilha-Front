import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api.config';
import { Credor, Emprestimo, EmprestimoRequest, EmprestimoResumo } from './models';

@Injectable({ providedIn: 'root' })
export class EmprestimoService {
  private readonly http = inject(HttpClient);

  listar(credor: Credor | null): Observable<Emprestimo[]> {
    let params = new HttpParams();
    if (credor) {
      params = params.set('credor', credor);
    }
    return this.http.get<Emprestimo[]>(`${API_URL}/emprestimos`, { params });
  }

  resumo(): Observable<EmprestimoResumo> {
    return this.http.get<EmprestimoResumo>(`${API_URL}/emprestimos/resumo`);
  }

  criar(emprestimo: EmprestimoRequest): Observable<Emprestimo> {
    return this.http.post<Emprestimo>(`${API_URL}/emprestimos`, emprestimo);
  }

  atualizar(id: number, emprestimo: EmprestimoRequest): Observable<Emprestimo> {
    return this.http.put<Emprestimo>(`${API_URL}/emprestimos/${id}`, emprestimo);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/emprestimos/${id}`);
  }
}

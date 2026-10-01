import { Component, signal } from '@angular/core';
import { Despesas } from './despesas/despesas';
import { Emprestimos } from './emprestimos/emprestimos';
import { PlanilhaUber } from './planilha/planilha-uber';
import { Relatorios } from './relatorios/relatorios';

type Aba = 'uber' | 'despesas' | 'emprestimos' | 'relatorios';

@Component({
  selector: 'app-root',
  imports: [PlanilhaUber, Despesas, Emprestimos, Relatorios],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly aba = signal<Aba>('uber');
}

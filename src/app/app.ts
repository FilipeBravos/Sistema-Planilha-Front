import { Component, signal } from '@angular/core';
import { Despesas } from './despesas/despesas';
import { Emprestimos } from './emprestimos/emprestimos';
import { PlanilhaUber } from './planilha/planilha-uber';

type Aba = 'uber' | 'despesas' | 'emprestimos';

@Component({
  selector: 'app-root',
  imports: [PlanilhaUber, Despesas, Emprestimos],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly aba = signal<Aba>('uber');
}

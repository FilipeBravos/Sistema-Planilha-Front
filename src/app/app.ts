import { Component, signal } from '@angular/core';
import { Despesas } from './despesas/despesas';
import { PlanilhaUber } from './planilha/planilha-uber';

type Aba = 'uber' | 'despesas';

@Component({
  selector: 'app-root',
  imports: [PlanilhaUber, Despesas],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly aba = signal<Aba>('uber');
}

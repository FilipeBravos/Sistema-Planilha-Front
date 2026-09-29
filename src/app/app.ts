import { Component } from '@angular/core';
import { PlanilhaUber } from './planilha/planilha-uber';

@Component({
  selector: 'app-root',
  imports: [PlanilhaUber],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}

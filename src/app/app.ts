import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AtualizacaoService } from './atualizacao.service';
import { FiltrosService } from './filtros.service';
import { AlterarSenha } from './auth/alterar-senha';
import { AuthService } from './auth/auth.service';
import { Login } from './auth/login';
import { Despesas } from './despesas/despesas';
import { Emprestimos } from './emprestimos/emprestimos';
import { PlanilhaUber } from './planilha/planilha-uber';
import { Relatorios } from './relatorios/relatorios';

type Aba = 'uber' | 'despesas' | 'emprestimos' | 'relatorios';

@Component({
  selector: 'app-root',
  imports: [PlanilhaUber, Despesas, Emprestimos, Relatorios, Login, AlterarSenha, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly atualizacao = inject(AtualizacaoService);
  private readonly filtros = inject(FiltrosService);
  protected readonly aba = signal<Aba>('uber');
  protected readonly alterandoSenha = signal(false);

  ngOnInit(): void {
    this.auth.iniciar();
  }

  protected sair(): void {
    this.alterandoSenha.set(false);
    this.aba.set('uber');
    this.filtros.reiniciar();
    this.auth.sair();
  }
}

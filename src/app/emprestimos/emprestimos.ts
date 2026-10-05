import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CampoData } from '../campo-data/campo-data';
import { Subscription, forkJoin } from 'rxjs';
import { AtualizacaoService, MSG_SEM_CONEXAO, definirSeMudou } from '../atualizacao.service';
import { EmprestimoService } from '../emprestimo.service';
import { formatarData } from '../format';
import { Credor, Emprestimo, EmprestimoRequest, EmprestimoResumo } from '../models';
import { CREDORES, percentualPago, rotuloCredor } from './credores';

interface FormularioEmprestimo {
  credor: Credor | '';
  nomeTerceiro: string;
  data: string;
  valor: number | null;
  parcelas: number | null;
  valorPago: number | null;
}

function formularioVazio(credor: Credor | '' = ''): FormularioEmprestimo {
  return { credor, nomeTerceiro: '', data: '', valor: null, parcelas: null, valorPago: null };
}

@Component({
  selector: 'app-emprestimos',
  imports: [FormsModule, CurrencyPipe, CampoData],
  templateUrl: './emprestimos.html',
  styleUrl: './emprestimos.css',
})
export class Emprestimos implements OnInit {
  private readonly service = inject(EmprestimoService);
  private readonly atualizacao = inject(AtualizacaoService);
  private carga?: Subscription;

  protected readonly credores = CREDORES;
  protected readonly rotuloCredor = rotuloCredor;
  protected readonly percentualPago = percentualPago;
  protected readonly formatarData = formatarData;

  protected readonly emprestimos = signal<Emprestimo[]>([]);
  protected readonly resumo = signal<EmprestimoResumo | null>(null);
  protected readonly erro = signal('');
  protected readonly editandoId = signal<number | null>(null);
  /** Credor selecionado nos botões; null = todos. */
  protected readonly credorAtual = signal<Credor | null>(null);
  protected form: FormularioEmprestimo = formularioVazio();

  protected readonly nomeCredorAtual = computed(() => {
    const c = this.credorAtual();
    return c ? rotuloCredor(c) : 'Todos os empréstimos';
  });
  /** Nomes de terceiros já usados, para sugerir ao digitar. */
  protected readonly terceirosConhecidos = computed(() => [
    ...new Set(this.emprestimos().flatMap((e) => (e.nomeTerceiro ? [e.nomeTerceiro] : []))),
  ]);

  constructor() {
    this.atualizacao.pedido$.pipe(takeUntilDestroyed()).subscribe(() => this.carregar(true));
  }

  ngOnInit(): void {
    this.carregar();
  }

  protected totalDe(credor: Credor): { emprestado: number; pago: number; saldo: number } {
    return this.resumo()?.porCredor.find((c) => c.credor === credor) ?? { emprestado: 0, pago: 0, saldo: 0 };
  }

  protected selecionarCredor(credor: Credor | null): void {
    this.credorAtual.set(credor);
    this.cancelar();
    this.carregar();
  }

  protected get valorParcelaPrevia(): number | null {
    const { valor, parcelas } = this.form;
    return valor && valor > 0 && parcelas && parcelas >= 1 ? Math.round((valor / Math.floor(parcelas)) * 100) / 100 : null;
  }

  protected get saldoPrevio(): number | null {
    const { valor, valorPago } = this.form;
    return valor && valor > 0 ? Math.max(valor - (valorPago ?? 0), 0) : null;
  }

  protected salvar(): void {
    const requisicao = this.montarRequisicao();
    if (!requisicao) {
      return;
    }
    const id = this.editandoId();
    const chamada = id === null ? this.service.criar(requisicao) : this.service.atualizar(id, requisicao);
    chamada.subscribe({
      next: () => {
        this.cancelar();
        this.carregar();
      },
      error: (e: HttpErrorResponse) => this.erro.set(this.mensagemDeErro(e)),
    });
  }

  protected editar(e: Emprestimo): void {
    this.editandoId.set(e.id);
    this.erro.set('');
    this.form = {
      credor: e.credor,
      nomeTerceiro: e.nomeTerceiro ?? '',
      data: e.data,
      valor: e.valor,
      parcelas: e.parcelas,
      valorPago: e.valorPago,
    };
  }

  protected cancelar(): void {
    this.editandoId.set(null);
    this.erro.set('');
    this.form = formularioVazio(this.credorAtual() ?? '');
  }

  protected excluir(e: Emprestimo): void {
    if (!confirm(`Excluir o empréstimo de ${rotuloCredor(e.credor, e.nomeTerceiro)} (${formatarData(e.data)})?`)) {
      return;
    }
    this.service.excluir(e.id).subscribe({
      next: () => {
        if (this.editandoId() === e.id) {
          this.cancelar();
        }
        this.carregar();
      },
      error: (err: HttpErrorResponse) => this.erro.set(this.mensagemDeErro(err)),
    });
  }

  /** `silencioso`: atualização automática; não mostra erros passageiros e não mexe no formulário. */
  private carregar(silencioso = false): void {
    this.carga?.unsubscribe(); // uma consulta antiga não pode sobrescrever uma mais nova
    this.carga = forkJoin({ lista: this.service.listar(this.credorAtual()), resumo: this.service.resumo() }).subscribe({
      next: ({ lista, resumo }) => {
        definirSeMudou(this.emprestimos, lista);
        definirSeMudou(this.resumo, resumo);
        if (this.erro() === MSG_SEM_CONEXAO) {
          this.erro.set('');
        }
        this.atualizacao.registrar();
      },
      error: (e: HttpErrorResponse) => {
        if (!silencioso) {
          this.erro.set(this.mensagemDeErro(e));
        }
      },
    });
  }

  private montarRequisicao(): EmprestimoRequest | null {
    const f = this.form;
    const nome = f.nomeTerceiro.trim();
    if (!f.credor) {
      this.erro.set('Escolha de onde veio o empréstimo.');
      return null;
    }
    if (f.credor === 'TERCEIROS' && !nome) {
      this.erro.set('Informe o nome de quem emprestou.');
      return null;
    }
    if (!f.data) {
      this.erro.set('Informe a data do empréstimo (dd/mm/aaaa).');
      return null;
    }
    if (f.valor === null || f.valor <= 0) {
      this.erro.set('Informe um valor maior que zero.');
      return null;
    }
    if (!f.parcelas || f.parcelas < 1 || f.parcelas > 600 || !Number.isInteger(f.parcelas)) {
      this.erro.set('Informe em quantas vezes foi o empréstimo (número inteiro, mínimo 1).');
      return null;
    }
    if ((f.valorPago ?? 0) < 0) {
      this.erro.set('O valor pago não pode ser negativo.');
      return null;
    }
    this.erro.set('');
    return {
      credor: f.credor,
      nomeTerceiro: f.credor === 'TERCEIROS' ? nome : null,
      data: f.data,
      valor: f.valor,
      parcelas: f.parcelas,
      valorPago: f.valorPago ?? 0,
    };
  }

  private mensagemDeErro(e: HttpErrorResponse): string {
    if (e.status === 0) {
      return MSG_SEM_CONEXAO;
    }
    const erros = e.error?.erros as Record<string, string> | undefined;
    if (erros) {
      return Object.values(erros).join(' ');
    }
    return e.error?.mensagem ?? e.error?.message ?? 'Erro inesperado.';
  }
}

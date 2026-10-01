import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DespesaService } from '../despesa.service';
import { FiltroPeriodo } from '../filtro-periodo/filtro-periodo';
import { Periodo, formatarData } from '../format';
import { CategoriaDespesa, Despesa, DespesaRequest, DespesaResumo, FormaPagamento } from '../models';
import { CATEGORIAS, FORMAS_PAGAMENTO, rotuloCategoria, rotuloForma } from './despesas-catalogo';

interface FormularioDespesa {
  categoria: CategoriaDespesa | '';
  nome: string;
  data: string;
  valor: number | null;
  formaPagamento: FormaPagamento;
  parcelas: number | null;
}

function formularioVazio(categoria: CategoriaDespesa | '' = ''): FormularioDespesa {
  return { categoria, nome: '', data: '', valor: null, formaPagamento: 'DINHEIRO', parcelas: null };
}

@Component({
  selector: 'app-despesas',
  imports: [FormsModule, CurrencyPipe, FiltroPeriodo],
  templateUrl: './despesas.html',
  styleUrl: './despesas.css',
})
export class Despesas {
  private readonly service = inject(DespesaService);
  private readonly filtro = viewChild.required(FiltroPeriodo);
  private periodo: Periodo = { inicio: null, fim: null, rotulo: '' };

  protected readonly categorias = CATEGORIAS;
  protected readonly formas = FORMAS_PAGAMENTO;
  protected readonly rotuloCategoria = rotuloCategoria;
  protected readonly rotuloForma = rotuloForma;
  protected readonly formatarData = formatarData;

  protected readonly despesas = signal<Despesa[]>([]);
  protected readonly resumo = signal<DespesaResumo | null>(null);
  protected readonly erro = signal('');
  protected readonly editandoId = signal<number | null>(null);
  /** Categoria selecionada nos botões; null = todas. */
  protected readonly categoriaAtual = signal<CategoriaDespesa | null>(null);
  protected form: FormularioDespesa = formularioVazio();

  protected readonly nomeCategoriaAtual = computed(() => {
    const c = this.categoriaAtual();
    return c ? rotuloCategoria(c) : 'Todas as categorias';
  });

  protected totalDe(categoria: CategoriaDespesa): number {
    return this.resumo()?.porCategoria.find((c) => c.categoria === categoria)?.total ?? 0;
  }

  protected aoMudarPeriodo(periodo: Periodo): void {
    this.periodo = periodo;
    this.cancelar();
    this.carregar();
  }

  protected selecionarCategoria(categoria: CategoriaDespesa | null): void {
    this.categoriaAtual.set(categoria);
    this.cancelar();
    this.carregar();
  }

  /** Sugestões de nome da categoria escolhida no formulário (ou da aba, se não houver). */
  protected sugestoesDoFormulario(): string[] {
    return this.itensDe(this.form.categoria || this.categoriaAtual());
  }

  protected get ehCartao(): boolean {
    return this.form.formaPagamento === 'CARTAO';
  }

  protected get valorParcelaPrevia(): number | null {
    const { valor, parcelas } = this.form;
    return this.ehCartao && valor && parcelas && parcelas > 0 ? Math.round((valor / parcelas) * 100) / 100 : null;
  }

  protected mudouForma(): void {
    if (this.ehCartao) {
      this.form.parcelas ??= 1;
    } else {
      this.form.parcelas = null;
    }
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
        // Se a despesa caiu fora do período exibido, o filtro muda para o dela e recarrega.
        if (!this.filtro().mostrarData(requisicao.data)) {
          this.carregar();
        }
      },
      error: (e: HttpErrorResponse) => this.erro.set(this.mensagemDeErro(e)),
    });
  }

  protected editar(d: Despesa): void {
    this.editandoId.set(d.id);
    this.erro.set('');
    this.form = {
      categoria: d.categoria,
      nome: d.nome,
      data: d.data,
      valor: d.valor,
      formaPagamento: d.formaPagamento,
      parcelas: d.parcelas,
    };
  }

  protected cancelar(): void {
    this.editandoId.set(null);
    this.erro.set('');
    this.form = formularioVazio(this.categoriaAtual() ?? '');
  }

  protected excluir(d: Despesa): void {
    if (!confirm(`Excluir a despesa "${d.nome}" de ${formatarData(d.data)}?`)) {
      return;
    }
    this.service.excluir(d.id).subscribe({
      next: () => {
        if (this.editandoId() === d.id) {
          this.cancelar();
        }
        this.carregar();
      },
      error: (e: HttpErrorResponse) => this.erro.set(this.mensagemDeErro(e)),
    });
  }

  private itensDe(categoria: CategoriaDespesa | null): string[] {
    return CATEGORIAS.find((c) => c.id === categoria)?.itens ?? [];
  }

  private carregar(): void {
    forkJoin({
      despesas: this.service.listar(this.categoriaAtual(), this.periodo),
      resumo: this.service.resumo(this.periodo),
    }).subscribe({
      next: ({ despesas, resumo }) => {
        this.despesas.set(despesas);
        this.resumo.set(resumo);
      },
      error: (e: HttpErrorResponse) => this.erro.set(this.mensagemDeErro(e)),
    });
  }

  private montarRequisicao(): DespesaRequest | null {
    const f = this.form;
    const nome = f.nome.trim();
    if (!f.categoria) {
      this.erro.set('Escolha a categoria da despesa.');
      return null;
    }
    if (!nome || !f.data) {
      this.erro.set('Preencha a data e o nome da despesa.');
      return null;
    }
    if (f.valor === null || f.valor <= 0) {
      this.erro.set('Informe um valor maior que zero.');
      return null;
    }
    if (f.formaPagamento === 'CARTAO' && (!f.parcelas || f.parcelas < 1 || f.parcelas > 60)) {
      this.erro.set('Informe em quantas parcelas o cartão foi dividido (1 a 60).');
      return null;
    }
    this.erro.set('');
    return {
      categoria: f.categoria,
      nome,
      data: f.data,
      valor: f.valor,
      formaPagamento: f.formaPagamento,
      parcelas: f.formaPagamento === 'CARTAO' ? f.parcelas : null,
    };
  }

  private mensagemDeErro(e: HttpErrorResponse): string {
    if (e.status === 0) {
      return 'Não foi possível conectar ao servidor (http://localhost:8080).';
    }
    const erros = e.error?.erros as Record<string, string> | undefined;
    if (erros) {
      return Object.values(erros).join(' ');
    }
    return e.error?.mensagem ?? e.error?.message ?? 'Erro inesperado.';
  }
}

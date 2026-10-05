import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';
import { AtualizacaoService, MSG_SEM_CONEXAO, definirSeMudou } from '../atualizacao.service';
import { Periodo, diaDaSemana, formatarData, formatarMinutos, hhmm, minutosEntre } from '../format';
import { FiltroPeriodo } from '../filtro-periodo/filtro-periodo';
import { Registro, RegistroRequest, Resumo } from '../models';
import { RegistroService } from '../registro.service';

interface FormularioRegistro {
  data: string;
  horaInicialVagner: string;
  horaFinalVagner: string;
  horaInicialFilipe: string;
  horaFinalFilipe: string;
  kmInicial: number | null;
  kmFinal: number | null;
  cargaPostoVagner: number | null;
  cargaPostoFilipe: number | null;
  valorVagner: number | null;
  valorFilipe: number | null;
}

function formularioVazio(): FormularioRegistro {
  return {
    data: '',
    horaInicialVagner: '',
    horaFinalVagner: '',
    horaInicialFilipe: '',
    horaFinalFilipe: '',
    kmInicial: null,
    kmFinal: null,
    cargaPostoVagner: null,
    cargaPostoFilipe: null,
    valorVagner: null,
    valorFilipe: null,
  };
}

@Component({
  selector: 'app-planilha-uber',
  imports: [FormsModule, CurrencyPipe, FiltroPeriodo],
  templateUrl: './planilha-uber.html',
  styleUrl: './planilha-uber.css',
})
export class PlanilhaUber {
  private readonly service = inject(RegistroService);
  private readonly atualizacao = inject(AtualizacaoService);
  private carga?: Subscription;

  constructor() {
    this.atualizacao.pedido$.pipe(takeUntilDestroyed()).subscribe(() => this.carregar(true));
  }

  protected readonly registros = signal<Registro[]>([]);
  protected readonly resumo = signal<Resumo | null>(null);
  protected readonly erro = signal('');
  protected readonly editandoId = signal<number | null>(null);
  private readonly filtro = viewChild.required(FiltroPeriodo);
  private periodo: Periodo = { inicio: null, fim: null, rotulo: '' };
  protected form: FormularioRegistro = formularioVazio();

  protected readonly formatarMinutos = formatarMinutos;
  protected readonly formatarData = formatarData;
  protected readonly hhmm = hhmm;

  /** "Segunda-feira" -> "Seg" */
  protected abreviar(dia: string): string {
    return dia.slice(0, 3);
  }

  // Pré-visualização dos campos calculados (o backend recalcula ao salvar).
  protected get diaSemanaPrevia(): string {
    return diaDaSemana(this.form.data);
  }

  protected get minutosVagnerPrevia(): number {
    return minutosEntre(this.form.horaInicialVagner, this.form.horaFinalVagner);
  }

  protected get minutosFilipePrevia(): number {
    return minutosEntre(this.form.horaInicialFilipe, this.form.horaFinalFilipe);
  }

  /** Em branco enquanto faltar o Km inicial ou o final. */
  protected get totalKmPrevia(): number | null {
    const { kmInicial, kmFinal } = this.form;
    return kmInicial === null || kmFinal === null ? null : kmFinal - kmInicial;
  }

  protected get liquidoVagnerPrevia(): number {
    return (this.form.valorVagner ?? 0) - (this.form.cargaPostoVagner ?? 0);
  }

  protected get liquidoFilipePrevia(): number {
    return (this.form.valorFilipe ?? 0) - (this.form.cargaPostoFilipe ?? 0);
  }

  protected aoMudarPeriodo(periodo: Periodo): void {
    this.periodo = periodo;
    this.cancelar();
    this.carregar();
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
        // Se o lançamento caiu fora do período exibido, o filtro muda para o dele e recarrega.
        if (!this.filtro().mostrarData(requisicao.data)) {
          this.carregar();
        }
      },
      error: (e: HttpErrorResponse) => this.erro.set(this.mensagemDeErro(e)),
    });
  }

  protected editar(r: Registro): void {
    this.editandoId.set(r.id);
    this.erro.set('');
    this.form = {
      data: r.data,
      horaInicialVagner: hhmm(r.horaInicialVagner),
      horaFinalVagner: hhmm(r.horaFinalVagner),
      horaInicialFilipe: hhmm(r.horaInicialFilipe),
      horaFinalFilipe: hhmm(r.horaFinalFilipe),
      kmInicial: r.kmInicial,
      kmFinal: r.kmFinal,
      cargaPostoVagner: r.cargaPostoVagner,
      cargaPostoFilipe: r.cargaPostoFilipe,
      valorVagner: r.valorVagner,
      valorFilipe: r.valorFilipe,
    };
  }

  protected cancelar(): void {
    this.editandoId.set(null);
    this.erro.set('');
    this.form = formularioVazio();
  }

  protected excluir(r: Registro): void {
    if (!confirm(`Excluir o lançamento de ${formatarData(r.data)}?`)) {
      return;
    }
    this.service.excluir(r.id).subscribe({
      next: () => {
        if (this.editandoId() === r.id) {
          this.cancelar();
        }
        this.carregar();
      },
      error: (e: HttpErrorResponse) => this.erro.set(this.mensagemDeErro(e)),
    });
  }

  /** `silencioso`: atualização automática; não mostra erros passageiros e não mexe no formulário. */
  private carregar(silencioso = false): void {
    const periodo = this.periodo;
    this.carga?.unsubscribe(); // uma consulta antiga não pode sobrescrever uma mais nova
    this.carga = forkJoin({ registros: this.service.listar(periodo), resumo: this.service.resumo(periodo) }).subscribe({
      next: ({ registros, resumo }) => {
        definirSeMudou(this.registros, registros);
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

  private montarRequisicao(): RegistroRequest | null {
    const f = this.form;
    if (!f.data) {
      this.erro.set('Preencha a data.');
      return null;
    }
    if ((f.kmInicial ?? 0) < 0 || (f.kmFinal ?? 0) < 0) {
      this.erro.set('Km não pode ser negativo.');
      return null;
    }
    // Km é opcional; só confere a ordem quando os dois foram informados.
    if (f.kmInicial !== null && f.kmFinal !== null && f.kmFinal < f.kmInicial) {
      this.erro.set('Km final não pode ser menor que o Km inicial.');
      return null;
    }
    if (!!f.horaInicialVagner !== !!f.horaFinalVagner || !!f.horaInicialFilipe !== !!f.horaFinalFilipe) {
      this.erro.set('Informe hora inicial e final de cada pessoa (ou deixe as duas em branco).');
      return null;
    }
    const valores = [f.cargaPostoVagner ?? 0, f.cargaPostoFilipe ?? 0, f.valorVagner ?? 0, f.valorFilipe ?? 0];
    if (valores.some((v) => v < 0)) {
      this.erro.set('Valores em R$ não podem ser negativos.');
      return null;
    }
    this.erro.set('');
    return {
      data: f.data,
      horaInicialVagner: f.horaInicialVagner || null,
      horaFinalVagner: f.horaFinalVagner || null,
      horaInicialFilipe: f.horaInicialFilipe || null,
      horaFinalFilipe: f.horaFinalFilipe || null,
      kmInicial: f.kmInicial,
      kmFinal: f.kmFinal,
      cargaPostoVagner: valores[0],
      cargaPostoFilipe: valores[1],
      valorVagner: valores[2],
      valorFilipe: valores[3],
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

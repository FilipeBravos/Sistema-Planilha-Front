import { CurrencyPipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { AtualizacaoService, MSG_SEM_CONEXAO, definirSeMudou } from '../atualizacao.service';
import { rotuloCategoria } from '../despesas/despesas-catalogo';
import { FiltrosService } from '../filtros.service';
import { MesRelatorio, Relatorio } from '../models';
import { RelatorioService } from '../relatorio.service';
import { ALTURA, LARGURA, graficoReceitaSaidas, graficoResultado, rotuloMesCurto, rotuloMesLongo } from './geometria';
import { MESES_DO_ANO, Preset, anosDisponiveis, intervaloDoPreset, limitesEmIso, validarIntervalo } from './intervalo';

type IdGrafico = 'saidas' | 'resultado';

interface Dica {
  grafico: IdGrafico;
  indice: number;
  x: number;
  y: number;
  largura: number;
}

const PRESETS: { id: Preset; rotulo: string }[] = [
  { id: 3, rotulo: '3 meses' },
  { id: 6, rotulo: '6 meses' },
  { id: 12, rotulo: '12 meses' },
  { id: 'ano', rotulo: 'Ano atual' },
];

@Component({
  selector: 'app-relatorios',
  imports: [CurrencyPipe, DecimalPipe, NgTemplateOutlet, FormsModule],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.css',
})
export class Relatorios implements OnInit {
  private readonly service = inject(RelatorioService);
  private readonly atualizacao = inject(AtualizacaoService);
  private readonly filtros = inject(FiltrosService);
  private carga?: Subscription;

  protected readonly presets = PRESETS;
  protected readonly meses = MESES_DO_ANO;
  protected readonly anos = anosDisponiveis(new Date());
  protected readonly largura = LARGURA;
  protected readonly altura = ALTURA;
  protected readonly rotuloCategoria = rotuloCategoria;
  protected readonly rotuloMesCurto = rotuloMesCurto;
  protected readonly rotuloMesLongo = rotuloMesLongo;

  /** Intervalo escolhido; fica guardado ao trocar de aba. */
  protected readonly intervalo = this.filtros.relatorio;
  protected readonly erroIntervalo = signal('');
  protected readonly relatorio = signal<Relatorio | null>(null);
  protected readonly carregando = signal(false);
  protected readonly erro = signal('');
  protected readonly dica = signal<Dica | null>(null);

  protected readonly graficoSaidas = computed(() => {
    const r = this.relatorio();
    return r ? graficoReceitaSaidas(r.meses) : null;
  });
  protected readonly graficoResultado = computed(() => {
    const r = this.relatorio();
    return r ? graficoResultado(r.meses) : null;
  });
  protected readonly mesDaDica = computed<MesRelatorio | null>(() => {
    const d = this.dica();
    return d ? (this.relatorio()?.meses[d.indice] ?? null) : null;
  });
  protected readonly semDados = computed(() => {
    const t = this.relatorio()?.totais;
    return !!t && t.faturamentoBruto === 0 && t.despesas === 0 && t.parcelasEmprestimos === 0;
  });
  /** Despesas como percentual da receita líquida do período (null se não houve receita). */
  protected readonly percentualDaReceita = computed(() => {
    const t = this.relatorio()?.totais;
    return t && t.faturamentoLiquido > 0 ? Math.round((t.despesas / t.faturamentoLiquido) * 100) : null;
  });
  protected readonly maiorCategoria = computed(() => this.relatorio()?.despesasPorCategoria[0] ?? null);
  protected readonly maiorItem = computed(() => this.relatorio()?.maioresDespesas[0] ?? null);

  constructor() {
    this.atualizacao.pedido$.pipe(takeUntilDestroyed()).subscribe(() => this.carregar(true));
  }

  ngOnInit(): void {
    this.carregar();
  }

  protected selecionar(preset: Preset): void {
    this.intervalo.set(intervaloDoPreset(preset, new Date()));
    this.erroIntervalo.set('');
    this.carregar();
  }

  protected mudarMesInicial(mes: string): void {
    this.escolher(`${this.intervalo().inicio.slice(0, 4)}-${mes}`, this.intervalo().fim);
  }

  protected mudarAnoInicial(ano: string): void {
    this.escolher(`${ano}-${this.intervalo().inicio.slice(5)}`, this.intervalo().fim);
  }

  protected mudarMesFinal(mes: string): void {
    this.escolher(this.intervalo().inicio, `${this.intervalo().fim.slice(0, 4)}-${mes}`);
  }

  protected mudarAnoFinal(ano: string): void {
    this.escolher(this.intervalo().inicio, `${ano}-${this.intervalo().fim.slice(5)}`);
  }

  /** Mês inicial/final escolhidos à mão: mostra o problema (se houver) e só consulta quando o intervalo é válido. */
  private escolher(inicio: string, fim: string): void {
    this.intervalo.set({ preset: 'personalizado', inicio, fim });
    const problema = validarIntervalo(inicio, fim);
    this.erroIntervalo.set(problema ?? '');
    if (!problema) {
      this.carregar();
    }
  }

  /** Largura da barra (0–100) em relação ao maior valor da lista. */
  protected largura100(valor: number, maior: number): number {
    return maior > 0 ? Math.max((valor / maior) * 100, 1.5) : 0;
  }

  protected mostrar(evento: PointerEvent, grafico: IdGrafico, indice: number): void {
    const caixa = this.caixaDe(evento.currentTarget as Element);
    this.dica.set({ grafico, indice, x: evento.clientX - caixa.left, y: evento.clientY - caixa.top, largura: caixa.width });
  }

  protected focar(evento: FocusEvent, grafico: IdGrafico, indice: number): void {
    const alvo = (evento.currentTarget as Element).getBoundingClientRect();
    const caixa = this.caixaDe(evento.currentTarget as Element);
    this.dica.set({
      grafico,
      indice,
      x: alvo.left + alvo.width / 2 - caixa.left,
      y: alvo.top - caixa.top + 40,
      largura: caixa.width,
    });
  }

  protected esconder(): void {
    this.dica.set(null);
  }

  /** Posição horizontal do balão, sem sair da área do gráfico. */
  protected esquerdaDaDica(d: Dica): number {
    return Math.min(Math.max(d.x, 120), Math.max(d.largura - 120, 120));
  }

  private caixaDe(elemento: Element): DOMRect {
    return (elemento.closest('.grafico') as HTMLElement).getBoundingClientRect();
  }

  /** `silencioso`: atualização automática; não escurece a tela, não fecha o balão e não mostra erros passageiros. */
  private carregar(silencioso = false): void {
    const atual = this.intervalo();
    if (validarIntervalo(atual.inicio, atual.fim)) {
      return; // intervalo inválido: mantém o que já está na tela
    }
    const { inicio, fim } = limitesEmIso(atual.inicio, atual.fim);
    if (!silencioso) {
      this.carregando.set(true);
      this.dica.set(null);
    }
    this.carga?.unsubscribe(); // uma consulta antiga não pode sobrescrever uma mais nova
    this.carga = this.service.dashboard(inicio, fim).subscribe({
      next: (r) => {
        definirSeMudou(this.relatorio, r);
        this.erro.set('');
        this.carregando.set(false);
        this.atualizacao.registrar();
      },
      error: (e: HttpErrorResponse) => {
        if (!silencioso) {
          this.erro.set(e.status === 0 ? MSG_SEM_CONEXAO : (e.error?.mensagem ?? e.error?.message ?? 'Erro inesperado.'));
          this.carregando.set(false);
        }
      },
    });
  }
}

import { CurrencyPipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { rotuloCategoria } from '../despesas/despesas-catalogo';
import { paraIso } from '../format';
import { MesRelatorio, Relatorio } from '../models';
import { RelatorioService } from '../relatorio.service';
import { ALTURA, LARGURA, graficoReceitaSaidas, graficoResultado, rotuloMesCurto, rotuloMesLongo } from './geometria';

type Preset = 3 | 6 | 12 | 'ano';
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

/** Meses completos terminando no mês atual (o backend ajusta para o 1º e o último dia). */
function intervaloDe(preset: Preset): { inicio: string; fim: string } {
  const hoje = new Date();
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  const inicio = preset === 'ano' ? new Date(hoje.getFullYear(), 0, 1) : new Date(hoje.getFullYear(), hoje.getMonth() - (preset - 1), 1);
  return { inicio: paraIso(inicio), fim: paraIso(fim) };
}

@Component({
  selector: 'app-relatorios',
  imports: [CurrencyPipe, DecimalPipe, NgTemplateOutlet],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.css',
})
export class Relatorios implements OnInit {
  private readonly service = inject(RelatorioService);

  protected readonly presets = PRESETS;
  protected readonly largura = LARGURA;
  protected readonly altura = ALTURA;
  protected readonly rotuloCategoria = rotuloCategoria;
  protected readonly rotuloMesCurto = rotuloMesCurto;
  protected readonly rotuloMesLongo = rotuloMesLongo;

  protected readonly preset = signal<Preset>(12);
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

  ngOnInit(): void {
    this.carregar();
  }

  protected selecionar(preset: Preset): void {
    this.preset.set(preset);
    this.carregar();
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

  private carregar(): void {
    const { inicio, fim } = intervaloDe(this.preset());
    this.carregando.set(true);
    this.dica.set(null);
    this.service.dashboard(inicio, fim).subscribe({
      next: (r) => {
        this.relatorio.set(r);
        this.erro.set('');
        this.carregando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.erro.set(
          e.status === 0 ? 'Não foi possível conectar ao servidor (http://localhost:8080).' : (e.error?.mensagem ?? e.error?.message ?? 'Erro inesperado.'),
        );
        this.carregando.set(false);
      },
    });
  }
}

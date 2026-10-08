import { diaDaSemana, formatarData, formatarMinutos, minutosEntre } from '../format';

describe('format', () => {
  it('formata minutos em horas', () => {
    expect(formatarMinutos(570)).toBe('9h30');
    expect(formatarMinutos(5)).toBe('0h05');
  });

  it('calcula minutos entre horas, inclusive virando a meia-noite', () => {
    expect(minutosEntre('08:00', '17:30')).toBe(570);
    expect(minutosEntre('22:00', '02:30')).toBe(270);
    expect(minutosEntre('', '02:30')).toBe(0);
  });

  it('calcula o dia da semana sem depender de fuso', () => {
    expect(diaDaSemana('2026-09-28')).toBe('Segunda-feira');
    expect(diaDaSemana('')).toBe('');
  });

  it('formata data ISO', () => {
    expect(formatarData('2026-09-28')).toBe('28/09/2026');
  });
});

import { calcularPeriodo, deslocar, deIso } from '../format';

describe('período', () => {
  it('semana vai de segunda a domingo', () => {
    // 30/09/2026 é quarta-feira
    const p = calcularPeriodo('semana', deIso('2026-09-30'));
    expect(p.inicio).toBe('2026-09-28');
    expect(p.fim).toBe('2026-10-04');
    expect(p.rotulo).toBe('28/09 a 04/10/2026');
  });

  it('domingo pertence à semana que começou na segunda anterior', () => {
    const p = calcularPeriodo('semana', deIso('2026-10-04'));
    expect(p.inicio).toBe('2026-09-28');
  });

  it('mês cobre do dia 1 ao último dia', () => {
    const p = calcularPeriodo('mes', deIso('2026-02-10'));
    expect(p.inicio).toBe('2026-02-01');
    expect(p.fim).toBe('2026-02-28');
    expect(p.rotulo).toBe('Fevereiro de 2026');
  });

  it('tudo não tem limites', () => {
    const p = calcularPeriodo('tudo', new Date());
    expect(p.inicio).toBeNull();
    expect(p.fim).toBeNull();
  });

  it('desloca semana e mês', () => {
    expect(calcularPeriodo('semana', deslocar('semana', deIso('2026-09-30'), 1)).inicio).toBe('2026-10-05');
    expect(calcularPeriodo('mes', deslocar('mes', deIso('2026-01-31'), 1)).inicio).toBe('2026-02-01');
    expect(calcularPeriodo('mes', deslocar('mes', deIso('2026-01-15'), -1)).inicio).toBe('2025-12-01');
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PlanilhaUber } from './planilha-uber';

describe('Uber: Km em branco', () => {
  let http: HttpTestingController;
  let componente: any;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(PlanilhaUber);
    componente = fixture.componentInstance;
    fixture.detectChanges(); // o filtro de período emite e a tela busca os dados
    http.match((r) => r.url.endsWith('/registros') || r.url.endsWith('/resumo')).forEach((r) => r.flush(r.request.url.endsWith('/resumo') ? null : []));
  });

  type Km = { iniV?: number | null; fimV?: number | null; iniF?: number | null; fimF?: number | null };

  function preencher(km: Km): void {
    componente.form = {
      ...componente.form,
      data: '2026-10-01',
      kmInicialVagner: km.iniV ?? null,
      kmFinalVagner: km.fimV ?? null,
      kmInicialFilipe: km.iniF ?? null,
      kmFinalFilipe: km.fimF ?? null,
    };
  }

  it('o total de Km de cada pessoa fica em branco enquanto faltar um dos Km dela', () => {
    preencher({});
    expect(componente.totalKmVagnerPrevia).toBeNull();
    expect(componente.totalKmFilipePrevia).toBeNull();
    expect(componente.totalKmPrevia).toBe(0);
    preencher({ iniV: 100, iniF: 10 });
    expect(componente.totalKmVagnerPrevia).toBeNull();
    preencher({ iniV: 100, fimV: 160 });
    expect(componente.totalKmVagnerPrevia).toBe(60);
    expect(componente.totalKmFilipePrevia).toBeNull();
    expect(componente.totalKmPrevia).toBe(60);
  });

  it('o total do dia soma o Km do Vagner com o do Filipe', () => {
    preencher({ iniV: 100, fimV: 160, iniF: 500, fimF: 530 });
    expect(componente.totalKmVagnerPrevia).toBe(60);
    expect(componente.totalKmFilipePrevia).toBe(30);
    expect(componente.totalKmPrevia).toBe(90);
  });

  it('salva sem Km, enviando em branco (null)', () => {
    preencher({});
    componente.salvar();

    const req = http.expectOne((r) => r.method === 'POST' && r.url.endsWith('/registros'));
    expect(req.request.body.kmInicialVagner).toBeNull();
    expect(req.request.body.kmFinalVagner).toBeNull();
    expect(req.request.body.kmInicialFilipe).toBeNull();
    expect(req.request.body.kmFinalFilipe).toBeNull();
    expect(componente.erro()).toBe('');
    req.flush({});
    http.match(() => true).forEach((r) => r.flush([]));
  });

  it('continua recusando Km final menor que o inicial (por pessoa) e Km negativo', () => {
    preencher({ iniV: 200, fimV: 100 });
    componente.salvar();
    expect(componente.erro()).toContain('do Vagner');
    http.expectNone((r) => r.method === 'POST');

    preencher({ iniF: 200, fimF: 100 });
    componente.salvar();
    expect(componente.erro()).toContain('do Filipe');
    http.expectNone((r) => r.method === 'POST');

    preencher({ iniF: -5 });
    componente.salvar();
    expect(componente.erro()).toContain('negativo');
    http.expectNone((r) => r.method === 'POST');
  });
});

import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { sessaoInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('autenticação', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  let cliente: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([sessaoInterceptor])), provideHttpClientTesting()],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    cliente = TestBed.inject(HttpClient);
  });

  afterEach(() => http.verify());

  it('ao abrir, usa a sessão existente', () => {
    auth.iniciar();
    http.expectOne('/api/auth/eu').flush({ usuario: 'filipe' });
    expect(auth.usuario()).toBe('filipe');
    expect(auth.verificando()).toBeFalse();
  });

  it('sem sessão, fica deslogado', () => {
    auth.iniciar();
    http.expectOne('/api/auth/eu').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.usuario()).toBeNull();
    expect(auth.verificando()).toBeFalse();
  });

  it('entrar guarda o usuário e sair limpa', () => {
    auth.entrar('filipe', 'senha-forte-1').subscribe();
    const req = http.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ usuario: 'filipe', senha: 'senha-forte-1' });
    req.flush({ usuario: 'filipe' });
    expect(auth.usuario()).toBe('filipe');

    auth.sair();
    http.expectOne('/api/auth/logout').flush(null);
    expect(auth.usuario()).toBeNull();
  });

  it('se o login voltar 403 (token anti-CSRF ausente), renova o token e tenta de novo uma vez', () => {
    let resposta: { usuario: string } | undefined;
    auth.entrar('filipe', 'senha-forte-1').subscribe((r) => (resposta = r));

    http.expectOne('/api/auth/login').flush({}, { status: 403, statusText: 'Forbidden' });
    http.expectOne('/api/auth/eu').flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne('/api/auth/login').flush({ usuario: 'filipe' });

    expect(resposta).toEqual({ usuario: 'filipe' });
    expect(auth.usuario()).toBe('filipe');
  });

  it('um 401 em chamada de dados derruba a sessão, mas o 401 do login não', () => {
    auth.usuario.set('filipe');
    cliente.get('/api/despesas').subscribe({ error: () => undefined });
    http.expectOne('/api/despesas').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.usuario()).toBeNull();

    auth.usuario.set('filipe');
    auth.entrar('x', 'y').subscribe({ error: () => undefined });
    http.expectOne('/api/auth/login').flush({ mensagem: 'inválido' }, { status: 401, statusText: 'Unauthorized' });
    expect(auth.usuario()).toBe('filipe');
  });
});

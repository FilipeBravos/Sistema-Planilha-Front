import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { sessaoInterceptor } from './auth/auth.interceptor';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // O token CSRF (cookie XSRF-TOKEN -> cabeçalho X-XSRF-TOKEN) é tratado pelo próprio HttpClient.
    provideHttpClient(withInterceptors([sessaoInterceptor])),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ]
};

/**
 * Endereço da API, sempre relativo ao site: em desenvolvimento o `ng serve` repassa /api ao backend
 * (proxy.conf.json) e em produção o Caddy faz o mesmo (Caddyfile). Assim o login por cookie funciona
 * sem CORS.
 */
export const API_URL = '/api';

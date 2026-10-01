# Site: compila o Angular e serve os arquivos com o Caddy, que também repassa /api ao backend.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist/planilha/browser /srv
EXPOSE 80 443

FROM node:22-alpine AS builder

WORKDIR /src
COPY opsradar-web/package*.json ./
RUN npm ci

COPY opsradar-web/ ./
RUN npm run build

FROM nginx:1.27-alpine

COPY opsradar-web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /src/dist /usr/share/nginx/html

EXPOSE 80

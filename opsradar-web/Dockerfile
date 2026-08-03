ARG NODE_IMAGE=node:22-alpine
ARG NGINX_IMAGE=nginx:1.27-alpine

FROM ${NODE_IMAGE} AS builder

WORKDIR /src
COPY opsradar-web/package*.json ./
RUN npm config set registry https://registry.npmmirror.com \
    && npm ci

COPY opsradar-web/ ./
RUN npm run build

FROM ${NGINX_IMAGE}

RUN sed -i 's#https://dl-cdn.alpinelinux.org/alpine#https://mirrors.aliyun.com/alpine#g' /etc/apk/repositories \
    && apk add --no-cache curl
COPY opsradar-web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /src/dist /usr/share/nginx/html

EXPOSE 80

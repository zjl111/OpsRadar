ARG GOLANG_IMAGE=golang:1.24-alpine
ARG ALPINE_IMAGE=alpine:3.21

FROM ${GOLANG_IMAGE} AS builder

WORKDIR /src
ENV GOWORK=off \
    GOPROXY=https://goproxy.cn,direct

COPY opsradar-api/go.mod opsradar-api/go.sum ./
RUN go mod download

COPY opsradar-api/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/opsradar-api ./cmd/api

FROM ${ALPINE_IMAGE}

RUN sed -i 's#https://dl-cdn.alpinelinux.org/alpine#https://mirrors.aliyun.com/alpine#g' /etc/apk/repositories \
    && apk add --no-cache curl \
    && adduser -D -H opsradar \
    && mkdir -p /app/reports \
    && chown opsradar:opsradar /app/reports
USER opsradar
WORKDIR /app

COPY --from=builder /out/opsradar-api /app/opsradar-api

EXPOSE 8080
ENTRYPOINT ["/app/opsradar-api"]

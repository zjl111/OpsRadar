FROM golang:1.24-alpine AS builder

WORKDIR /src
ENV GOWORK=off

COPY opsradar-api/go.mod opsradar-api/go.sum ./
RUN go mod download

COPY opsradar-api/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/opsradar-api ./cmd/api

FROM alpine:3.21

RUN apk add --no-cache curl && adduser -D -H opsradar
USER opsradar
WORKDIR /app

COPY --from=builder /out/opsradar-api /app/opsradar-api

EXPOSE 8080
ENTRYPOINT ["/app/opsradar-api"]

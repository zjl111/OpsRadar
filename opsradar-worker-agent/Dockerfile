FROM golang:1.24-alpine AS builder

WORKDIR /src
ENV GOWORK=off

COPY opsradar-worker-agent/go.mod opsradar-worker-agent/go.sum ./
RUN go mod download

COPY opsradar-worker-agent/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/opsradar-worker-agent ./cmd/worker

FROM alpine:3.21

USER root
RUN apk add --no-cache ansible openssh-client python3 py3-pip py3-virtualenv \
    && python3 -m venv /opt/ansible-runner \
    && /opt/ansible-runner/bin/pip install --no-cache-dir ansible-runner \
    && ln -s /opt/ansible-runner/bin/ansible-runner /usr/local/bin/ansible-runner \
    && adduser -D -H opsradar
USER opsradar
WORKDIR /app

COPY --from=builder /out/opsradar-worker-agent /app/opsradar-worker-agent

ENTRYPOINT ["/app/opsradar-worker-agent"]

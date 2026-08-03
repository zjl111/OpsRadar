ARG GOLANG_IMAGE=golang:1.24-alpine
ARG ALPINE_IMAGE=alpine:3.21

FROM ${GOLANG_IMAGE} AS builder

WORKDIR /src
ENV GOWORK=off \
    GOPROXY=https://goproxy.cn,direct

COPY opsradar-worker-agent/go.mod opsradar-worker-agent/go.sum ./
RUN go mod download

COPY opsradar-worker-agent/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/opsradar-worker-agent ./cmd/worker

FROM ${ALPINE_IMAGE}

USER root
RUN sed -i 's#https://dl-cdn.alpinelinux.org/alpine#https://mirrors.aliyun.com/alpine#g' /etc/apk/repositories \
    && apk add --no-cache ansible curl openssh-client python3 py3-pip py3-virtualenv \
    && python3 -m venv /opt/ansible-runner \
    && /opt/ansible-runner/bin/pip install --no-cache-dir --index-url https://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com ansible-runner \
    && ln -s /opt/ansible-runner/bin/ansible-runner /usr/local/bin/ansible-runner \
    && adduser -D -H opsradar
USER opsradar
WORKDIR /app

COPY --from=builder /out/opsradar-worker-agent /app/opsradar-worker-agent

ENTRYPOINT ["/app/opsradar-worker-agent"]

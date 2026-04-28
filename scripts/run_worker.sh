#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

export OPSRADAR_SECRET_KEY="${OPSRADAR_SECRET_KEY:-dev-only-change-me}"
export OPSRADAR_ENCRYPTION_KEY="${OPSRADAR_ENCRYPTION_KEY:-dev-only-change-this-opsradar-encryption-key}"
export OPSRADAR_DATABASE_URL="${OPSRADAR_DATABASE_URL:-postgresql+psycopg://postgres:postgres@127.0.0.1:5432/postgres}"
export OPSRADAR_REDIS_URL="${OPSRADAR_REDIS_URL:-redis://127.0.0.1:6379/0}"
export OPSRADAR_CELERY_BROKER_URL="${OPSRADAR_CELERY_BROKER_URL:-$OPSRADAR_REDIS_URL}"
export OPSRADAR_CELERY_RESULT_BACKEND="${OPSRADAR_CELERY_RESULT_BACKEND:-redis://127.0.0.1:6379/1}"
export OPSRADAR_WORKER_CONCURRENCY="${OPSRADAR_WORKER_CONCURRENCY:-2}"

exec celery -A backend.app.worker.celery_app worker --loglevel="${CELERY_LOGLEVEL:-info}" --concurrency="$OPSRADAR_WORKER_CONCURRENCY"

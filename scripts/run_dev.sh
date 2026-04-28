#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

export OPSRADAR_SECRET_KEY="${OPSRADAR_SECRET_KEY:-dev-only-change-me}"
export OPSRADAR_ENCRYPTION_KEY="${OPSRADAR_ENCRYPTION_KEY:-dev-only-change-this-opsradar-encryption-key}"
export OPSRADAR_DATABASE_URL="${OPSRADAR_DATABASE_URL:-postgresql+psycopg://postgres:postgres@127.0.0.1:5432/postgres}"
export OPSRADAR_REDIS_URL="${OPSRADAR_REDIS_URL:-redis://127.0.0.1:6379/0}"
export OPSRADAR_CELERY_BROKER_URL="${OPSRADAR_CELERY_BROKER_URL:-$OPSRADAR_REDIS_URL}"
export OPSRADAR_CELERY_RESULT_BACKEND="${OPSRADAR_CELERY_RESULT_BACKEND:-redis://127.0.0.1:6379/1}"
export OPSRADAR_REPORT_DIR="${OPSRADAR_REPORT_DIR:-$(pwd)/reports}"

mkdir -p "$OPSRADAR_REPORT_DIR"

python3 -m backend.app.cli migrate
python3 -m backend.app.cli seed-builtin

exec uvicorn backend.app.main:app --host "${HOST:-127.0.0.1}" --port "${PORT:-4173}" --reload

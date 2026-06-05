#!/usr/bin/env bash
set -euo pipefail

DB_NAME="${POSTGRES_DB:-opsradar}"
POSTGRES_HOST="${POSTGRES_HOST:-127.0.0.1}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-postgres}"

if command -v psql >/dev/null 2>&1 && command -v createdb >/dev/null 2>&1; then
  PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$POSTGRES_HOST" \
    -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" \
    -d postgres \
    -tc "select 1 from pg_database where datname = '$DB_NAME'" \
    | grep -q 1 \
    || PGPASSWORD="$POSTGRES_PASSWORD" createdb \
      -h "$POSTGRES_HOST" \
      -p "$POSTGRES_PORT" \
      -U "$POSTGRES_USER" \
      "$DB_NAME"
else
  docker exec "$POSTGRES_CONTAINER" psql \
    -U "$POSTGRES_USER" \
    -d postgres \
    -tc "select 1 from pg_database where datname = '$DB_NAME'" \
    | grep -q 1 \
    || docker exec "$POSTGRES_CONTAINER" createdb \
      -U "$POSTGRES_USER" \
      "$DB_NAME"
fi

echo "database ready: $DB_NAME"

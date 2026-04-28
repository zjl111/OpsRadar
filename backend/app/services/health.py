from __future__ import annotations

from sqlalchemy import text

from backend.app.core.config import DEFAULT_DEV_ENCRYPTION_KEY, settings
from backend.app.db.session import engine


def verify_postgres() -> None:
    try:
        with engine.connect() as conn:
            conn.execute(text("select 1"))
    except Exception as exc:  # pragma: no cover - startup safety path
        raise RuntimeError(f"PostgreSQL is not reachable via OPSRADAR_DATABASE_URL: {exc}") from exc


def verify_redis() -> None:
    try:
        from redis import Redis

        client = Redis.from_url(settings.redis_url, socket_connect_timeout=2, socket_timeout=2)
        client.ping()
        client.close()
    except Exception as exc:  # pragma: no cover - startup safety path
        raise RuntimeError(f"Redis is not reachable via OPSRADAR_REDIS_URL: {exc}") from exc


def verify_encryption_config() -> None:
    if not settings.encryption_key:
        raise RuntimeError("OPSRADAR_ENCRYPTION_KEY is required.")
    if settings.environment == "production" and settings.encryption_key == DEFAULT_DEV_ENCRYPTION_KEY:
        raise RuntimeError("OPSRADAR_ENCRYPTION_KEY must be changed in production.")


def verify_external_services() -> None:
    verify_encryption_config()
    verify_postgres()
    verify_redis()

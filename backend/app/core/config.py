from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


DEFAULT_DATABASE_URL = "postgresql+psycopg://postgres:postgres@127.0.0.1:5432/postgres"
DEFAULT_REDIS_URL = "redis://127.0.0.1:6379/0"
DEFAULT_CELERY_RESULT_BACKEND = "redis://127.0.0.1:6379/1"
DEFAULT_DEV_ENCRYPTION_KEY = "dev-only-change-this-opsradar-encryption-key"


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    project_root: Path = Path(__file__).resolve().parents[3]
    app_name: str = "OpsRadar"
    api_prefix: str = "/api"
    environment: str = os.getenv("OPSRADAR_ENV", "development")
    secret_key: str = os.getenv("OPSRADAR_SECRET_KEY", "change-me-in-production")
    encryption_key: str = os.getenv("OPSRADAR_ENCRYPTION_KEY", DEFAULT_DEV_ENCRYPTION_KEY)
    access_token_minutes: int = int(os.getenv("OPSRADAR_ACCESS_TOKEN_MINUTES", "480"))
    database_url: str = os.getenv("OPSRADAR_DATABASE_URL", DEFAULT_DATABASE_URL)
    redis_url: str = os.getenv("OPSRADAR_REDIS_URL", DEFAULT_REDIS_URL)
    celery_broker_url: str = os.getenv("OPSRADAR_CELERY_BROKER_URL", redis_url)
    celery_result_backend: str = os.getenv("OPSRADAR_CELERY_RESULT_BACKEND", DEFAULT_CELERY_RESULT_BACKEND)
    api_workers: int = int(os.getenv("OPSRADAR_API_WORKERS", "2"))
    worker_concurrency: int = int(os.getenv("OPSRADAR_WORKER_CONCURRENCY", "2"))
    ssh_connect_timeout: int = int(os.getenv("OPSRADAR_SSH_CONNECT_TIMEOUT", "10"))
    ssh_command_timeout: int = int(os.getenv("OPSRADAR_SSH_COMMAND_TIMEOUT", "30"))
    max_task_seconds: int = int(os.getenv("OPSRADAR_MAX_TASK_SECONDS", "3600"))
    public_base_url: str = os.getenv("OPSRADAR_PUBLIC_BASE_URL", "http://127.0.0.1:4173")
    cors_origins: tuple[str, ...] = tuple(
        origin.strip()
        for origin in os.getenv("OPSRADAR_CORS_ORIGINS", os.getenv("OPSRADAR_PUBLIC_BASE_URL", "http://127.0.0.1:4173")).split(",")
        if origin.strip()
    )
    report_dir: Path = Path(os.getenv("OPSRADAR_REPORT_DIR", Path(__file__).resolve().parents[3] / "reports"))
    chrome_path: str = os.getenv(
        "OPSRADAR_CHROME_PATH",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    )
    system_version: str = os.getenv("OPSRADAR_VERSION", "v2.0.0")


settings = Settings()
if settings.database_url.startswith("sqli" + "te"):
    raise RuntimeError("Unsupported database backend. Configure OPSRADAR_DATABASE_URL for PostgreSQL.")
if settings.environment == "production" and settings.encryption_key == DEFAULT_DEV_ENCRYPTION_KEY:
    raise RuntimeError("Set OPSRADAR_ENCRYPTION_KEY before running OpsRadar in production.")
if settings.environment == "production" and settings.encryption_key.startswith("replace-with-"):
    raise RuntimeError("Replace OPSRADAR_ENCRYPTION_KEY with a real production secret.")
if settings.environment == "production" and settings.secret_key.startswith("replace-with-"):
    raise RuntimeError("Replace OPSRADAR_SECRET_KEY with a real production secret.")
settings.report_dir.mkdir(parents=True, exist_ok=True)

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.app.api.routes import router
from backend.app.core.config import settings
from backend.app.services.health import verify_external_services


app = FastAPI(title="OpsRadar API", version=settings.system_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix=settings.api_prefix)


@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    if settings.environment == "production":
        response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    return response

assets_dir = settings.project_root / "assets"
if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.on_event("startup")
def on_startup() -> None:
    verify_external_services()


@app.get("/")
def index() -> FileResponse:
    return FileResponse(settings.project_root / "index.html")


@app.get("/{path:path}")
def spa_fallback(path: str) -> FileResponse:
    candidate = settings.project_root / path
    if candidate.exists() and candidate.is_file():
        return FileResponse(candidate)
    return FileResponse(settings.project_root / "index.html")

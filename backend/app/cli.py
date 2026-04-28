from __future__ import annotations

import argparse
import os
import sys

from alembic import command
from alembic.config import Config

from backend.app.db.session import SessionLocal
from backend.app.models import User
from backend.app.services.health import verify_external_services
from backend.app.services.seed import seed_builtin_data
from backend.app.services.security import hash_password


def alembic_config() -> Config:
    return Config("alembic.ini")


def migrate() -> None:
    command.upgrade(alembic_config(), "head")


def init_admin() -> None:
    username = os.getenv("OPSRADAR_ADMIN_USERNAME", "admin")
    password = os.getenv("OPSRADAR_ADMIN_PASSWORD", "OpsRadar@123")
    display_name = os.getenv("OPSRADAR_ADMIN_DISPLAY_NAME", "OpsRadar Admin")
    email = os.getenv("OPSRADAR_ADMIN_EMAIL", "admin@opsradar.local")
    db = SessionLocal()
    try:
        seed_builtin_data(db)
        user = db.query(User).filter(User.username == username).one_or_none()
        if user:
            print(f"admin user already exists: {username}")
            return
        db.add(
            User(
                username=username,
                display_name=display_name,
                email=email,
                password_hash=hash_password(password),
                role="admin",
            )
        )
        db.commit()
        print(f"admin user created: {username}")
    finally:
        db.close()


def seed_builtin() -> None:
    db = SessionLocal()
    try:
        seed_builtin_data(db)
        print("builtin data ready")
    finally:
        db.close()


def check() -> None:
    verify_external_services()
    print("opsradar check ok")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="python3 -m backend.app.cli")
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("migrate")
    subparsers.add_parser("init-admin")
    subparsers.add_parser("seed-builtin")
    subparsers.add_parser("check")
    args = parser.parse_args(argv)
    try:
        if args.command == "migrate":
            migrate()
        elif args.command == "init-admin":
            init_admin()
        elif args.command == "seed-builtin":
            seed_builtin()
        elif args.command == "check":
            check()
    except Exception as exc:
        print(f"{args.command} failed: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

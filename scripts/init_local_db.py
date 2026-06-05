#!/usr/bin/env python3
from __future__ import annotations

import argparse
from urllib.parse import quote

import psycopg
from psycopg import sql


def create_database(host: str, port: int, user: str, password: str, maintenance_db: str, database: str) -> None:
    conninfo = {
        "host": host,
        "port": port,
        "user": user,
        "password": password,
        "dbname": maintenance_db,
        "connect_timeout": 5,
        "autocommit": True,
    }
    with psycopg.connect(**conninfo) as conn:
        exists = conn.execute("select 1 from pg_database where datname = %s", (database,)).fetchone()
        if exists:
            print(f"database already exists: {database}")
            return
        conn.execute(sql.SQL("create database {}").format(sql.Identifier(database)))
        print(f"database created: {database}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Create the local OpsRadar PostgreSQL database if it does not exist.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=5432)
    parser.add_argument("--user", default="postgres")
    parser.add_argument("--password", default="postgres")
    parser.add_argument("--maintenance-db", default="postgres")
    parser.add_argument("--database", default="opsradar")
    args = parser.parse_args(argv)
    create_database(args.host, args.port, args.user, args.password, args.maintenance_db, args.database)
    app_url = f"postgresql+psycopg://{quote(args.user)}:{quote(args.password)}@{args.host}:{args.port}/{args.database}"
    print(f"OPSRADAR_DATABASE_URL={app_url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

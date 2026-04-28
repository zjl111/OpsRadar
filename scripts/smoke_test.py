#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request


BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4173"


def request(path: str, *, method: str = "GET", token: str | None = None, payload: dict | None = None):
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"{BASE_URL}{path}", data=body, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=20) as response:
        content_type = response.headers.get("content-type", "")
        raw = response.read()
        if "application/json" in content_type:
            return response.status, json.loads(raw.decode("utf-8"))
        return response.status, raw


def main() -> int:
    try:
        status, login = request(
            "/api/auth/login",
            method="POST",
            payload={"username": "admin", "password": "OpsRadar@123"},
        )
        assert status == 200 and login["access_token"], "login failed"
        token = login["access_token"]

        status, bootstrap = request("/api/bootstrap", token=token)
        assert status == 200, "bootstrap failed"
        assert len(bootstrap["inspection_items"]) >= 1, "missing inspection templates"
        assert "dashboard" in bootstrap, "missing dashboard payload"
        assert "resource_types" in bootstrap, "missing resource types"
        assert "task_types" in bootstrap, "missing task types"

        print("smoke ok")
        print(f"groups={len(bootstrap['resource_groups'])} resources={len(bootstrap['resources'])} tasks={len(bootstrap['tasks'])}")
        return 0
    except (AssertionError, urllib.error.URLError, urllib.error.HTTPError) as exc:
        print(f"smoke failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

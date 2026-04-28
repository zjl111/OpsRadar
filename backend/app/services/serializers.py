from __future__ import annotations

from datetime import datetime
from typing import Any


def iso(value: datetime | None) -> str | None:
    if value is None:
        return None
    return value.isoformat()


def model_to_dict(obj: Any) -> dict[str, Any]:
    data: dict[str, Any] = {}
    for column in obj.__table__.columns:
        value = getattr(obj, column.name)
        data[column.name] = iso(value) if isinstance(value, datetime) else value
    return data

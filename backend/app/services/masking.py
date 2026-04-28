from __future__ import annotations

import re


SECRET_PATTERNS = [
    re.compile(r"(?i)(password|passwd|pwd|token|secret|api[_-]?key)\s*[:=]\s*([^\s\"']+)"),
    re.compile(r"(?i)(authorization:\s*bearer\s+)([A-Za-z0-9._~+/=-]+)"),
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----.*?-----END [A-Z ]*PRIVATE KEY-----", re.DOTALL),
]


def mask_sensitive(text: str | None, *, limit: int = 20000) -> str:
    if not text:
        return ""
    masked = text
    for pattern in SECRET_PATTERNS:
        if pattern.groups >= 2:
            masked = pattern.sub(lambda match: f"{match.group(1)}=***", masked)
        else:
            masked = pattern.sub("***PRIVATE KEY REDACTED***", masked)
    if len(masked) > limit:
        return masked[:limit] + "\n...[truncated]"
    return masked

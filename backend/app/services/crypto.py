from __future__ import annotations

import base64
import hashlib
import os
from typing import Any

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from backend.app.core.config import settings


def _key_bytes() -> bytes:
    return hashlib.sha256(settings.encryption_key.encode("utf-8")).digest()


def encrypt_secret(secret: str) -> dict[str, str | int]:
    nonce = os.urandom(12)
    ciphertext = AESGCM(_key_bytes()).encrypt(nonce, secret.encode("utf-8"), None)
    return {
        "v": 1,
        "alg": "AES-256-GCM",
        "nonce": base64.b64encode(nonce).decode("ascii"),
        "ciphertext": base64.b64encode(ciphertext).decode("ascii"),
    }


def decrypt_secret(payload: dict[str, Any] | None) -> str:
    if not payload:
        return ""
    if payload.get("v") != 1 or payload.get("alg") != "AES-256-GCM":
        raise ValueError("Unsupported credential encryption payload")
    try:
        nonce = base64.b64decode(str(payload["nonce"]))
        ciphertext = base64.b64decode(str(payload["ciphertext"]))
        plaintext = AESGCM(_key_bytes()).decrypt(nonce, ciphertext, None)
    except (KeyError, InvalidTag, ValueError) as exc:
        raise ValueError("Unable to decrypt resource credential") from exc
    return plaintext.decode("utf-8")


def set_encrypted_credential(extra_params: dict[str, Any] | None, secret: str) -> dict[str, Any]:
    extra = dict(extra_params or {})
    extra.pop("credential_secret", None)
    if secret:
        extra["credential_encrypted"] = encrypt_secret(secret)
    return extra


def has_encrypted_credential(extra_params: dict[str, Any] | None) -> bool:
    extra = extra_params or {}
    return bool(extra.get("credential_encrypted"))


def get_resource_credential(extra_params: dict[str, Any] | None) -> str:
    extra = extra_params or {}
    if "credential_encrypted" in extra:
        return decrypt_secret(extra.get("credential_encrypted"))
    if "credential_secret" in extra:
        raise ValueError("Resource contains legacy plaintext credentials; rotate this resource credential.")
    return ""

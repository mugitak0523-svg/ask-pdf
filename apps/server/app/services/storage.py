from __future__ import annotations

from dataclasses import dataclass, field
import logging
import time

from supabase import Client, create_client

logger = logging.getLogger("uvicorn.error")


@dataclass
class StorageClient:
    client: Client
    bucket: str
    signed_url_cache: dict[str, tuple[str, float]] = field(default_factory=dict)

    def upload_pdf(self, storage_path: str, file_bytes: bytes) -> None:
        self.client.storage.from_(self.bucket).upload(
            storage_path,
            file_bytes,
            file_options={"content-type": "application/pdf"},
        )

    def create_signed_url(self, storage_path: str, expires_in: int = 3600) -> tuple[str, float]:
        now = time.time()
        cached = self.signed_url_cache.get(storage_path)
        if cached:
            url, expires_at = cached
            if expires_at - now > 30:
                return url, expires_at
        response = self.client.storage.from_(self.bucket).create_signed_url(
            storage_path, expires_in
        )
        if isinstance(response, dict):
            url = response.get("signedURL") or response.get("signed_url") or ""
            if url:
                expires_at = now + float(expires_in)
                self.signed_url_cache[storage_path] = (url, expires_at)
                return url, expires_at
        return "", 0.0

    def download_pdf(self, storage_path: str) -> bytes:
        payload = self.client.storage.from_(self.bucket).download(storage_path)
        if isinstance(payload, bytes):
            return payload
        if isinstance(payload, bytearray):
            return bytes(payload)
        raise RuntimeError("Unexpected storage download response")


def create_storage_client(url: str, service_role_key: str, bucket: str) -> StorageClient:
    base_url = url.rstrip("/") + "/"
    logger.info("supabase_url=%s", base_url)
    return StorageClient(client=create_client(base_url, service_role_key), bucket=bucket)


def _chunks(values: list[str], size: int) -> list[list[str]]:
    return [values[idx : idx + size] for idx in range(0, len(values), size)]


def _dedupe_paths(storage_paths: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for path in storage_paths:
        item = str(path).strip()
        if not item or item in seen:
            continue
        seen.add(item)
        result.append(item)
    return result


def remove_storage_files(storage_client: StorageClient, storage_paths: list[str]) -> None:
    targets = _dedupe_paths(storage_paths)
    if not targets:
        return
    for batch in _chunks(targets, 100):
        try:
            storage_client.client.storage.from_(storage_client.bucket).remove(batch)
        except Exception:
            logger.exception("storage remove failed for %d files", len(batch))

from __future__ import annotations

from typing import Any

import httpx


class ParserClient:
    def __init__(
        self,
        base_url: str,
        api_key: str,
        api_prefix: str = "",
        timeout_s: float = 60.0,
    ) -> None:
        prefix = api_prefix.strip()
        if prefix and not prefix.startswith("/"):
            prefix = f"/{prefix}"
        self._prefix = prefix
        self._client = httpx.AsyncClient(
            base_url=base_url,
            timeout=timeout_s,
            headers={"X-API-Key": api_key},
        )

    async def close(self) -> None:
        await self._client.aclose()

    async def create_document(self, file_bytes: bytes, filename: str) -> dict[str, Any]:
        files = {"file": (filename, file_bytes, "application/pdf")}
        response = await self._client.post(f"{self._prefix}/documents", files=files)
        response.raise_for_status()
        return response.json()

    async def get_document(self, doc_id: str) -> dict[str, Any]:
        response = await self._client.get(f"{self._prefix}/documents/{doc_id}")
        response.raise_for_status()
        return response.json()

    async def get_chunks(self, doc_id: str) -> dict[str, Any]:
        response = await self._client.post(f"{self._prefix}/documents/{doc_id}/chunks")
        response.raise_for_status()
        return response.json()

    async def get_result(self, doc_id: str) -> dict[str, Any]:
        response = await self._client.get(f"{self._prefix}/documents/{doc_id}/result")
        response.raise_for_status()
        return response.json()

    async def embed_text(self, text: str) -> dict[str, Any]:
        response = await self._client.post(
            f"{self._prefix}/embeddings", json={"input": text}
        )
        response.raise_for_status()
        return response.json()

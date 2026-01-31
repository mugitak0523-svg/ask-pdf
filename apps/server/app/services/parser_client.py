from __future__ import annotations

from typing import Any

import httpx


class ParserClient:
    def __init__(self, base_url: str, api_key: str, timeout_s: float = 60.0) -> None:
        self._client = httpx.AsyncClient(
            base_url=base_url,
            timeout=timeout_s,
            headers={"X-API-Key": api_key},
        )

    async def close(self) -> None:
        await self._client.aclose()

    async def create_document(self, file_bytes: bytes, filename: str) -> dict[str, Any]:
        files = {"file": (filename, file_bytes, "application/pdf")}
        response = await self._client.post("/documents", files=files)
        response.raise_for_status()
        return response.json()

    async def get_document(self, doc_id: str) -> dict[str, Any]:
        response = await self._client.get(f"/documents/{doc_id}")
        response.raise_for_status()
        return response.json()

    async def get_chunks(self, doc_id: str) -> dict[str, Any]:
        response = await self._client.post(f"/documents/{doc_id}/chunks")
        response.raise_for_status()
        return response.json()

    async def embed_text(self, text: str) -> dict[str, Any]:
        response = await self._client.post("/embeddings", json={"input": text})
        response.raise_for_status()
        return response.json()

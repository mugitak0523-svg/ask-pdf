from __future__ import annotations

from typing import Any, AsyncGenerator
import json
from urllib.parse import urljoin, urlparse, urlunparse

import httpx
import websockets


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
            f"{self._prefix}/embeddings", json={"text": text}
        )
        response.raise_for_status()
        return response.json()

    async def create_answer(
        self,
        question: str,
        context: str,
        model: str | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {"question": question, "context": context}
        if model:
            payload["model"] = model
        response = await self._client.post(f"{self._prefix}/answers", json=payload)
        response.raise_for_status()
        return response.json()

    def _ws_url(self, path: str) -> str:
        base = self._client.base_url
        parsed = urlparse(str(base))
        scheme = "wss" if parsed.scheme == "https" else "ws"
        base_path = parsed.path.rstrip("/")
        full_path = f"{base_path}{self._prefix}{path}"
        return urlunparse(
            (
                scheme,
                parsed.netloc,
                full_path,
                "",
                "",
                "",
            )
        )

    async def stream_answer(
        self,
        question: str,
        context: str,
        model: str | None = None,
    ) -> AsyncGenerator[dict[str, Any], None]:
        url = self._ws_url("/ws/answers")
        payload: dict[str, Any] = {"question": question, "context": context}
        if model:
            payload["model"] = model
        headers = {"X-API-Key": self._client.headers.get("X-API-Key", "")}
        try:
            websocket_ctx = websockets.connect(url, additional_headers=headers)
        except TypeError:
            websocket_ctx = websockets.connect(url, extra_headers=headers)
        async with websocket_ctx as websocket:
            await websocket.send(json.dumps(payload))
            async for message in websocket:
                try:
                    data = json.loads(message)
                except Exception:
                    continue
                if isinstance(data, dict):
                    yield data

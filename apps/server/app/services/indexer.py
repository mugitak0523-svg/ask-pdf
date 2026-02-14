from __future__ import annotations

import re
import time
import asyncio
import unicodedata
from typing import Any
from uuid import uuid4

import anyio

from app.db import repository
from app.services.parser_client import ParserClient
from app.services.usage import extract_pages
from app.services.storage import StorageClient


class Indexer:
    def __init__(self, parser_client: ParserClient, storage_client: StorageClient) -> None:
        self._parser = parser_client
        self._storage = storage_client
        self._limiter = None

    async def resume_processing(self, pool, user_id: str) -> int:
        rows = await repository.list_processing_documents(pool, user_id)
        started = 0
        for row in rows:
            document_id = str(row.get("id"))
            parser_doc_id = row.get("parser_doc_id")
            if not parser_doc_id:
                continue
            asyncio.create_task(
                self._resume_parser_document(
                    pool=pool,
                    document_id=document_id,
                    user_id=user_id,
                    parser_doc_id=str(parser_doc_id),
                )
            )
            started += 1
        return started

    async def _resume_parser_document(
        self,
        pool,
        document_id: str,
        user_id: str,
        parser_doc_id: str,
    ) -> None:
        try:
            status_payload = await self._wait_for_parser(parser_doc_id)
            result_payload = await self._parser.get_result(parser_doc_id)
            chunks_payload = result_payload.get("chunks", result_payload)
            chunks = self._normalize_chunks(chunks_payload)

            await repository.update_document_result(
                pool,
                document_id=document_id,
                metadata={
                    "parser_doc_id": parser_doc_id,
                    "parser_status": status_payload,
                    "parser_result_meta": {
                        "parser_version": result_payload.get("parser_version"),
                        "source": result_payload.get("source"),
                    },
                },
                result=result_payload,
                status="ready",
            )
            await repository.insert_chunks(pool, document_id, user_id, chunks)

            pages = extract_pages(result_payload)
            if pages is not None:
                try:
                    await repository.insert_usage_log(
                        pool,
                        user_id=user_id,
                        operation="parse",
                        document_id=document_id,
                        pages=pages,
                        raw_request={"parser_doc_id": parser_doc_id},
                    )
                except Exception:
                    pass
        except Exception as exc:
            await repository.update_document_status(
                pool,
                document_id=document_id,
                status="failed",
                error_message=str(exc),
            )

    async def start_index_document(
        self,
        pool,
        file_bytes: bytes,
        filename: str | None,
        user_id: str,
    ) -> dict[str, Any]:
        original_name = filename or "document.pdf"
        safe_storage_name = self._sanitize_storage_name(original_name)
        storage_path = f"{user_id}/{uuid4()}-{safe_storage_name}"

        document_id = await repository.insert_document(
            pool,
            title=original_name,
            storage_path=storage_path,
            metadata={},
            result=None,
            user_id=user_id,
            status="uploading",
        )

        try:
            await anyio.to_thread.run_sync(
                self._storage.upload_pdf,
                storage_path,
                file_bytes,
            )
        except Exception as exc:
            await repository.update_document_status(
                pool,
                document_id=document_id,
                status="failed",
                error_message=str(exc),
            )
            raise

        await repository.update_document_status(
            pool,
            document_id=document_id,
            status="uploaded",
        )

        asyncio.create_task(
            self._process_document(
                pool,
                file_bytes,
                original_name,
                user_id,
                document_id,
            )
        )

        return {
            "document_id": document_id,
            "status": "uploaded",
        }

    async def _process_document(
        self,
        pool,
        file_bytes: bytes,
        filename: str,
        user_id: str,
        document_id: str,
    ) -> None:
        await repository.update_document_status(
            pool,
            document_id=document_id,
            status="processing",
        )
        try:
            parser_payload = await self._parser.create_document(file_bytes, filename)
            parser_doc_id = str(parser_payload.get("doc_id") or parser_payload.get("id"))

            status_payload = await self._wait_for_parser(parser_doc_id)
            result_payload = await self._parser.get_result(parser_doc_id)
            chunks_payload = result_payload.get("chunks", result_payload)
            chunks = self._normalize_chunks(chunks_payload)

            await repository.update_document_result(
                pool,
                document_id=document_id,
                metadata={
                    "parser_doc_id": parser_doc_id,
                    "parser_status": status_payload,
                    "parser_result_meta": {
                        "parser_version": result_payload.get("parser_version"),
                        "source": result_payload.get("source"),
                    },
                },
                result=result_payload,
                status="ready",
            )
            inserted = await repository.insert_chunks(pool, document_id, user_id, chunks)

            pages = extract_pages(result_payload)
            if pages is not None:
                try:
                    await repository.insert_usage_log(
                        pool,
                        user_id=user_id,
                        operation="parse",
                        document_id=document_id,
                        pages=pages,
                        raw_request={"parser_doc_id": parser_doc_id},
                    )
                except Exception:
                    pass
            _ = inserted
        except Exception as exc:
            await repository.update_document_status(
                pool,
                document_id=document_id,
                status="failed",
                error_message=str(exc),
            )

    def _sanitize_storage_name(self, filename: str) -> str:
        normalized = unicodedata.normalize("NFKD", filename)
        ascii_name = normalized.encode("ascii", "ignore").decode("ascii")
        if not ascii_name:
            ascii_name = "document.pdf"
        ascii_name = ascii_name.replace(" ", "-")
        ascii_name = re.sub(r"[^A-Za-z0-9._-]", "", ascii_name)
        if not ascii_name.lower().endswith(".pdf"):
            ascii_name = f"{ascii_name}.pdf"
        return ascii_name

    async def _wait_for_parser(
        self,
        doc_id: str,
        timeout_s: float = 180.0,
        interval_s: float = 5.0,
    ) -> dict[str, Any]:
        deadline = time.monotonic() + timeout_s
        while True:
            payload = await self._parser.get_document(doc_id)
            status = str(payload.get("status", "")).lower()
            if status in {"succeeded"}:
                return payload
            if status in {"failed"}:
                raise RuntimeError(f"Parser failed: {payload}")
            if time.monotonic() > deadline:
                raise TimeoutError("Parser timeout")
            await anyio.sleep(interval_s)

    @staticmethod
    def _normalize_chunks(payload: Any) -> list[dict[str, Any]]:
        if isinstance(payload, list):
            return payload
        if isinstance(payload, dict):
            return payload.get("chunks") or payload.get("data") or []
        return []

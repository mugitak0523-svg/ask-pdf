from __future__ import annotations

import json
import re
import logging
import asyncio
import time
from typing import Any, Literal

from fastapi import APIRouter, File, HTTPException, Request, UploadFile, status, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from app.db import repository
from app.services.auth import AuthDependency, AuthUser, get_user_from_token_app
from app.services.indexer import Indexer
from app.services.storage import StorageClient
from app.services.usage import extract_usage
from app.services.plans import get_plan_limits, resolve_user_plan

router = APIRouter()
logger = logging.getLogger("uvicorn.error")


class ChatAnswerRequest(BaseModel):
    message: str
    message_id: str | None = None
    mode: Literal["fast", "standard", "think"] | None = None
    top_k: int | None = None
    client_matches: list[dict[str, Any]] | None = None


ChatAnswerRequest.model_rebuild()


def _build_model(settings, mode: str | None) -> str | None:
    if mode == "fast":
        return settings.chat_model_fast
    if mode == "think":
        return settings.chat_model_think
    if mode == "standard":
        return settings.chat_model_standard
    return None


def _resolve_rag_params(settings, payload: ChatAnswerRequest) -> tuple[int, int, float]:
    top_k = payload.top_k if payload.top_k is not None else settings.rag_top_k
    top_k = min(max(int(top_k), 1), 20)
    min_k = min(max(int(settings.rag_min_k), 0), top_k)
    score_threshold = max(float(settings.rag_score_threshold), 0.0)
    return top_k, min_k, score_threshold


def _extract_embedding(payload: dict[str, Any]) -> list[float] | None:
    embedding = payload.get("embedding")
    if isinstance(embedding, list):
        return embedding
    data = payload.get("data")
    if isinstance(data, dict):
        embedding = data.get("embedding")
        if isinstance(embedding, list):
            return embedding
        data = data.get("data")
    if isinstance(data, list):
        for item in data:
            if not isinstance(item, dict):
                continue
            embedding = item.get("embedding")
            if isinstance(embedding, list):
                return embedding
    return None


def _parse_vector(value: Any) -> list[float] | None:
    if isinstance(value, list):
        return [float(item) for item in value]
    if value is None:
        return None
    if isinstance(value, (bytes, bytearray, memoryview)):
        value = bytes(value).decode()
    if isinstance(value, str):
        text = value.strip()
        if text.startswith("[") and text.endswith("]"):
            text = text[1:-1]
        if not text:
            return []
        parts = [item.strip() for item in text.split(",") if item.strip()]
        return [float(item) for item in parts]
    return None


def _split_matches(
    matches: list[dict[str, Any]],
    min_k: int,
    score_threshold: float,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    filtered = [row for row in matches if (row.get("similarity") or 0.0) >= score_threshold]
    if len(filtered) < min_k:
        return matches[:min_k], filtered
    return filtered, filtered


def _normalize_client_matches(value: Any) -> list[dict[str, Any]] | None:
    if not isinstance(value, list):
        return None
    matches: list[dict[str, Any]] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        chunk_id = item.get("id") or item.get("chunk_id")
        content = item.get("content")
        if not chunk_id or content is None:
            continue
        similarity = item.get("similarity")
        try:
            similarity_value = float(similarity) if similarity is not None else 0.0
        except (TypeError, ValueError):
            similarity_value = 0.0
        matches.append(
            {
                "id": str(chunk_id),
                "content": str(content),
                "metadata": item.get("metadata"),
                "similarity": similarity_value,
            }
        )
    return matches if matches else None


def _extract_tag_refs(answer: str, ref_map: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    if not answer:
        return []
    tags = re.findall(r"\[@:chunk-([a-f0-9\\-]+)\]", answer, flags=re.IGNORECASE)
    if not tags:
        return []
    refs: list[dict[str, Any]] = []
    seen = set()
    for chunk_id in tags:
        key = str(chunk_id).lower()
        if key in seen:
            continue
        seen.add(key)
        ref = ref_map.get(key)
        if ref:
            refs.append(ref)
    return refs


async def _record_usage(
    pool,
    *,
    user_id: str,
    operation: str,
    payload: dict[str, Any] | None = None,
    document_id: str | None = None,
    chat_id: str | None = None,
    message_id: str | None = None,
    model: str | None = None,
) -> None:
    if payload is None:
        return
    input_tokens, output_tokens, total_tokens, raw_usage = extract_usage(payload)
    if raw_usage is None and total_tokens is None:
        return
    try:
        await repository.insert_usage_log(
            pool,
            user_id=user_id,
            operation=operation,
            document_id=document_id,
            chat_id=chat_id,
            message_id=message_id,
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            raw_usage=raw_usage,
        )
    except Exception:
        logger.exception("usage_log failed operation=%s", operation)


async def _record_usage_conn(
    conn,
    *,
    user_id: str,
    operation: str,
    payload: dict[str, Any] | None = None,
    document_id: str | None = None,
    chat_id: str | None = None,
    message_id: str | None = None,
    model: str | None = None,
) -> None:
    if payload is None:
        return
    input_tokens, output_tokens, total_tokens, raw_usage = extract_usage(payload)
    if raw_usage is None and total_tokens is None:
        return
    try:
        await repository.insert_usage_log_conn(
            conn,
            user_id=user_id,
            operation=operation,
            document_id=document_id,
            chat_id=chat_id,
            message_id=message_id,
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            raw_usage=raw_usage,
        )
    except Exception:
        logger.exception("usage_log failed operation=%s", operation)

async def _resolve_limits(pool, user_id: str):
    plan = await resolve_user_plan(pool, user_id)
    limits = get_plan_limits(plan)
    return plan, limits


async def _resolve_limits_conn(conn, user_id: str):
    plan = await repository.get_user_plan_conn(conn, user_id)
    limits = get_plan_limits(plan)
    return plan, limits


def _enforce_file_size_limit(file_size: int, limits) -> None:
    if limits.max_file_mb is None:
        return
    limit_bytes = limits.max_file_mb * 1024 * 1024
    if file_size > limit_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size limit exceeded",
        )


async def _enforce_thread_limit(pool, user_id: str, document_id: str) -> None:
    _, limits = await _resolve_limits(pool, user_id)
    if limits.max_threads_per_document is None:
        return
    count = await repository.count_document_chat_threads(pool, document_id, user_id)
    if count >= limits.max_threads_per_document:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Thread limit reached",
        )


async def _enforce_message_limit(pool, user_id: str, chat_id: str) -> None:
    _, limits = await _resolve_limits(pool, user_id)
    if limits.max_messages_per_thread is None:
        return
    count = await repository.count_document_chat_messages(
        pool, chat_id, user_id, role="user"
    )
    if count >= limits.max_messages_per_thread:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Message limit reached",
        )


async def _enforce_message_limit_conn(conn, user_id: str, chat_id: str) -> None:
    _, limits = await _resolve_limits_conn(conn, user_id)
    if limits.max_messages_per_thread is None:
        return
    count = await repository.count_document_chat_messages_conn(
        conn, chat_id, user_id, role="user"
    )
    if count >= limits.max_messages_per_thread:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Message limit reached",
        )


@router.post("/documents/index")
async def index_document(
    request: Request,
    file: UploadFile = File(...),
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    content = await file.read()
    pool = request.app.state.db_pool
    _, limits = await _resolve_limits(pool, user.user_id)
    _enforce_file_size_limit(len(content), limits)
    if limits.max_files is not None:
        count = await repository.count_documents(pool, user.user_id)
        if count >= limits.max_files:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Document limit reached",
            )
    indexer: Indexer = request.app.state.indexer
    return await indexer.index_document(pool, content, file.filename, user.user_id)


@router.get("/documents")
async def list_documents(
    request: Request,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    start = time.perf_counter()
    pool = request.app.state.db_pool
    rows = await repository.list_documents(pool, user.user_id)
    logger.info(
        "list_documents user=%s count=%d ms=%.1f",
        user.user_id,
        len(rows),
        (time.perf_counter() - start) * 1000,
    )
    return {"documents": rows}


@router.get("/documents/{document_id}")
async def get_document(
    request: Request,
    document_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    exists = await repository.document_exists(pool, document_id, user.user_id)
    if not exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return row


@router.patch("/documents/{document_id}")
async def update_document(
    request: Request,
    document_id: str,
    payload: dict[str, Any],
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    title = payload.get("title") if isinstance(payload, dict) else None
    if not isinstance(title, str) or not title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="title is required",
        )
    pool = request.app.state.db_pool
    row = await repository.update_document_title(pool, document_id, user.user_id, title.strip())
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return {"id": str(row["id"]), "title": row.get("title")}


@router.delete("/documents/{document_id}")
async def delete_document(
    request: Request,
    document_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    row = await repository.delete_document(pool, document_id, user.user_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return {"id": str(row["id"])}


@router.get("/documents/{document_id}/signed-url")
async def get_document_signed_url(
    request: Request,
    document_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, str]:
    start = time.perf_counter()
    pool = request.app.state.db_pool
    storage_path = await repository.get_document_storage_path(pool, document_id, user.user_id)
    if not storage_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    storage_client: StorageClient = request.app.state.storage_client
    db_ms = (time.perf_counter() - start) * 1000
    sign_start = time.perf_counter()
    signed_url = storage_client.create_signed_url(storage_path)
    if not signed_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create signed URL",
        )
    logger.info(
        "signed_url user=%s doc=%s db_ms=%.1f sign_ms=%.1f total_ms=%.1f",
        user.user_id,
        document_id,
        db_ms,
        (time.perf_counter() - sign_start) * 1000,
        (time.perf_counter() - start) * 1000,
    )
    return {"signed_url": signed_url}


@router.get("/documents/{document_id}/bundle")
async def get_document_bundle(
    request: Request,
    document_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    start = time.perf_counter()
    pool = request.app.state.db_pool
    bundle = await repository.get_document_bundle(pool, document_id, user.user_id)
    if not bundle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    storage_path = bundle.get("storage_path")
    if not storage_path:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Missing storage path")
    storage_client: StorageClient = request.app.state.storage_client
    db_ms = (time.perf_counter() - start) * 1000
    sign_start = time.perf_counter()
    signed_url = storage_client.create_signed_url(str(storage_path))
    if not signed_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create signed URL",
        )
    result = bundle.get("result")
    if isinstance(result, str):
        try:
            result = json.loads(result)
        except json.JSONDecodeError:
            result = None
    annotations = bundle.get("annotations") if bundle else None
    if isinstance(annotations, str):
        try:
            annotations = json.loads(annotations)
        except json.JSONDecodeError:
            annotations = {}
    if not isinstance(annotations, dict):
        annotations = {}
    logger.info(
        "bundle user=%s doc=%s db_ms=%.1f sign_ms=%.1f total_ms=%.1f",
        user.user_id,
        document_id,
        db_ms,
        (time.perf_counter() - sign_start) * 1000,
        (time.perf_counter() - start) * 1000,
    )
    return {"signed_url": signed_url, "result": result, "annotations": annotations}


@router.get("/documents/{document_id}/text-positions")
async def get_document_text_positions(
    request: Request,
    document_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    row = await repository.get_document(pool, document_id, user.user_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    result = row.get("result")
    if not isinstance(result, dict):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document result not found",
        )

    pages = []
    for page in result.get("pages", []) or []:
        page_number = page.get("pageNumber") or page.get("page_number")
        width = page.get("width") or page.get("widthInch")
        height = page.get("height") or page.get("heightInch")
        if page_number and width and height:
            pages.append(
                {
                    "pageNumber": page_number,
                    "width": width,
                    "height": height,
                    "unit": page.get("unit") or "inch",
                }
            )

    def _iter_items(key: str) -> list[dict[str, Any]]:
        return result.get(key, []) or []

    items: list[dict[str, Any]] = []
    source = None

    words = _iter_items("words")
    if words:
        source = "words"
        for word in words:
            text = word.get("content") or word.get("text") or ""
            regions = word.get("boundingRegions") or word.get("bounding_regions") or []
            for region in regions:
                bbox = region.get("bbox")
                page_number = region.get("pageNumber") or region.get("page_number")
                if bbox and page_number:
                    items.append(
                        {
                            "pageNumber": page_number,
                            "text": text,
                            "bbox": bbox,
                        }
                    )
    else:
        paragraphs = _iter_items("paragraphs")
        if paragraphs:
            source = "paragraphs"
            for para in paragraphs:
                text = para.get("content") or ""
                regions = para.get("boundingRegions") or para.get("bounding_regions") or []
                for region in regions:
                    bbox = region.get("bbox")
                    page_number = region.get("pageNumber") or region.get("page_number")
                    if bbox and page_number:
                        items.append(
                            {
                                "pageNumber": page_number,
                                "text": text,
                                "bbox": bbox,
                            }
                        )

    if not items:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Text positions not found in result",
        )

    return {"pages": pages, "items": items, "source": source}


@router.get("/documents/{document_id}/result")
async def get_document_result(
    request: Request,
    document_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    row = await repository.get_document(pool, document_id, user.user_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    result = row.get("result")
    if isinstance(result, str):
        try:
            result = json.loads(result)
        except json.JSONDecodeError:
            result = None
    if not isinstance(result, dict):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document result not found",
        )
    return result


@router.get("/documents/{document_id}/chunks/{chunk_id}")
async def get_document_chunk(
    request: Request,
    document_id: str,
    chunk_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    row = await repository.get_document_chunk(pool, document_id, chunk_id, user.user_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return {
        "chunk": {
            "id": str(row["id"]),
            "documentId": str(row["document_id"]),
            "metadata": row.get("metadata"),
        }
    }


@router.get("/documents/{document_id}/chunks")
async def list_document_chunks(
    request: Request,
    document_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    rows = await repository.list_document_chunks_with_embeddings(
        pool,
        document_id,
        user.user_id,
    )
    chunks: list[dict[str, Any]] = []
    for row in rows:
        embedding = _parse_vector(row.get("embedding"))
        chunks.append(
            {
                "id": str(row["id"]),
                "documentId": str(row["document_id"]),
                "content": str(row.get("content") or ""),
                "metadata": row.get("metadata"),
                "embedding": embedding,
            }
        )
    return {"chunks": chunks}


@router.get("/document-chunks/{chunk_id}")
async def get_document_chunk_preview(
    request: Request,
    chunk_id: str,
    document_id: str | None = None,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    row = await repository.get_document_chunk_content(
        pool,
        chunk_id=chunk_id,
        user_id=user.user_id,
        document_id=document_id,
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    content = str(row.get("content") or "")
    text = " ".join(content.split())
    metadata = row.get("metadata")
    if isinstance(metadata, str):
        try:
            metadata = json.loads(metadata)
        except json.JSONDecodeError:
            metadata = None
    return {
        "chunk": {
            "id": str(row["id"]),
            "documentId": str(row["document_id"]),
            "text": text,
            "metadata": metadata,
            "documentTitle": row.get("document_title"),
        }
    }


@router.get("/documents/{document_id}/annotations")
async def get_document_annotations(
    request: Request,
    document_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    exists = await repository.document_exists(pool, document_id, user.user_id)
    if not exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    data_row = await repository.get_document_annotations(pool, document_id, user.user_id)
    data = data_row.get("data") if data_row else {}
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except json.JSONDecodeError:
            data = {}
    if not isinstance(data, dict):
        data = {}
    return {"annotations": data}


@router.put("/documents/{document_id}/annotations")
async def upsert_document_annotations(
    request: Request,
    document_id: str,
    payload: dict[str, Any],
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    exists = await repository.document_exists(pool, document_id, user.user_id)
    if not exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    annotations = payload.get("annotations")
    if not isinstance(annotations, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="annotations must be an object",
        )
    await repository.upsert_document_annotations(
        pool,
        document_id,
        user.user_id,
        annotations,
    )
    return {"status": "ok"}


@router.get("/documents/{document_id}/chat")
async def get_document_chat(
    request: Request,
    document_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    exists = await repository.document_exists(pool, document_id, user.user_id)
    if not exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    data_row = await repository.get_document_chat(pool, document_id, user.user_id)
    data = data_row.get("data") if data_row else {}
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except json.JSONDecodeError:
            data = {}
    if not isinstance(data, dict):
        data = {}
    return {"chat": data}


@router.put("/documents/{document_id}/chat")
async def upsert_document_chat(
    request: Request,
    document_id: str,
    payload: dict[str, Any],
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    exists = await repository.document_exists(pool, document_id, user.user_id)
    if not exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    chat = payload.get("chat")
    if not isinstance(chat, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="chat must be an object",
        )
    await repository.upsert_document_chat(
        pool,
        document_id,
        user.user_id,
        chat,
    )
    return {"status": "ok"}


@router.get("/documents/{document_id}/chats")
async def list_document_chats(
    request: Request,
    document_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    start = time.perf_counter()
    pool = request.app.state.db_pool
    exists = await repository.document_exists(pool, document_id, user.user_id)
    if not exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    threads = await repository.list_document_chat_threads(pool, document_id, user.user_id)
    logger.info(
        "list_document_chats user=%s doc=%s count=%d ms=%.1f",
        user.user_id,
        document_id,
        len(threads),
        (time.perf_counter() - start) * 1000,
    )
    return {"chats": threads}


@router.post("/documents/{document_id}/chats")
async def create_document_chat(
    request: Request,
    document_id: str,
    payload: dict[str, Any],
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    exists = await repository.document_exists(pool, document_id, user.user_id)
    if not exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    await _enforce_thread_limit(pool, user.user_id, document_id)
    title = payload.get("title") if isinstance(payload, dict) else None
    chat_id = await repository.insert_document_chat_thread(
        pool,
        document_id,
        user.user_id,
        title if isinstance(title, str) else None,
    )
    return {"chat_id": chat_id}


@router.patch("/documents/{document_id}/chats/{chat_id}")
async def update_document_chat(
    request: Request,
    document_id: str,
    chat_id: str,
    payload: dict[str, Any],
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    title = payload.get("title") if isinstance(payload, dict) else None
    if not isinstance(title, str) or not title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="title is required",
        )
    pool = request.app.state.db_pool
    row = await repository.get_document_chat_thread(
        pool,
        document_id,
        chat_id,
        user.user_id,
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    saved = await repository.update_document_chat_thread_title(
        pool,
        chat_id,
        user.user_id,
        title.strip(),
    )
    if not saved:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return {"id": str(saved["id"]), "title": saved.get("title")}


@router.delete("/documents/{document_id}/chats/{chat_id}")
async def delete_document_chat(
    request: Request,
    document_id: str,
    chat_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    row = await repository.delete_document_chat_thread(
        pool, document_id, chat_id, user.user_id
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return {"id": str(row["id"])}


@router.get("/documents/{document_id}/chats/{chat_id}/messages")
async def list_document_chat_messages(
    request: Request,
    document_id: str,
    chat_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    start = time.perf_counter()
    pool = request.app.state.db_pool
    exists = await repository.document_exists(pool, document_id, user.user_id)
    if not exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    rows = await repository.list_document_chat_messages(pool, chat_id, user.user_id)
    messages = []
    for item in rows:
        messages.append(
            {
                "id": str(item["id"]),
                "role": item["role"],
                "text": item["content"],
                "status": item.get("status"),
                "refs": item.get("refs"),
                "createdAt": item["created_at"].isoformat()
                if item.get("created_at")
                else None,
            }
        )
    logger.info(
        "list_document_chat_messages user=%s doc=%s chat=%s count=%d ms=%.1f",
        user.user_id,
        document_id,
        chat_id,
        len(messages),
        (time.perf_counter() - start) * 1000,
    )
    return {"messages": messages}


@router.post("/documents/{document_id}/chats/{chat_id}/messages")
async def create_document_chat_message(
    request: Request,
    document_id: str,
    chat_id: str,
    payload: dict[str, Any],
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    role = payload.get("role")
    text = payload.get("text")
    refs = payload.get("refs") if isinstance(payload, dict) else None
    if role not in {"user", "assistant"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="role must be user or assistant",
        )
    if not isinstance(text, str) or not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="text is required",
        )
    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        _, limits = await _resolve_limits_conn(conn, user.user_id)
        row = await repository.insert_document_chat_message_checked_conn(
            conn,
            document_id,
            chat_id,
            user.user_id,
            role,
            text,
            "ok",
            refs if isinstance(refs, list) else None,
            limits.max_messages_per_thread,
        )
        if not row.get("doc_exists") or not row.get("thread_exists"):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
        if (
            limits.max_messages_per_thread is not None
            and row.get("msg_count") is not None
            and int(row["msg_count"]) >= limits.max_messages_per_thread
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Message limit reached",
            )
        if not row.get("id"):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Message not saved",
            )
    return {
        "message": {
            "id": str(row["id"]),
            "role": row["role"],
            "text": row["content"],
            "status": row.get("status"),
            "refs": row.get("refs"),
            "createdAt": row["created_at"].isoformat()
            if row.get("created_at")
            else None,
        }
    }


@router.post("/documents/{document_id}/chats/{chat_id}/assistant")
async def create_document_chat_assistant_message(
    request: Request,
    document_id: str,
    chat_id: str,
    payload: ChatAnswerRequest,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    message = payload.message.strip()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="message is required",
        )

    pool = request.app.state.db_pool
    parser = request.app.state.parser_client
    settings = request.app.state.settings

    top_k, min_k, score_threshold = _resolve_rag_params(settings, payload)
    client_matches = _normalize_client_matches(payload.client_matches)
    if client_matches:
        exists_ok = await repository.document_thread_exists(
            pool,
            document_id,
            chat_id,
            user.user_id,
        )
        if not exists_ok:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
        matches = client_matches[:top_k]
        async with pool.acquire() as conn:
            recent_messages = await repository.list_recent_document_chat_messages_conn(
                conn,
                chat_id,
                user.user_id,
                limit=4,
            )
    else:
        check_task = repository.document_thread_exists(
            pool,
            document_id,
            chat_id,
            user.user_id,
        )
        embed_task = parser.embed_text(message)
        exists_ok, embed_payload = await asyncio.gather(check_task, embed_task)
        if not exists_ok:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

        embedding = _extract_embedding(embed_payload)
        if not isinstance(embedding, list):
            logger.error(
                "assistant.embed invalid response type=%s keys=%s",
                type(embed_payload).__name__,
                list(embed_payload.keys()) if isinstance(embed_payload, dict) else None,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid embedding response",
            )

        async with pool.acquire() as conn:
            await _record_usage_conn(
                conn,
                user_id=user.user_id,
                operation="embed",
                payload=embed_payload if isinstance(embed_payload, dict) else None,
                document_id=document_id,
                chat_id=chat_id,
            )
            matches = await repository.match_documents_conn(
                conn,
                query_embedding=embedding,
                match_count=top_k,
                document_id=document_id,
            )
            recent_messages = await repository.list_recent_document_chat_messages_conn(
                conn,
                chat_id,
                user.user_id,
                limit=4,
            )

    context_matches, _ = _split_matches(matches, min_k, score_threshold)
    memory_lines: list[str] = []
    for item in recent_messages:
        if item.get("status") in {"error", "stopped"}:
            continue
        role = "User" if item.get("role") == "user" else "Assistant"
        content = str(item.get("content") or "").strip()
        if not content:
            continue
        if role == "User" and content == message:
            continue
        memory_lines.append(f"{role}: {content}")

    def _page_label(meta: dict[str, Any]) -> str | None:
        pages = meta.get("page") or meta.get("pages") or meta.get("page_number")
        if isinstance(pages, list):
            values = [str(item) for item in pages if isinstance(item, int)]
            return ", ".join(sorted(set(values))) if values else None
        if isinstance(pages, int):
            return str(pages)
        return None



    context_parts: list[str] = []
    refs: list[dict[str, Any]] = []
    ref_map: dict[str, dict[str, Any]] = {}
    for idx, match in enumerate(context_matches, start=1):
        content = str(match.get("content") or "")
        meta = match.get("metadata") or {}
        page_label = _page_label(meta) if isinstance(meta, dict) else None
        match_id = str(match.get("id") or "").lower()
        above_threshold = (match.get("similarity") or 0.0) >= score_threshold
        if page_label:
            context_parts.append(f"[{idx}] (page {page_label}) {content}")
            refs.append(
                {
                    "id": f"chunk-{match['id']}",
                    "label": f"p.{page_label}",
                    "aboveThreshold": above_threshold,
                }
            )
            if match_id:
                ref_map[match_id] = {
                    "id": f"chunk-{match['id']}",
                    "label": f"p.{page_label}",
                    "aboveThreshold": above_threshold,
                }
        else:
            context_parts.append(f"[{idx}] {content}")
            refs.append(
                {
                    "id": f"chunk-{match['id']}",
                    "label": str(idx),
                    "aboveThreshold": above_threshold,
                }
            )
            if match_id:
                ref_map[match_id] = {
                    "id": f"chunk-{match['id']}",
                    "label": str(idx),
                    "aboveThreshold": above_threshold,
                }

    if memory_lines:
        context_parts.insert(
            0,
            "Conversation (last 2 turns):\n" + "\n".join(memory_lines),
        )

    context_parts.insert(
        0,
        "System:\n"
        "あなたはPDF横断検索を行うアシスタントです。\n"
        "ユーザーの質問に対し、与えられたコンテキストと確定している事実，一般常識だけを根拠に答えてください。\n"
        "推測で補完しないでください。\n"
        "\n"
        "Instruction:\n"
        "- 参照した場合は [@:chunk-{id}] を文中に挿入してください。\n"
        "- 参照は複数可、段落末尾に付けてください。\n",
    )

    model = _build_model(settings, payload.mode)

    try:
        answer_payload = await parser.create_answer(
            question=message,
            context="\n\n".join(context_parts),
            model=model,
        )
        answer = str(answer_payload.get("answer") or "").strip()
        if not answer:
            raise RuntimeError("Answer generation failed")
        _ = _extract_tag_refs(answer, ref_map)
        final_refs = refs if refs else None
        async with pool.acquire() as conn:
            if payload.message_id:
                saved = await repository.update_document_chat_message_conn(
                    conn,
                    chat_id,
                    user.user_id,
                    payload.message_id,
                    answer,
                    "ok",
                    final_refs,
                )
                if saved is None:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Message not found",
                    )
            else:
                saved = await repository.insert_document_chat_message_conn(
                    conn,
                    chat_id,
                    user.user_id,
                    "assistant",
                    answer,
                    "ok",
                    final_refs,
                )
            await _record_usage_conn(
                conn,
                user_id=user.user_id,
                operation="answer",
                payload=answer_payload if isinstance(answer_payload, dict) else None,
                document_id=document_id,
                chat_id=chat_id,
                message_id=str(saved["id"]),
                model=model,
            )
        return {
            "message": {
                "id": str(saved["id"]),
                "role": saved["role"],
                "text": saved["content"],
                "status": saved.get("status"),
                "refs": saved.get("refs"),
                "createdAt": saved["created_at"].isoformat()
                if saved.get("created_at")
                else None,
            },
            "usage": answer_payload.get("usage"),
        }
    except Exception:
        async with pool.acquire() as conn:
            if payload.message_id:
                saved = await repository.update_document_chat_message_conn(
                    conn,
                    chat_id,
                    user.user_id,
                    payload.message_id,
                    "",
                    "error",
                    None,
                )
            else:
                saved = await repository.insert_document_chat_message_conn(
                    conn,
                    chat_id,
                    user.user_id,
                    "assistant",
                    "",
                    "error",
                    None,
                )
        if saved is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found",
            )
        return {
            "message": {
                "id": str(saved["id"]),
                "role": saved["role"],
                "text": saved["content"],
                "status": saved.get("status"),
                "refs": saved.get("refs"),
                "createdAt": saved["created_at"].isoformat()
                if saved.get("created_at")
                else None,
            }
        }


@router.websocket("/documents/{document_id}/chats/{chat_id}/assistant/ws")
async def stream_document_chat_assistant_message(
    websocket: WebSocket,
    document_id: str,
    chat_id: str,
) -> None:
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return
    await websocket.accept()
    try:
        user = get_user_from_token_app(websocket.scope["app"], token)  # type: ignore[arg-type]
    except HTTPException:
        await websocket.close(code=1008)
        return

    pool = websocket.scope["app"].state.db_pool
    ok = await repository.document_thread_exists(
        pool,
        document_id,
        chat_id,
        user.user_id,
    )
    if not ok:
        await websocket.close(code=1008)
        return

    try:
        raw = await websocket.receive_text()
    except WebSocketDisconnect:
        return
    try:
        decoded = json.loads(raw)
        payload = ChatAnswerRequest(**decoded)
    except Exception as exc:
        await websocket.close(code=1008)
        return

    message = payload.message.strip()
    if not message:
        await websocket.close(code=1008)
        return

    parser = websocket.scope["app"].state.parser_client
    settings = websocket.scope["app"].state.settings
    top_k, min_k, score_threshold = _resolve_rag_params(settings, payload)
    client_matches = _normalize_client_matches(payload.client_matches)
    if client_matches:
        matches = client_matches[:top_k]
    else:
        embed_payload = await parser.embed_text(message)
        await _record_usage(
            pool,
            user_id=user.user_id,
            operation="embed",
            payload=embed_payload if isinstance(embed_payload, dict) else None,
            document_id=document_id,
            chat_id=chat_id,
        )
        embedding = _extract_embedding(embed_payload)
        if not isinstance(embedding, list):
            await websocket.close(code=1011)
            return
        matches = await repository.match_documents(
            pool,
            query_embedding=embedding,
            match_count=top_k,
            document_id=document_id,
        )
    context_matches, _ = _split_matches(matches, min_k, score_threshold)

    recent_messages = await repository.list_recent_document_chat_messages(
        pool,
        chat_id,
        user.user_id,
        limit=4,
    )
    memory_lines: list[str] = []
    for item in recent_messages:
        if item.get("status") == "error":
            continue
        role = "User" if item.get("role") == "user" else "Assistant"
        content = str(item.get("content") or "").strip()
        if not content:
            continue
        if role == "User" and content == message:
            continue
        memory_lines.append(f"{role}: {content}")

    def _page_label(meta: dict[str, Any]) -> str | None:
        pages = meta.get("page") or meta.get("pages") or meta.get("page_number")
        if isinstance(pages, list):
            values = [str(item) for item in pages if isinstance(item, int)]
            return ", ".join(sorted(set(values))) if values else None
        if isinstance(pages, int):
            return str(pages)
        return None

    context_parts: list[str] = []
    refs: list[dict[str, Any]] = []
    ref_map: dict[str, dict[str, Any]] = {}
    for idx, match in enumerate(context_matches, start=1):
        content = str(match.get("content") or "")
        meta = match.get("metadata") or {}
        page_label = _page_label(meta) if isinstance(meta, dict) else None
        match_id = str(match.get("id") or "").lower()
        above_threshold = (match.get("similarity") or 0.0) >= score_threshold
        if page_label:
            context_parts.append(f"[{idx}] (page {page_label}) {content}")
            refs.append(
                {
                    "id": f"chunk-{match['id']}",
                    "label": f"p.{page_label}",
                    "aboveThreshold": above_threshold,
                }
            )
            if match_id:
                ref_map[match_id] = {
                    "id": f"chunk-{match['id']}",
                    "label": f"p.{page_label}",
                    "aboveThreshold": above_threshold,
                }
        else:
            context_parts.append(f"[{idx}] {content}")
            refs.append(
                {
                    "id": f"chunk-{match['id']}",
                    "label": str(idx),
                    "aboveThreshold": above_threshold,
                }
            )
            if match_id:
                ref_map[match_id] = {
                    "id": f"chunk-{match['id']}",
                    "label": str(idx),
                    "aboveThreshold": above_threshold,
                }

    if memory_lines:
        context_parts.insert(
            0,
            "Conversation (last 2 turns):\n" + "\n".join(memory_lines),
        )

    context_parts.insert(
        0,
        "System:\n"
        "あなたはPDF横断検索を行うアシスタントです。\n"
        "ユーザーの質問に対し、与えられたコンテキストと確定している事実，一般常識だけを根拠に答えてください。\n"
        "推測で補完しないでください。\n"
        "\n"
        "Instruction:\n"
        "- 参照した場合は [@:chunk-{id}] を文中に挿入してください。\n"
        "- 参照は複数可、段落末尾に付けてください。\n",
    )
    model = _build_model(settings, payload.mode)

    answer_parts: list[str] = []
    usage = None
    parser_error: str | None = None
    try:
        async for event in parser.stream_answer(
            question=message,
            context="\n\n".join(context_parts),
            model=model,
        ):
            event_type = event.get("type")
            if event_type == "delta":
                delta = str(event.get("delta") or "")
                if delta:
                    answer_parts.append(delta)
                    await websocket.send_text(json.dumps({"type": "delta", "delta": delta}))
            elif event_type == "usage":
                usage = event.get("usage")
                await websocket.send_text(json.dumps({"type": "usage", "usage": usage}))
            elif event_type == "error":
                parser_error = str(event.get("message") or "Answer generation failed")
                await websocket.send_text(
                    json.dumps({"type": "error", "message": parser_error})
                )
                break
            elif event_type == "done":
                break

        answer = "".join(answer_parts).strip()
        if parser_error or not answer:
            raise RuntimeError("Answer generation failed")
        _ = _extract_tag_refs(answer, ref_map)
        final_refs = refs if refs else None
        if payload.message_id:
            saved = await repository.update_document_chat_message(
                pool,
                chat_id,
                user.user_id,
                payload.message_id,
                answer,
                "ok",
                final_refs,
            )
            if saved is None:
                await websocket.send_text(
                    json.dumps({"type": "error", "message": "Message not found"})
                )
                await websocket.close(code=1008)
                return
        else:
            saved = await repository.insert_document_chat_message(
                pool,
                chat_id,
                user.user_id,
                "assistant",
                answer,
                "ok",
                final_refs,
            )
        message_payload = {
            "id": str(saved["id"]),
            "role": saved["role"],
            "text": saved["content"],
            "status": saved.get("status"),
            "refs": saved.get("refs"),
            "createdAt": saved["created_at"].isoformat()
            if saved.get("created_at")
            else None,
        }
        await _record_usage(
            pool,
            user_id=user.user_id,
            operation="answer",
            payload={"usage": usage} if isinstance(usage, dict) else None,
            document_id=document_id,
            chat_id=chat_id,
            message_id=str(saved["id"]),
            model=model,
        )
        await websocket.send_text(
            json.dumps({"type": "message", "message": message_payload, "usage": usage})
        )
        await websocket.send_text(json.dumps({"type": "done"}))
    except WebSocketDisconnect:
        if answer_parts:
            answer = "".join(answer_parts).strip()
            _ = _extract_tag_refs(answer, ref_map)
            final_refs = refs if refs else None
            if payload.message_id:
                await repository.update_document_chat_message(
                    pool,
                    chat_id,
                    user.user_id,
                    payload.message_id,
                    answer,
                    "stopped",
                    final_refs,
                )
            else:
                await repository.insert_document_chat_message(
                    pool,
                    chat_id,
                    user.user_id,
                    "assistant",
                    answer,
                    "stopped",
                    final_refs,
                )
        return
    except Exception as exc:
        logger.exception(
            "assistant.ws failed doc=%s chat=%s model=%s message_id=%s error=%s",
            document_id,
            chat_id,
            model,
            payload.message_id,
            exc,
        )
        try:
            await websocket.send_text(
                json.dumps({"type": "error", "message": "Answer generation failed"})
            )
        except Exception:
            pass
        if payload.message_id:
            saved = await repository.update_document_chat_message(
                pool,
                chat_id,
                user.user_id,
                payload.message_id,
                "",
                "error",
                None,
            )
        else:
            saved = await repository.insert_document_chat_message(
                pool,
                chat_id,
                user.user_id,
                "assistant",
                "",
                "error",
                None,
            )
        if saved is not None:
            message_payload = {
                "id": str(saved["id"]),
                "role": saved["role"],
                "text": saved["content"],
                "status": saved.get("status"),
                "refs": saved.get("refs"),
                "createdAt": saved["created_at"].isoformat()
                if saved.get("created_at")
                else None,
            }
            await websocket.send_text(json.dumps({"type": "message", "message": message_payload}))
        await websocket.send_text(
            json.dumps(
                {
                    "type": "error",
                    "message": parser_error or "Answer generation failed",
                }
            )
        )
        await websocket.close(code=1011)


@router.get("/chats")
async def list_user_chats(
    request: Request,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    rows = await repository.list_user_chat_threads(pool, user.user_id)
    chats = []
    for row in rows:
        chats.append(
            {
                "id": str(row["id"]),
                "title": row.get("title"),
                "documentId": str(row["document_id"]),
                "documentTitle": row.get("document_title"),
                "lastMessage": row.get("last_message"),
                "updatedAt": row.get("updated_at").isoformat()
                if row.get("updated_at")
                else None,
            }
        )
    return {"chats": chats}

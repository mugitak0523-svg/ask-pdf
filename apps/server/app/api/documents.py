from __future__ import annotations

import json
import logging
from typing import Any, Literal

from fastapi import APIRouter, File, HTTPException, Request, UploadFile, status, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from app.db import repository
from app.services.auth import AuthDependency, AuthUser, get_user_from_token_app
from app.services.indexer import Indexer
from app.services.storage import StorageClient

router = APIRouter()
logger = logging.getLogger("askpdf.chat")


class ChatAnswerRequest(BaseModel):
    message: str
    message_id: str | None = None
    mode: Literal["fast", "standard", "think"] | None = None
    top_k: int | None = None


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


def _filter_matches(
    matches: list[dict[str, Any]],
    min_k: int,
    score_threshold: float,
) -> tuple[list[dict[str, Any]], float]:
    max_score = max((row.get("similarity") or 0.0) for row in matches) if matches else 0.0
    filtered = [row for row in matches if (row.get("similarity") or 0.0) >= score_threshold]
    if len(filtered) < min_k:
        filtered = matches[:min_k]
    return filtered, max_score


async def _classify_question(
    parser,
    message: str,
    settings,
) -> Literal["pdf", "general"]:
    model = settings.chat_model_fast or settings.chat_model_standard or None
    prompt = (
        "You are a classifier. Decide if the user question needs the PDF document to answer.\n"
        "Return exactly one token: pdf or general."
    )
    try:
        result = await parser.create_answer(
            question=message,
            context=prompt,
            model=model,
        )
        label = str(result.get("answer") or "").strip().lower()
    except Exception:
        return "pdf"
    if label.startswith("general"):
        return "general"
    if label.startswith("pdf"):
        return "pdf"
    return "pdf"


@router.post("/documents/index")
async def index_document(
    request: Request,
    file: UploadFile = File(...),
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    content = await file.read()
    indexer: Indexer = request.app.state.indexer
    pool = request.app.state.db_pool
    return await indexer.index_document(pool, content, file.filename, user.user_id)


@router.get("/documents")
async def list_documents(
    request: Request,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    rows = await repository.list_documents(pool, user.user_id)
    return {"documents": rows}


@router.get("/documents/{document_id}")
async def get_document(
    request: Request,
    document_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    row = await repository.get_document(pool, document_id, user.user_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return row


@router.get("/documents/{document_id}/signed-url")
async def get_document_signed_url(
    request: Request,
    document_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, str]:
    pool = request.app.state.db_pool
    row = await repository.get_document(pool, document_id, user.user_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    storage_client: StorageClient = request.app.state.storage_client
    signed_url = storage_client.create_signed_url(str(row["storage_path"]))
    if not signed_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create signed URL",
        )
    return {"signed_url": signed_url}


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


@router.get("/documents/{document_id}/annotations")
async def get_document_annotations(
    request: Request,
    document_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    row = await repository.get_document(pool, document_id, user.user_id)
    if not row:
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
    row = await repository.get_document(pool, document_id, user.user_id)
    if not row:
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
    row = await repository.get_document(pool, document_id, user.user_id)
    if not row:
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
    row = await repository.get_document(pool, document_id, user.user_id)
    if not row:
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
    pool = request.app.state.db_pool
    row = await repository.get_document(pool, document_id, user.user_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    threads = await repository.list_document_chat_threads(pool, document_id, user.user_id)
    return {"chats": threads}


@router.post("/documents/{document_id}/chats")
async def create_document_chat(
    request: Request,
    document_id: str,
    payload: dict[str, Any],
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    row = await repository.get_document(pool, document_id, user.user_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    title = payload.get("title") if isinstance(payload, dict) else None
    chat_id = await repository.insert_document_chat_thread(
        pool,
        document_id,
        user.user_id,
        title if isinstance(title, str) else None,
    )
    return {"chat_id": chat_id}


@router.get("/documents/{document_id}/chats/{chat_id}/messages")
async def list_document_chat_messages(
    request: Request,
    document_id: str,
    chat_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    row = await repository.get_document(pool, document_id, user.user_id)
    if not row:
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
    return {"messages": messages}


@router.post("/documents/{document_id}/chats/{chat_id}/messages")
async def create_document_chat_message(
    request: Request,
    document_id: str,
    chat_id: str,
    payload: dict[str, Any],
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    row = await repository.get_document(pool, document_id, user.user_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
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
    row = await repository.insert_document_chat_message(
        pool,
        chat_id,
        user.user_id,
        role,
        text,
        "ok",
        refs if isinstance(refs, list) else None,
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
    pool = request.app.state.db_pool
    row = await repository.get_document(pool, document_id, user.user_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    thread = await repository.get_document_chat_thread(
        pool,
        document_id,
        chat_id,
        user.user_id,
    )
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    message = payload.message.strip()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="message is required",
        )

    parser = request.app.state.parser_client
    embed_payload = await parser.embed_text(message)
    embedding = embed_payload.get("embedding") or embed_payload.get("data")
    if isinstance(embedding, dict):
        embedding = embedding.get("embedding")
    if not isinstance(embedding, list):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid embedding response",
        )

    settings = request.app.state.settings
    top_k, min_k, score_threshold = _resolve_rag_params(settings, payload)
    matches = await repository.match_documents(
        pool,
        query_embedding=embedding,
        match_count=top_k,
        document_id=document_id,
    )
    filtered, max_score = _filter_matches(matches, min_k, score_threshold)
    if max_score < score_threshold:
        classification = await _classify_question(parser, message, settings)
        if classification == "general":
            matches = []
        else:
            fallback_threshold = max(score_threshold * 1, 0.0)
            matches, _ = _filter_matches(matches, min_k, fallback_threshold)
    else:
        matches = filtered

    recent_messages = await repository.list_recent_document_chat_messages(
        pool,
        chat_id,
        user.user_id,
        limit=4,
    )
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
    for idx, match in enumerate(matches, start=1):
        content = str(match.get("content") or "")
        meta = match.get("metadata") or {}
        page_label = _page_label(meta) if isinstance(meta, dict) else None
        if page_label:
            context_parts.append(f"[{idx}] (page {page_label}) {content}")
            refs.append(
                {
                    "id": f"chunk-{match['id']}",
                    "label": f"p.{page_label}",
                }
            )
        else:
            context_parts.append(f"[{idx}] {content}")
            refs.append(
                {
                    "id": f"chunk-{match['id']}",
                    "label": str(idx),
                }
            )

    if memory_lines:
        context_parts.insert(
            0,
            "Conversation (last 2 turns):\n" + "\n".join(memory_lines),
        )

    settings = request.app.state.settings
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
        if payload.message_id:
            saved = await repository.update_document_chat_message(
                pool,
                chat_id,
                user.user_id,
                payload.message_id,
                answer,
                "ok",
                refs if refs else None,
            )
            if saved is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Message not found",
                )
        else:
            saved = await repository.insert_document_chat_message(
                pool,
                chat_id,
                user.user_id,
                "assistant",
                answer,
                "ok",
                refs if refs else None,
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
    row = await repository.get_document(pool, document_id, user.user_id)
    if not row:
        await websocket.close(code=1008)
        return
    thread = await repository.get_document_chat_thread(
        pool,
        document_id,
        chat_id,
        user.user_id,
    )
    if not thread:
        await websocket.close(code=1008)
        return

    try:
        raw = await websocket.receive_text()
    except WebSocketDisconnect:
        return
    try:
        payload = ChatAnswerRequest(**json.loads(raw))
    except Exception:
        await websocket.close(code=1008)
        return

    message = payload.message.strip()
    if not message:
        await websocket.close(code=1008)
        return

    parser = websocket.scope["app"].state.parser_client
    embed_payload = await parser.embed_text(message)
    embedding = embed_payload.get("embedding") or embed_payload.get("data")
    if isinstance(embedding, dict):
        embedding = embedding.get("embedding")
    if not isinstance(embedding, list):
        await websocket.close(code=1011)
        return

    settings = websocket.scope["app"].state.settings
    top_k, min_k, score_threshold = _resolve_rag_params(settings, payload)
    matches = await repository.match_documents(
        pool,
        query_embedding=embedding,
        match_count=top_k,
        document_id=document_id,
    )
    filtered, max_score = _filter_matches(matches, min_k, score_threshold)
    if max_score < score_threshold:
        classification = await _classify_question(parser, message, settings)
        if classification == "general":
            matches = []
        else:
            fallback_threshold = max(score_threshold * 1, 0.0)
            matches, _ = _filter_matches(matches, min_k, fallback_threshold)
    else:
        matches = filtered

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
    for idx, match in enumerate(matches, start=1):
        content = str(match.get("content") or "")
        meta = match.get("metadata") or {}
        page_label = _page_label(meta) if isinstance(meta, dict) else None
        if page_label:
            context_parts.append(f"[{idx}] (page {page_label}) {content}")
            refs.append(
                {
                    "id": f"chunk-{match['id']}",
                    "label": f"p.{page_label}",
                }
            )
        else:
            context_parts.append(f"[{idx}] {content}")
            refs.append(
                {
                    "id": f"chunk-{match['id']}",
                    "label": str(idx),
                }
            )

    if memory_lines:
        context_parts.insert(
            0,
            "Conversation (last 2 turns):\n" + "\n".join(memory_lines),
        )

    model = _build_model(settings, payload.mode)

    answer_parts: list[str] = []
    usage = None
    parser_error: str | None = None
    try:
        logger.info(
            "assistant.ws start doc=%s chat=%s model=%s question_len=%s context_len=%s",
            document_id,
            chat_id,
            model,
            len(message),
            len("\n\n".join(context_parts)),
        )
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
        if payload.message_id:
            saved = await repository.update_document_chat_message(
                pool,
                chat_id,
                user.user_id,
                payload.message_id,
                answer,
                "ok",
                refs if refs else None,
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
                refs if refs else None,
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
        await websocket.send_text(
            json.dumps({"type": "message", "message": message_payload, "usage": usage})
        )
        await websocket.send_text(json.dumps({"type": "done"}))
    except WebSocketDisconnect:
        if answer_parts:
            answer = "".join(answer_parts).strip()
            if payload.message_id:
                await repository.update_document_chat_message(
                    pool,
                    chat_id,
                    user.user_id,
                    payload.message_id,
                    answer,
                    "stopped",
                    refs if refs else None,
                )
            else:
                await repository.insert_document_chat_message(
                    pool,
                    chat_id,
                    user.user_id,
                    "assistant",
                    answer,
                    "stopped",
                    refs if refs else None,
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

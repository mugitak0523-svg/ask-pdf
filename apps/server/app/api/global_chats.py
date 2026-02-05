from __future__ import annotations

import logging
import math
import re
from typing import Any, Literal

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel

from app.db import repository
from app.services.auth import AuthDependency, AuthUser
from app.services.plans import get_plan_limits, resolve_user_plan
from app.services.usage import extract_usage

router = APIRouter()
logger = logging.getLogger("askpdf.global_chat")


class GlobalChatMessageRequest(BaseModel):
    text: str
    role: Literal["user", "assistant"] = "user"
    refs: list[dict[str, Any]] | None = None


class ChatAnswerRequest(BaseModel):
    message: str
    message_id: str | None = None
    mode: Literal["fast", "standard", "think"] | None = None
    top_k: int | None = None


class CreateGlobalChatRequest(BaseModel):
    title: str | None = None


ChatAnswerRequest.model_rebuild()


def _build_model(settings, mode: str | None) -> str | None:
    if mode == "fast":
        return settings.chat_model_fast
    if mode == "think":
        return settings.chat_model_think
    if mode == "standard":
        return settings.chat_model_standard
    return None


def _resolve_rag_params(
    settings,
    payload: ChatAnswerRequest,
    document_count: int,
) -> tuple[int, int, float]:
    if payload.top_k is not None:
        top_k = payload.top_k
    else:
        base = max(int(settings.rag_top_k), 1)
        alpha = 2
        k_max = 40
        top_k = base + math.ceil(alpha * math.sqrt(max(document_count, 0)))
    top_k = min(max(int(top_k), 1), 40)
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


def _split_matches(
    matches: list[dict[str, Any]],
    min_k: int,
    score_threshold: float,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    filtered = [row for row in matches if (row.get("similarity") or 0.0) >= score_threshold]
    if len(filtered) < min_k:
        return matches[:min_k], filtered
    return filtered, filtered


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
            global_chat_id=chat_id,
            global_message_id=message_id,
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


async def _enforce_message_limit(pool, user_id: str, chat_id: str) -> None:
    _, limits = await _resolve_limits(pool, user_id)
    if limits.max_messages_per_thread is None:
        return
    count = await repository.count_global_chat_messages(pool, chat_id, user_id, role="user")
    if count >= limits.max_messages_per_thread:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Message limit reached",
        )


@router.get("/global-chats")
async def list_global_chats(
    request: Request,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    rows = await repository.list_global_chat_threads(pool, user.user_id)
    return {"chats": rows}


@router.post("/global-chats")
async def create_global_chat(
    request: Request,
    payload: CreateGlobalChatRequest,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    row = await repository.create_global_chat_thread(pool, user.user_id, payload.title)
    return {"chat_id": str(row["id"]), "title": row.get("title")}


@router.patch("/global-chats/{chat_id}")
async def update_global_chat(
    request: Request,
    chat_id: str,
    payload: CreateGlobalChatRequest,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    title = (payload.title or "").strip()
    if not title:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="title is required")
    pool = request.app.state.db_pool
    row = await repository.update_global_chat_thread_title(pool, chat_id, user.user_id, title)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return {"chat": row}


@router.delete("/global-chats/{chat_id}")
async def delete_global_chat(
    request: Request,
    chat_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    row = await repository.delete_global_chat_thread(pool, chat_id, user.user_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return {"chat_id": chat_id}


@router.get("/global-chats/{chat_id}/messages")
async def list_global_chat_messages(
    request: Request,
    chat_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    thread = await repository.get_global_chat_thread(pool, chat_id, user.user_id)
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    rows = await repository.list_global_chat_messages(pool, chat_id, user.user_id)
    messages = [
        {
            "id": str(item["id"]),
            "role": item["role"],
            "text": item["content"],
            "status": item.get("status"),
            "refs": item.get("refs"),
            "createdAt": item["created_at"].isoformat() if item.get("created_at") else None,
        }
        for item in rows
    ]
    return {"messages": messages}


@router.post("/global-chats/{chat_id}/messages")
async def create_global_chat_message(
    request: Request,
    chat_id: str,
    payload: GlobalChatMessageRequest,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    thread = await repository.get_global_chat_thread(pool, chat_id, user.user_id)
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    role = payload.role
    text = payload.text
    if role != "user":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="role must be user")
    if not isinstance(text, str) or not text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="text is required")
    await _enforce_message_limit(pool, user.user_id, chat_id)
    row = await repository.insert_global_chat_message(
        pool,
        chat_id,
        user.user_id,
        "user",
        text.strip(),
        "ok",
        payload.refs if isinstance(payload.refs, list) else None,
    )
    return {
        "message": {
            "id": str(row["id"]),
            "role": row["role"],
            "text": row["content"],
            "status": row.get("status"),
            "refs": row.get("refs"),
            "createdAt": row["created_at"].isoformat() if row.get("created_at") else None,
        }
    }


@router.post("/global-chats/{chat_id}/assistant")
async def create_global_chat_assistant_message(
    request: Request,
    chat_id: str,
    payload: ChatAnswerRequest,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    thread = await repository.get_global_chat_thread(pool, chat_id, user.user_id)
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    message = payload.message.strip()
    if not message:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="message is required")

    parser = request.app.state.parser_client
    embed_payload = await parser.embed_text(message)
    await _record_usage(
        pool,
        user_id=user.user_id,
        operation="embed",
        payload=embed_payload if isinstance(embed_payload, dict) else None,
        chat_id=chat_id,
    )
    embedding = _extract_embedding(embed_payload)
    if not isinstance(embedding, list):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid embedding response",
        )

    settings = request.app.state.settings
    document_count = await repository.count_documents(pool, user.user_id)
    top_k, min_k, score_threshold = _resolve_rag_params(settings, payload, document_count)
    matches = await repository.match_user_documents(
        pool,
        user_id=user.user_id,
        query_embedding=embedding,
        match_count=min(top_k * 3, 120),
    )
    context_matches, ref_matches = _split_matches(matches, min_k, score_threshold)
    # expand with extra matches so "effective" count reaches top_k
    def _doc_bucket_count(count: int) -> int:
        if count <= 0:
            return 0
        if count <= 2:
            return 1
        if count <= 5:
            return 2
        return 3

    def _effective_count(items: list[dict[str, Any]]) -> int:
        counts: dict[str, int] = {}
        for item in items:
            doc_id = str(item.get("document_id") or "")
            counts[doc_id] = counts.get(doc_id, 0) + 1
        return sum(_doc_bucket_count(value) for value in counts.values())

    if context_matches:
        effective = _effective_count(context_matches)
        if effective < top_k:
            extras = []
            used_ids = {str(item.get("id") or "") for item in context_matches}
            for item in matches:
                item_id = str(item.get("id") or "")
                if not item_id or item_id in used_ids:
                    continue
                extras.append(item)
                effective = _effective_count(context_matches + extras)
                if effective >= top_k:
                    break
            if extras:
                context_matches = context_matches + extras

    recent_messages = await repository.list_global_chat_messages(
        pool,
        chat_id,
        user.user_id,
    )
    memory_lines: list[str] = []
    for item in recent_messages[-4:]:
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
        doc_title = str(match.get("document_title") or "Document")
        doc_id = str(match.get("document_id") or "")
        match_id = str(match.get("id") or "").lower()
        above_threshold = (match.get("similarity") or 0.0) >= score_threshold
        if page_label:
            context_parts.append(f"[{idx}] ({doc_title} p.{page_label}) {content}")
            refs.append(
                {
                    "id": f"chunk-{match['id']}",
                    "label": f"{doc_title} p.{page_label}",
                    "documentId": doc_id,
                    "aboveThreshold": above_threshold,
                }
            )
            if match_id:
                ref_map[match_id] = {
                    "id": f"chunk-{match['id']}",
                    "label": f"{doc_title} p.{page_label}",
                    "documentId": doc_id,
                    "aboveThreshold": above_threshold,
                }
        else:
            context_parts.append(f"[{idx}] ({doc_title}) {content}")
            refs.append(
                {
                    "id": f"chunk-{match['id']}",
                    "label": f"{doc_title}",
                    "documentId": doc_id,
                    "aboveThreshold": above_threshold,
                }
            )
            if match_id:
                ref_map[match_id] = {
                    "id": f"chunk-{match['id']}",
                    "label": f"{doc_title}",
                    "documentId": doc_id,
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
        final_refs = refs if refs else None
        if payload.message_id:
            saved = await repository.update_global_chat_message(
                pool,
                chat_id,
                user.user_id,
                payload.message_id,
                answer,
                "ok",
                final_refs,
            )
            if saved is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
        else:
            saved = await repository.insert_global_chat_message(
                pool,
                chat_id,
                user.user_id,
                "assistant",
                answer,
                "ok",
                final_refs,
            )
        await _record_usage(
            pool,
            user_id=user.user_id,
            operation="answer",
            payload=answer_payload if isinstance(answer_payload, dict) else None,
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
                "createdAt": saved["created_at"].isoformat() if saved.get("created_at") else None,
            },
            "usage": answer_payload.get("usage"),
        }
    except Exception:
        if payload.message_id:
            saved = await repository.update_global_chat_message(
                pool,
                chat_id,
                user.user_id,
                payload.message_id,
                "",
                "error",
                None,
            )
        else:
            saved = await repository.insert_global_chat_message(
                pool,
                chat_id,
                user.user_id,
                "assistant",
                "",
                "error",
                None,
            )
        if saved is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
        return {
            "message": {
                "id": str(saved["id"]),
                "role": saved["role"],
                "text": saved["content"],
                "status": saved.get("status"),
                "refs": saved.get("refs"),
                "createdAt": saved["created_at"].isoformat() if saved.get("created_at") else None,
            }
        }

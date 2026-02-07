from __future__ import annotations

from typing import Any
import logging

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel

from app.db import repository
from app.services.auth import AuthDependency, AuthUser
from app.services.usage import extract_usage

router = APIRouter()
logger = logging.getLogger("askpdf.search")


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5
    document_id: str | None = None


class EmbeddingRequest(BaseModel):
    text: str
    document_id: str | None = None


@router.post("/search")
async def search(
    request: Request,
    payload: SearchRequest,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    parser = request.app.state.parser_client
    embed_payload = await parser.embed_text(payload.query)
    input_tokens, output_tokens, total_tokens, raw_usage = extract_usage(embed_payload)
    embedding = embed_payload.get("embedding") or embed_payload.get("data")
    if isinstance(embedding, dict):
        embedding = embedding.get("embedding")
    if not isinstance(embedding, list):
        raise ValueError("Invalid embedding response")

    pool = request.app.state.db_pool
    if raw_usage is not None or total_tokens is not None:
        try:
            await repository.insert_usage_log(
                pool,
                user_id=user.user_id,
                operation="embed",
                document_id=payload.document_id,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                total_tokens=total_tokens,
                raw_usage=raw_usage,
            )
        except Exception:
            logger.exception("usage_log failed operation=embed")
    if payload.document_id:
        owned = await repository.get_document(pool, payload.document_id, user.user_id)
        if not owned:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    rows = await repository.match_documents(
        pool,
        query_embedding=embedding,
        match_count=payload.top_k,
        document_id=payload.document_id,
    )
    return {"matches": rows}


@router.post("/embeddings")
async def embeddings(
    request: Request,
    payload: EmbeddingRequest,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="text is required")
    parser = request.app.state.parser_client
    embed_payload = await parser.embed_text(text)
    input_tokens, output_tokens, total_tokens, raw_usage = extract_usage(embed_payload)
    embedding = embed_payload.get("embedding") or embed_payload.get("data")
    if isinstance(embedding, dict):
        embedding = embedding.get("embedding")
    if not isinstance(embedding, list):
        raise ValueError("Invalid embedding response")
    pool = request.app.state.db_pool
    if raw_usage is not None or total_tokens is not None:
        try:
            await repository.insert_usage_log(
                pool,
                user_id=user.user_id,
                operation="embed",
                document_id=payload.document_id,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                total_tokens=total_tokens,
                raw_usage=raw_usage,
            )
        except Exception:
            logger.exception("usage_log failed operation=embed")
    return {"embedding": embedding, "usage": embed_payload.get("usage")}

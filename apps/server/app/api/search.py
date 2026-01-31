from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel

from app.db import repository
from app.services.auth import AuthDependency, AuthUser

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5
    document_id: str | None = None


@router.post("/search")
async def search(
    request: Request,
    payload: SearchRequest,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    parser = request.app.state.parser_client
    embed_payload = await parser.embed_text(payload.query)
    embedding = embed_payload.get("embedding") or embed_payload.get("data")
    if isinstance(embedding, dict):
        embedding = embedding.get("embedding")
    if not isinstance(embedding, list):
        raise ValueError("Invalid embedding response")

    pool = request.app.state.db_pool
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

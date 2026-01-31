from __future__ import annotations

from typing import Any

from fastapi import APIRouter, File, HTTPException, Request, UploadFile, status

from app.db import repository
from app.services.auth import AuthDependency, AuthUser
from app.services.indexer import Indexer

router = APIRouter()


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

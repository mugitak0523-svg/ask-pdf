from __future__ import annotations

from typing import Any

from fastapi import APIRouter, File, Request, UploadFile

from app.services.indexer import Indexer

router = APIRouter()


@router.post("/documents/index")
async def index_document(request: Request, file: UploadFile = File(...)) -> dict[str, Any]:
    content = await file.read()
    indexer: Indexer = request.app.state.indexer
    pool = request.app.state.db_pool
    return await indexer.index_document(pool, content, file.filename)

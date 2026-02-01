from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, File, HTTPException, Request, UploadFile, status

from app.db import repository
from app.services.auth import AuthDependency, AuthUser
from app.services.indexer import Indexer
from app.services.storage import StorageClient

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
        refs if isinstance(refs, list) else None,
    )
    return {
        "message": {
            "id": str(row["id"]),
            "role": row["role"],
            "text": row["content"],
            "refs": row.get("refs"),
            "createdAt": row["created_at"].isoformat()
            if row.get("created_at")
            else None,
        }
    }


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

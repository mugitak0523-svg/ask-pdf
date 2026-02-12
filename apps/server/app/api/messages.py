from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Request, status

from app.db import repository
from app.services.auth import AuthDependency, AuthUser


router = APIRouter()


@router.get("/messages/announcements")
async def list_announcements(
    request: Request,
    limit: int = 20,
    offset: int = 0,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    items = await repository.list_published_announcements(
        request.app.state.db_pool,
        limit=limit,
        offset=offset,
    )
    return {"announcements": items}


@router.get("/messages/support")
async def list_support_messages(
    request: Request,
    limit: int = 50,
    offset: int = 0,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    items = await repository.list_user_messages(
        request.app.state.db_pool,
        user_id=user.user_id,
        limit=limit,
        offset=offset,
    )
    return {"messages": items}


@router.post("/messages/support")
async def create_support_message(
    request: Request,
    payload: dict[str, Any],
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    content = str(payload.get("content") or "").strip()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing content")
    row = await repository.create_user_message(
        request.app.state.db_pool,
        user_id=user.user_id,
        direction="user",
        content=content,
        admin_id=None,
    )
    return {"message": row}


@router.post("/messages/feedback")
async def create_feedback(
    request: Request,
    payload: dict[str, Any],
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    category = str(payload.get("category") or "").strip()
    message = str(payload.get("message") or "").strip()
    if not category or not message:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing category/message")
    row = await repository.create_user_feedback(
        request.app.state.db_pool,
        user_id=user.user_id,
        category=category,
        message=message,
    )
    return {"feedback": row}

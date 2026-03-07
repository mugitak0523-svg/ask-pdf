from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, Request, status

from app.db import repository
from app.services.auth import AuthDependency, AuthUser


router = APIRouter()


def _ensure_admin(request: Request, user: AuthUser) -> None:
    if user.is_guest:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    admin_ids = getattr(request.app.state.settings, "admin_user_ids", []) or []
    if user.user_id not in admin_ids:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")


@router.get("/admin/me")
async def admin_me(
    request: Request,
    user: AuthUser = AuthDependency,
) -> dict[str, bool]:
    admin_ids = getattr(request.app.state.settings, "admin_user_ids", []) or []
    return {"isAdmin": bool(user.user_id in admin_ids and not user.is_guest)}


@router.get("/admin/users")
async def list_users(
    request: Request,
    limit: int = 50,
    offset: int = 0,
    q: str | None = None,
    user_type: str | None = None,
    plan: str | None = None,
    stripe_status: str | None = None,
    unread: str | None = None,
    active_days: int | None = None,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    _ensure_admin(request, user)
    has_unread: bool | None = None
    unread_value = (unread or "").strip().lower()
    if unread_value in {"only", "unread", "true", "1", "yes"}:
        has_unread = True
    elif unread_value in {"none", "read", "false", "0", "no"}:
        has_unread = False
    rows, total = await repository.list_users_admin(
        request.app.state.db_pool,
        limit=limit,
        offset=offset,
        query=q,
        user_type=user_type,
        plan=plan,
        stripe_status=stripe_status,
        has_unread=has_unread,
        active_days=active_days,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return {"users": rows, "total": total, "limit": limit, "offset": offset}


@router.get("/admin/users/{user_id}")
async def get_user_detail(
    request: Request,
    user_id: str,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    _ensure_admin(request, user)
    row = await repository.get_user_detail_admin(request.app.state.db_pool, user_id=user_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    usage_daily = await repository.list_usage_daily_admin(
        request.app.state.db_pool,
        user_id=user_id,
        days=30,
    )
    return {"user": row, "usageDaily": usage_daily}


@router.get("/admin/overview")
async def get_overview(
    request: Request,
    period: str | None = None,
    days: int | None = None,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    _ensure_admin(request, user)
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    key = (period or "").strip().lower()
    if not key:
        key = "custom_days" if days is not None else "30d"

    start_at: datetime | None
    end_at: datetime = now
    if key == "today":
        start_at = today_start
    elif key == "yesterday":
        start_at = today_start - timedelta(days=1)
        end_at = today_start
    elif key == "7d":
        start_at = today_start - timedelta(days=6)
    elif key == "30d":
        start_at = today_start - timedelta(days=29)
    elif key == "all":
        start_at = None
    elif key == "custom_days":
        safe_days = max(1, min(int(days or 30), 365))
        start_at = today_start - timedelta(days=safe_days - 1)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid period")

    payload = await repository.get_admin_overview(
        request.app.state.db_pool,
        start_at=start_at,
        end_at=end_at,
        period_key=key,
        parse_cost_per_page_usd=10.0 / 1000.0,
    )
    return payload


@router.get("/admin/announcements")
async def list_announcements(
    request: Request,
    status: str | None = None,
    limit: int = 50,
    offset: int = 0,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    _ensure_admin(request, user)
    items = await repository.list_admin_announcements(
        request.app.state.db_pool,
        status=status,
        limit=limit,
        offset=offset,
    )
    return {"announcements": items}


@router.post("/admin/announcements")
async def create_announcement(
    request: Request,
    payload: dict[str, Any],
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    _ensure_admin(request, user)
    title = str(payload.get("title") or "").strip()
    body = str(payload.get("body") or "").strip()
    publish = bool(payload.get("publish"))
    if not title or not body:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing title/body")
    status_value = "published" if publish else "draft"
    published_at = datetime.now(timezone.utc) if publish else None
    row = await repository.create_admin_announcement(
        request.app.state.db_pool,
        title=title,
        body=body,
        status=status_value,
        created_by=user.user_id,
        published_at=published_at,
    )
    return {"announcement": row}


@router.get("/admin/messages")
async def list_messages(
    request: Request,
    user_id: str,
    limit: int = 50,
    offset: int = 0,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    _ensure_admin(request, user)
    items = await repository.list_user_messages(
        request.app.state.db_pool,
        user_id=user_id,
        limit=limit,
        offset=offset,
    )
    return {"messages": items}


@router.post("/admin/messages")
async def send_message(
    request: Request,
    payload: dict[str, Any],
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    _ensure_admin(request, user)
    user_id = str(payload.get("user_id") or "").strip()
    content = str(payload.get("content") or "").strip()
    if not user_id or not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing user_id/content")
    row = await repository.create_user_message(
        request.app.state.db_pool,
        user_id=user_id,
        direction="admin",
        content=content,
        admin_id=user.user_id,
    )
    return {"message": row}


@router.post("/admin/messages/{message_id}/read")
async def mark_message_read(
    request: Request,
    message_id: str,
    payload: dict[str, Any],
    user: AuthUser = AuthDependency,
) -> dict[str, str]:
    _ensure_admin(request, user)
    read = bool(payload.get("read"))
    await repository.set_user_message_read_admin(
        request.app.state.db_pool,
        message_id=message_id,
        read=read,
    )
    return {"status": "ok"}


@router.get("/admin/messages/unread")
async def get_unread_messages_count(
    request: Request,
    user: AuthUser = AuthDependency,
) -> dict[str, int]:
    _ensure_admin(request, user)
    count = await repository.get_unread_messages_count_admin(request.app.state.db_pool)
    return {"count": count}


@router.get("/admin/feedback")
async def list_feedback(
    request: Request,
    limit: int = 50,
    offset: int = 0,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    _ensure_admin(request, user)
    items = await repository.list_feedback_admin(
        request.app.state.db_pool,
        limit=limit,
        offset=offset,
    )
    return {"feedback": items}


@router.get("/admin/feedback/unread")
async def get_unread_feedback_count(
    request: Request,
    user: AuthUser = AuthDependency,
) -> dict[str, int]:
    _ensure_admin(request, user)
    count = await repository.get_unread_feedback_count_admin(request.app.state.db_pool)
    return {"count": count}


@router.post("/admin/feedback/{feedback_id}/read")
async def mark_feedback_read(
    request: Request,
    feedback_id: str,
    payload: dict[str, Any],
    user: AuthUser = AuthDependency,
) -> dict[str, str]:
    _ensure_admin(request, user)
    read = bool(payload.get("read"))
    await repository.set_feedback_read_admin(
        request.app.state.db_pool,
        feedback_id=feedback_id,
        read=read,
    )
    return {"status": "ok"}

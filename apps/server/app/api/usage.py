from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Request

from app.db import repository
from app.services.auth import AuthDependency, AuthUser
from app.services.plans import get_plan_limits, resolve_user_plan

router = APIRouter()


def _month_window(now: datetime) -> tuple[datetime, datetime]:
    start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if start.month == 12:
        end = start.replace(year=start.year + 1, month=1)
    else:
        end = start.replace(month=start.month + 1)
    return start, end


def _with_cost(payload: dict[str, Any]) -> dict[str, Any]:
    return {
        **payload,
        "costYen": None,
        "costNote": "料金プラン未設定",
    }


@router.get("/usage/summary")
async def get_usage_summary(
    request: Request,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    now = datetime.now(timezone.utc)
    start, end = _month_window(now)
    current = await repository.get_usage_summary(pool, user.user_id, start, end)
    all_time = await repository.get_usage_summary(pool, user.user_id, None, None)
    return {
        "current": _with_cost(
            {
                "periodStart": start.isoformat(),
                "periodEnd": end.isoformat(),
                **current,
            }
        ),
        "allTime": _with_cost(
            {
                "periodStart": None,
                "periodEnd": None,
                **all_time,
            }
        ),
    }


@router.get("/usage/messages/daily")
async def get_daily_message_usage(
    request: Request,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    now = datetime.now(timezone.utc)
    day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    used = await repository.count_user_ok_answers_since(pool, user.user_id, day_start)
    if user.is_guest:
        plan = "guest"
    else:
        plan = await resolve_user_plan(pool, user.user_id)
    limits = get_plan_limits(plan)
    return {
        "used": used,
        "limit": limits.max_messages_per_thread,
        "periodStart": day_start.isoformat(),
    }

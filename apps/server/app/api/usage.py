from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Request

from app.db import repository
from app.services.auth import AuthDependency, AuthUser

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

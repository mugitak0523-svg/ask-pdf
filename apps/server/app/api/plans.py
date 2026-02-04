from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Request

from app.services.auth import AuthDependency, AuthUser
from app.services.plans import get_plan_limits, resolve_user_plan

router = APIRouter()


@router.get("/plans/me")
async def get_my_plan(
    request: Request,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    plan = await resolve_user_plan(pool, user.user_id)
    limits = get_plan_limits(plan)
    return {
        "plan": plan,
        "limits": {
            "maxFiles": limits.max_files,
            "maxFileMb": limits.max_file_mb,
            "maxMessagesPerThread": limits.max_messages_per_thread,
            "maxThreadsPerDocument": limits.max_threads_per_document,
        },
    }

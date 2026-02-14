from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Request

from app.services.auth import AuthDependency, AuthUser
from app.services.plans import get_plan_limits, resolve_user_plan, PLAN_LIMITS
from app.db import repository

router = APIRouter()


@router.get("/plans/me")
async def get_my_plan(
    request: Request,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    pool = request.app.state.db_pool
    if user.is_guest:
        plan = "guest"
    else:
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


@router.patch("/plans/me")
async def update_my_plan(
    request: Request,
    payload: dict[str, Any],
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    if user.is_guest:
        raise HTTPException(status_code=401, detail="Not authenticated")
    plan = str(payload.get("plan") or "").strip()
    if plan not in PLAN_LIMITS or plan == "guest":
        raise HTTPException(status_code=400, detail="Invalid plan")
    pool = request.app.state.db_pool
    await repository.set_user_plan(pool, user.user_id, plan)
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

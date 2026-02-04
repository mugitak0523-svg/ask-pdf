from __future__ import annotations

from dataclasses import dataclass

from app.db import repository


@dataclass(frozen=True)
class PlanLimits:
    max_files: int | None
    max_file_mb: int | None
    max_messages_per_thread: int | None
    max_threads_per_document: int | None


PLAN_LIMITS: dict[str, PlanLimits] = {
    "guest": PlanLimits(max_files=3, max_file_mb=10, max_messages_per_thread=10, max_threads_per_document=None),
    "free": PlanLimits(max_files=10, max_file_mb=20, max_messages_per_thread=20, max_threads_per_document=None),
    "plus": PlanLimits(max_files=50, max_file_mb=30, max_messages_per_thread=50, max_threads_per_document=5),
    "pro": PlanLimits(max_files=None, max_file_mb=50, max_messages_per_thread=None, max_threads_per_document=None),
}


def get_plan_limits(plan: str) -> PlanLimits:
    return PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])


async def resolve_user_plan(pool, user_id: str) -> str:
    plan = await repository.get_user_plan(pool, user_id)
    if plan in PLAN_LIMITS:
        return plan
    return "free"

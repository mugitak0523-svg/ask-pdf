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
    "guest": PlanLimits(max_files=1, max_file_mb=10, max_messages_per_thread=8, max_threads_per_document=None),
    "free": PlanLimits(max_files=5, max_file_mb=20, max_messages_per_thread=20, max_threads_per_document=None),
    "plus": PlanLimits(max_files=None, max_file_mb=50, max_messages_per_thread=120, max_threads_per_document=None),
}


def get_plan_limits(plan: str) -> PlanLimits:
    if plan == "pro":
        return PLAN_LIMITS["plus"]
    return PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])


async def resolve_user_plan(pool, user_id: str) -> str:
    plan = await repository.get_user_plan(pool, user_id)
    if plan == "pro":
        return "plus"
    if plan in PLAN_LIMITS:
        return plan
    return "free"

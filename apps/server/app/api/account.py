from __future__ import annotations

import logging

import httpx
from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel

from app.db import repository
from app.services.auth import AuthDependency, AuthUser
from app.services.storage import remove_storage_files

router = APIRouter()
logger = logging.getLogger("uvicorn.error")


class DeleteAccountRequest(BaseModel):
    reason: str


async def _delete_supabase_user(request: Request, user_id: str) -> None:
    settings = request.app.state.settings
    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/admin/users/{user_id}"
    headers = {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.delete(url, headers=headers)
    if response.status_code in {200, 204, 404}:
        return
    logger.error(
        "delete supabase user failed user=%s status=%s body=%s",
        user_id,
        response.status_code,
        response.text[:500],
    )
    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail="Failed to delete auth account",
    )


@router.delete("/account/me")
async def delete_my_account(
    request: Request,
    payload: DeleteAccountRequest,
    user: AuthUser = AuthDependency,
) -> dict[str, str]:
    if user.is_guest:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Guest account cannot be deleted",
        )
    pool = request.app.state.db_pool
    storage_client = request.app.state.storage_client
    reason = payload.reason.strip()
    if not reason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deletion reason is required",
        )
    if len(reason) > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deletion reason is too long",
        )
    storage_paths = await repository.list_user_document_storage_paths(pool, user.user_id)
    await repository.insert_account_deletion_log(pool, user.user_id, reason)
    await repository.delete_user_account_data(pool, user.user_id)
    remove_storage_files(storage_client, storage_paths)
    await _delete_supabase_user(request, user.user_id)
    return {"status": "ok"}

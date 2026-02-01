from __future__ import annotations

import json
from typing import Any

import asyncpg


def _vector_literal(values: list[float]) -> str:
    return "[" + ",".join(str(v) for v in values) + "]"


async def insert_document(
    pool: asyncpg.Pool,
    title: str,
    storage_path: str,
    metadata: dict[str, Any],
    result: dict[str, Any] | None = None,
    user_id: str | None = None,
) -> str:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            insert into documents (user_id, title, storage_path, metadata, result)
            values ($1, $2, $3, $4::jsonb, $5::jsonb)
            returning id
            """,
            user_id,
            title,
            storage_path,
            json.dumps(metadata),
            json.dumps(result) if result is not None else None,
        )
    return str(row["id"])


async def list_documents(
    pool: asyncpg.Pool,
    user_id: str,
) -> list[dict[str, Any]]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            select id, title, storage_path, metadata, created_at
            from documents
            where user_id = $1
            order by created_at desc
            """,
            user_id,
        )
    return [dict(row) for row in rows]


async def get_document(
    pool: asyncpg.Pool,
    document_id: str,
    user_id: str,
) -> dict[str, Any] | None:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            select id, title, storage_path, metadata, result, created_at
            from documents
            where id = $1 and user_id = $2
            """,
            document_id,
            user_id,
        )
    return dict(row) if row else None


async def insert_chunks(
    pool: asyncpg.Pool,
    document_id: str,
    chunks: list[dict[str, Any]],
) -> int:
    if not chunks:
        return 0

    records: list[tuple[Any, ...]] = []
    for chunk in chunks:
        embedding = chunk.get("embedding")
        metadata = chunk.get("metadata", {})
        content = chunk.get("content") or chunk.get("text", "")
        if embedding is None:
            continue
        records.append(
            (
                document_id,
                content,
                _vector_literal(embedding),
                json.dumps(metadata),
            )
        )

    if not records:
        return 0

    async with pool.acquire() as conn:
        await conn.executemany(
            """
            insert into document_chunks (document_id, content, embedding, metadata)
            values ($1, $2, $3::vector, $4::jsonb)
            """,
            records,
        )
    return len(records)


async def match_documents(
    pool: asyncpg.Pool,
    query_embedding: list[float],
    match_count: int = 5,
    document_id: str | None = None,
) -> list[dict[str, Any]]:
    vector_literal = _vector_literal(query_embedding)
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            select * from match_documents($1::vector, $2, $3::uuid)
            """,
            vector_literal,
            match_count,
            document_id,
        )
    return [dict(row) for row in rows]


async def get_document_annotations(
    pool: asyncpg.Pool,
    document_id: str,
    user_id: str,
) -> dict[str, Any] | None:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            select data
            from document_annotations
            where document_id = $1 and user_id = $2
            """,
            document_id,
            user_id,
        )
    return dict(row) if row else None


async def upsert_document_annotations(
    pool: asyncpg.Pool,
    document_id: str,
    user_id: str,
    data: dict[str, Any],
) -> None:
    async with pool.acquire() as conn:
        await conn.execute(
            """
            insert into document_annotations (document_id, user_id, data)
            values ($1, $2, $3::jsonb)
            on conflict (document_id, user_id)
            do update set data = excluded.data
            """,
            document_id,
            user_id,
            json.dumps(data),
        )

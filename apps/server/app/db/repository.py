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


async def get_document_chat(
    pool: asyncpg.Pool,
    document_id: str,
    user_id: str,
) -> dict[str, Any] | None:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            select data
            from document_chats
            where document_id = $1 and user_id = $2
            """,
            document_id,
            user_id,
        )
    return dict(row) if row else None


async def upsert_document_chat(
    pool: asyncpg.Pool,
    document_id: str,
    user_id: str,
    data: dict[str, Any],
) -> None:
    async with pool.acquire() as conn:
        await conn.execute(
            """
            insert into document_chats (document_id, user_id, data)
            values ($1, $2, $3::jsonb)
            on conflict (document_id, user_id)
            do update set data = excluded.data
            """,
            document_id,
            user_id,
            json.dumps(data),
        )


async def list_document_chat_threads(
    pool: asyncpg.Pool,
    document_id: str,
    user_id: str,
) -> list[dict[str, Any]]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            select
                id,
                title,
                created_at,
                updated_at,
                (
                    select content
                    from document_chat_messages
                    where chat_id = document_chat_threads.id
                      and user_id = $2
                    order by created_at desc
                    limit 1
                ) as last_message
            from document_chat_threads
            where document_id = $1 and user_id = $2
            order by updated_at desc, created_at desc
            """,
            document_id,
            user_id,
        )
    return [dict(row) for row in rows]


async def insert_document_chat_thread(
    pool: asyncpg.Pool,
    document_id: str,
    user_id: str,
    title: str | None = None,
) -> str:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            insert into document_chat_threads (document_id, user_id, title)
            values ($1, $2, $3)
            returning id
            """,
            document_id,
            user_id,
            title,
        )
    return str(row["id"])


async def list_document_chat_messages(
    pool: asyncpg.Pool,
    chat_id: str,
    user_id: str,
) -> list[dict[str, Any]]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            select id, role, content, refs, status, created_at
            from document_chat_messages
            where chat_id = $1 and user_id = $2
            order by created_at asc
            """,
            chat_id,
            user_id,
        )
    return [dict(row) for row in rows]


async def list_recent_document_chat_messages(
    pool: asyncpg.Pool,
    chat_id: str,
    user_id: str,
    limit: int = 4,
) -> list[dict[str, Any]]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            select id, role, content, refs, status, created_at
            from document_chat_messages
            where chat_id = $1 and user_id = $2
            order by created_at desc
            limit $3
            """,
            chat_id,
            user_id,
            limit,
        )
    return [dict(row) for row in rows][::-1]


async def get_document_chat_thread(
    pool: asyncpg.Pool,
    document_id: str,
    chat_id: str,
    user_id: str,
) -> dict[str, Any] | None:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            select id, title, document_id, user_id
            from document_chat_threads
            where id = $1 and document_id = $2 and user_id = $3
            """,
            chat_id,
            document_id,
            user_id,
        )
    return dict(row) if row else None


async def insert_document_chat_message(
    pool: asyncpg.Pool,
    chat_id: str,
    user_id: str,
    role: str,
    content: str,
    status: str | None = None,
    refs: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    async with pool.acquire() as conn:
        await conn.execute(
            """
            update document_chat_threads
            set updated_at = now()
            where id = $1 and user_id = $2
            """,
            chat_id,
            user_id,
        )
        row = await conn.fetchrow(
            """
            insert into document_chat_messages (chat_id, user_id, role, content, status, refs)
            values ($1, $2, $3, $4, $5, $6::jsonb)
            returning id, role, content, status, refs, created_at
            """,
            chat_id,
            user_id,
            role,
            content,
            status,
            json.dumps(refs) if refs is not None else None,
        )
    return dict(row)


async def update_document_chat_message(
    pool: asyncpg.Pool,
    chat_id: str,
    user_id: str,
    message_id: str,
    content: str,
    status: str | None = None,
    refs: list[dict[str, Any]] | None = None,
) -> dict[str, Any] | None:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            update document_chat_messages
            set content = $1,
                status = $2,
                refs = $3::jsonb
            where id = $4 and chat_id = $5 and user_id = $6
            returning id, role, content, status, refs, created_at
            """,
            content,
            status,
            json.dumps(refs) if refs is not None else None,
            message_id,
            chat_id,
            user_id,
        )
    return dict(row) if row else None


async def list_user_chat_threads(
    pool: asyncpg.Pool,
    user_id: str,
) -> list[dict[str, Any]]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            select
                threads.id,
                threads.title,
                threads.document_id,
                threads.updated_at,
                documents.title as document_title,
                (
                    select content
                    from document_chat_messages
                    where chat_id = threads.id
                      and user_id = $1
                    order by created_at desc
                    limit 1
                ) as last_message
            from document_chat_threads as threads
            join documents on documents.id = threads.document_id
            where threads.user_id = $1
            order by threads.updated_at desc, threads.created_at desc
            """,
            user_id,
        )
    return [dict(row) for row in rows]


async def get_document_chunk(
    pool: asyncpg.Pool,
    document_id: str,
    chunk_id: str,
    user_id: str,
) -> dict[str, Any] | None:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            select
                document_chunks.id,
                document_chunks.document_id,
                document_chunks.metadata
            from document_chunks
            join documents on documents.id = document_chunks.document_id
            where document_chunks.id = $1
              and document_chunks.document_id = $2
              and documents.user_id = $3
            """,
            chunk_id,
            document_id,
            user_id,
        )
    return dict(row) if row else None

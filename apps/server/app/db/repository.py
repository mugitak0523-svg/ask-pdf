from __future__ import annotations

import json
from datetime import datetime
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
            select id, title
            from documents
            where user_id = $1
            order by created_at desc
            """,
            user_id,
        )
    return [dict(row) for row in rows]


async def count_documents(
    pool: asyncpg.Pool,
    user_id: str,
) -> int:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            select count(*) as total
            from documents
            where user_id = $1
            """,
            user_id,
        )
    return int(row["total"] or 0)


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


async def get_document_storage_path(
    pool: asyncpg.Pool,
    document_id: str,
    user_id: str,
) -> str | None:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            select storage_path
            from documents
            where id = $1 and user_id = $2
            """,
            document_id,
            user_id,
        )
    return str(row["storage_path"]) if row and row.get("storage_path") else None


async def get_document_storage_path(
    pool: asyncpg.Pool,
    document_id: str,
    user_id: str,
) -> str | None:
    """Fast path used by signed-url; avoids fetching large jsonb columns like result."""
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            select storage_path
            from documents
            where id = $1 and user_id = $2
            """,
            document_id,
            user_id,
        )
    if not row:
        return None
    value = row.get("storage_path")
    return str(value) if value is not None else None


async def get_document_bundle(
    pool: asyncpg.Pool,
    document_id: str,
    user_id: str,
) -> dict[str, Any] | None:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            select
                d.storage_path,
                d.result,
                a.data as annotations
            from documents as d
            left join document_annotations as a
              on a.document_id = d.id and a.user_id = d.user_id
            where d.id = $1 and d.user_id = $2
            """,
            document_id,
            user_id,
        )
    return dict(row) if row else None


async def document_exists(
    pool: asyncpg.Pool,
    document_id: str,
    user_id: str,
) -> bool:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            select 1
            from documents
            where id = $1 and user_id = $2
            """,
            document_id,
            user_id,
        )
    return bool(row)


async def document_exists_conn(
    conn: asyncpg.Connection,
    document_id: str,
    user_id: str,
) -> bool:
    row = await conn.fetchrow(
        """
        select 1
        from documents
        where id = $1 and user_id = $2
        """,
        document_id,
        user_id,
    )
    return bool(row)


async def document_thread_exists(
    pool: asyncpg.Pool,
    document_id: str,
    chat_id: str,
    user_id: str,
) -> bool:
    async with pool.acquire() as conn:
        return await document_thread_exists_conn(conn, document_id, chat_id, user_id)


async def document_thread_exists_conn(
    conn: asyncpg.Connection,
    document_id: str,
    chat_id: str,
    user_id: str,
) -> bool:
    row = await conn.fetchrow(
        """
        select 1
        from documents d
        join document_chat_threads t on t.document_id = d.id
        where d.id = $1
          and d.user_id = $2
          and t.id = $3
          and t.user_id = $2
        """,
        document_id,
        user_id,
        chat_id,
    )
    return bool(row)


async def update_document_title(
    pool: asyncpg.Pool,
    document_id: str,
    user_id: str,
    title: str,
) -> dict[str, Any] | None:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            update documents
            set title = $3
            where id = $1 and user_id = $2
            returning id, title
            """,
            document_id,
            user_id,
            title,
        )
    return dict(row) if row else None


async def delete_document(
    pool: asyncpg.Pool,
    document_id: str,
    user_id: str,
) -> dict[str, Any] | None:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            delete from documents
            where id = $1 and user_id = $2
            returning id
            """,
            document_id,
            user_id,
        )
    return dict(row) if row else None


async def insert_chunks(
    pool: asyncpg.Pool,
    document_id: str,
    user_id: str,
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
                user_id,
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
            insert into document_chunks (document_id, user_id, content, embedding, metadata)
            values ($1, $2, $3, $4::vector, $5::jsonb)
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


async def match_documents_conn(
    conn: asyncpg.Connection,
    query_embedding: list[float],
    match_count: int = 5,
    document_id: str | None = None,
) -> list[dict[str, Any]]:
    vector_literal = _vector_literal(query_embedding)
    rows = await conn.fetch(
        """
        select * from match_documents($1::vector, $2, $3::uuid)
        """,
        vector_literal,
        match_count,
        document_id,
    )
    return [dict(row) for row in rows]


async def match_user_documents(
    pool: asyncpg.Pool,
    user_id: str,
    query_embedding: list[float],
    match_count: int = 5,
) -> list[dict[str, Any]]:
    vector_literal = _vector_literal(query_embedding)
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            select
                document_chunks.id,
                document_chunks.document_id,
                document_chunks.content,
                document_chunks.metadata,
                documents.title as document_title,
                1 - (document_chunks.embedding <=> $2::vector) as similarity
            from document_chunks
            join documents on documents.id = document_chunks.document_id
            where document_chunks.user_id = $1
            order by document_chunks.embedding <=> $2::vector
            limit $3
            """,
            user_id,
            vector_literal,
            match_count,
        )
    return [dict(row) for row in rows]


async def search_document_chunks(
    pool: asyncpg.Pool,
    user_id: str,
    query: str,
    limit: int = 30,
) -> list[dict[str, Any]]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            with hits as (
                select
                    dc.document_id,
                    d.title,
                    dc.content,
                    dc.created_at,
                    count(*) over (partition by dc.document_id) as hit_count
                from document_chunks dc
                join documents d on d.id = dc.document_id
                where dc.user_id = $1
                  and dc.content ilike $2
            )
            select distinct on (document_id)
                document_id,
                title,
                content,
                hit_count
            from hits
            order by document_id, created_at asc
            limit $3
            """,
            user_id,
            f"%{query}%",
            limit,
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
                threads.id,
                threads.title,
                threads.created_at,
                threads.updated_at,
                last_message.content as last_message
            from document_chat_threads as threads
            left join lateral (
                select content
                from document_chat_messages
                where chat_id = threads.id
                  and user_id = $2
                order by created_at desc
                limit 1
            ) as last_message on true
            where document_id = $1 and user_id = $2
            order by updated_at desc, created_at desc
            """,
            document_id,
            user_id,
        )
    return [dict(row) for row in rows]


async def get_latest_document_chat_thread(
    pool: asyncpg.Pool,
    document_id: str,
    user_id: str,
) -> dict[str, Any] | None:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            select
                threads.id,
                threads.title,
                threads.created_at,
                threads.updated_at,
                last_message.content as last_message
            from document_chat_threads as threads
            left join lateral (
                select content
                from document_chat_messages
                where chat_id = threads.id
                  and user_id = $2
                order by created_at desc
                limit 1
            ) as last_message on true
            where document_id = $1 and user_id = $2
            order by updated_at desc, created_at desc
            limit 1
            """,
            document_id,
            user_id,
        )
    return dict(row) if row else None


async def count_document_chat_threads(
    pool: asyncpg.Pool,
    document_id: str,
    user_id: str,
) -> int:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            select count(*) as total
            from document_chat_threads
            where document_id = $1 and user_id = $2
            """,
            document_id,
            user_id,
        )
    return int(row["total"] or 0)


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
    limit: int | None = None,
    before: datetime | None = None,
) -> list[dict[str, Any]]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            select id, role, content, refs, status, created_at
            from document_chat_messages
            where chat_id = $1 and user_id = $2
              and ($3::timestamptz is null or created_at < $3::timestamptz)
            order by created_at desc
            limit $4
            """,
            chat_id,
            user_id,
            before,
            limit or 100,
        )
    return [dict(row) for row in rows]


async def count_document_chat_messages(
    pool: asyncpg.Pool,
    chat_id: str,
    user_id: str,
    role: str | None = None,
) -> int:
    async with pool.acquire() as conn:
        if role:
            row = await conn.fetchrow(
                """
                select count(*) as total
                from document_chat_messages
                where chat_id = $1 and user_id = $2 and role = $3
                """,
                chat_id,
                user_id,
                role,
            )
        else:
            row = await conn.fetchrow(
                """
                select count(*) as total
                from document_chat_messages
                where chat_id = $1 and user_id = $2
                """,
                chat_id,
                user_id,
            )
    return int(row["total"] or 0)


async def count_document_chat_messages_conn(
    conn: asyncpg.Connection,
    chat_id: str,
    user_id: str,
    role: str | None = None,
) -> int:
    if role:
        row = await conn.fetchrow(
            """
            select count(*) as total
            from document_chat_messages
            where chat_id = $1 and user_id = $2 and role = $3
            """,
            chat_id,
            user_id,
            role,
        )
    else:
        row = await conn.fetchrow(
            """
            select count(*) as total
            from document_chat_messages
            where chat_id = $1 and user_id = $2
            """,
            chat_id,
            user_id,
        )
    return int(row["total"] or 0)


async def count_user_messages_since(
    pool: asyncpg.Pool,
    user_id: str,
    start_at: datetime,
) -> int:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            select count(*) as total
            from document_chat_messages
            where user_id = $1
              and role = 'user'
              and created_at >= $2::timestamptz
            """,
            user_id,
            start_at,
        )
    return int(row["total"] or 0)


async def count_user_messages_since_conn(
    conn: asyncpg.Connection,
    user_id: str,
    start_at: datetime,
) -> int:
    row = await conn.fetchrow(
        """
        select count(*) as total
        from document_chat_messages
        where user_id = $1
          and role = 'user'
          and created_at >= $2::timestamptz
        """,
        user_id,
        start_at,
    )
    return int(row["total"] or 0)


async def count_user_ok_answers_since(
    pool: asyncpg.Pool,
    user_id: str,
    start_at: datetime,
) -> int:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            select count(*) as total
            from document_chat_messages
            where user_id = $1
              and role = 'assistant'
              and status = 'ok'
              and created_at >= $2::timestamptz
            """,
            user_id,
            start_at,
        )
    return int(row["total"] or 0)


async def count_user_ok_answers_since_conn(
    conn: asyncpg.Connection,
    user_id: str,
    start_at: datetime,
) -> int:
    row = await conn.fetchrow(
        """
        select count(*) as total
        from document_chat_messages
        where user_id = $1
          and role = 'assistant'
          and status = 'ok'
          and created_at >= $2::timestamptz
        """,
        user_id,
        start_at,
    )
    return int(row["total"] or 0)


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


async def list_recent_document_chat_messages_conn(
    conn: asyncpg.Connection,
    chat_id: str,
    user_id: str,
    limit: int = 4,
) -> list[dict[str, Any]]:
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


async def update_document_chat_thread_title(
    pool: asyncpg.Pool,
    chat_id: str,
    user_id: str,
    title: str,
) -> dict[str, Any] | None:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            update document_chat_threads
            set title = $3
            where id = $1 and user_id = $2
            returning id, title, document_id
            """,
            chat_id,
            user_id,
            title,
        )
    return dict(row) if row else None


async def delete_document_chat_thread(
    pool: asyncpg.Pool,
    document_id: str,
    chat_id: str,
    user_id: str,
) -> dict[str, Any] | None:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            delete from document_chat_threads
            where id = $1 and document_id = $2 and user_id = $3
            returning id
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


async def insert_document_chat_message_conn(
    conn: asyncpg.Connection,
    chat_id: str,
    user_id: str,
    role: str,
    content: str,
    status: str | None = None,
    refs: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
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


async def insert_document_chat_message_checked_conn(
    conn: asyncpg.Connection,
    document_id: str,
    chat_id: str,
    user_id: str,
    role: str,
    content: str,
    status: str | None = None,
    refs: list[dict[str, Any]] | None = None,
    max_messages_per_thread: int | None = None,
) -> dict[str, Any]:
    row = await conn.fetchrow(
        """
        with doc_ok as (
            select 1
            from documents
            where id = $1 and user_id = $2
        ),
        thread_ok as (
            select 1
            from document_chat_threads
            where id = $3 and document_id = $1 and user_id = $2
        ),
        msg_count as (
            select count(*)::int as total
            from document_chat_messages
            where chat_id = $3 and user_id = $2 and role = 'user'
        ),
        ins as (
            insert into document_chat_messages (chat_id, user_id, role, content, status, refs)
            select $3, $2, $4, $5, $6, $7::jsonb
            where exists (select 1 from doc_ok)
              and exists (select 1 from thread_ok)
              and ($8::int is null or (select total from msg_count) < $8)
            returning id, role, content, status, refs, created_at
        ),
        upd as (
            update document_chat_threads
            set updated_at = now()
            where id = $3 and user_id = $2 and exists (select 1 from ins)
        )
        select
            exists(select 1 from doc_ok) as doc_exists,
            exists(select 1 from thread_ok) as thread_exists,
            (select total from msg_count) as msg_count,
            ins.id,
            ins.role,
            ins.content,
            ins.status,
            ins.refs,
            ins.created_at
        from (select 1) base
        left join ins on true
        """,
        document_id,
        user_id,
        chat_id,
        role,
        content,
        status,
        json.dumps(refs) if refs is not None else None,
        max_messages_per_thread,
    )
    return dict(row) if row else {}


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


async def update_document_chat_message_conn(
    conn: asyncpg.Connection,
    chat_id: str,
    user_id: str,
    message_id: str,
    content: str,
    status: str | None = None,
    refs: list[dict[str, Any]] | None = None,
) -> dict[str, Any] | None:
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


async def get_user_plan(
    pool: asyncpg.Pool,
    user_id: str,
) -> str | None:
    async with pool.acquire() as conn:
        try:
            row = await conn.fetchrow(
                """
                select plan
                from user_plans
                where user_id = $1
                """,
                user_id,
            )
        except asyncpg.UndefinedTableError:
            return None
    return str(row["plan"]) if row and row.get("plan") else None


async def get_user_plan_conn(
    conn: asyncpg.Connection,
    user_id: str,
) -> str | None:
    try:
        row = await conn.fetchrow(
            """
            select plan
            from user_plans
            where user_id = $1
            """,
            user_id,
        )
    except asyncpg.UndefinedTableError:
        return None
    return str(row["plan"]) if row and row.get("plan") else None


async def get_user_billing(
    pool: asyncpg.Pool,
    user_id: str,
) -> dict[str, Any] | None:
    async with pool.acquire() as conn:
        try:
            row = await conn.fetchrow(
                """
                select
                    user_id,
                    plan,
                    stripe_customer_id,
                    stripe_subscription_id,
                    stripe_price_id,
                    stripe_status,
                    current_period_end,
                    stripe_schedule_id
                from user_plans
                where user_id = $1
                """,
                user_id,
            )
        except asyncpg.UndefinedTableError:
            return None
    return dict(row) if row else None


async def get_user_id_by_stripe_customer_id(
    pool: asyncpg.Pool,
    stripe_customer_id: str,
) -> str | None:
    async with pool.acquire() as conn:
        try:
            row = await conn.fetchrow(
                """
                select user_id
                from user_plans
                where stripe_customer_id = $1
                """,
                stripe_customer_id,
            )
        except asyncpg.UndefinedTableError:
            return None
    return str(row["user_id"]) if row and row.get("user_id") else None


async def upsert_user_billing(
    pool: asyncpg.Pool,
    user_id: str,
    plan: str | None = None,
    stripe_customer_id: str | None = None,
    stripe_subscription_id: str | None = None,
    stripe_price_id: str | None = None,
    stripe_status: str | None = None,
    current_period_end=None,
    stripe_schedule_id: str | None = None,
) -> None:
    async with pool.acquire() as conn:
        await conn.execute(
            """
            insert into user_plans (
                user_id,
                plan,
                stripe_customer_id,
                stripe_subscription_id,
                stripe_price_id,
                stripe_status,
                current_period_end,
                stripe_schedule_id
            )
            values ($1, coalesce($2, 'free'), $3, $4, $5, $6, $7, $8)
            on conflict (user_id) do update set
                plan = coalesce(excluded.plan, user_plans.plan),
                stripe_customer_id = coalesce(
                    excluded.stripe_customer_id,
                    user_plans.stripe_customer_id
                ),
                stripe_subscription_id = coalesce(
                    excluded.stripe_subscription_id,
                    user_plans.stripe_subscription_id
                ),
                stripe_price_id = coalesce(excluded.stripe_price_id, user_plans.stripe_price_id),
                stripe_status = coalesce(excluded.stripe_status, user_plans.stripe_status),
                current_period_end = coalesce(
                    excluded.current_period_end,
                    user_plans.current_period_end
                ),
                stripe_schedule_id = coalesce(
                    excluded.stripe_schedule_id,
                    user_plans.stripe_schedule_id
                )
            """,
            user_id,
            plan,
            stripe_customer_id,
            stripe_subscription_id,
            stripe_price_id,
            stripe_status,
            current_period_end,
            stripe_schedule_id,
        )


async def set_user_plan(
    pool: asyncpg.Pool,
    user_id: str,
    plan: str,
) -> None:
    async with pool.acquire() as conn:
        await conn.execute(
            """
            insert into user_plans (user_id, plan)
            values ($1, $2)
            on conflict (user_id)
            do update set plan = excluded.plan
            """,
            user_id,
            plan,
        )


async def insert_usage_log(
    pool: asyncpg.Pool,
    user_id: str,
    operation: str,
    document_id: str | None = None,
    chat_id: str | None = None,
    message_id: str | None = None,
    model: str | None = None,
    input_tokens: int | None = None,
    output_tokens: int | None = None,
    total_tokens: int | None = None,
    pages: int | None = None,
    raw_usage: dict[str, Any] | None = None,
    raw_request: dict[str, Any] | None = None,
) -> None:
    async with pool.acquire() as conn:
        await conn.execute(
            """
            insert into usage_logs (
                user_id,
                operation,
                document_id,
                chat_id,
                message_id,
                model,
                input_tokens,
                output_tokens,
                total_tokens,
                pages,
                raw_usage,
                raw_request
            )
            values ($1, $2, $3::uuid, $4::uuid, $5::uuid, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb)
            """,
            user_id,
            operation,
            document_id,
            chat_id,
            message_id,
            model,
            input_tokens,
            output_tokens,
            total_tokens,
            pages,
            json.dumps(raw_usage) if raw_usage is not None else None,
            json.dumps(raw_request) if raw_request is not None else None,
        )


async def insert_usage_log_conn(
    conn: asyncpg.Connection,
    user_id: str,
    operation: str,
    document_id: str | None = None,
    chat_id: str | None = None,
    message_id: str | None = None,
    model: str | None = None,
    input_tokens: int | None = None,
    output_tokens: int | None = None,
    total_tokens: int | None = None,
    pages: int | None = None,
    raw_usage: dict[str, Any] | None = None,
    raw_request: dict[str, Any] | None = None,
) -> None:
    await conn.execute(
        """
        insert into usage_logs (
            user_id,
            operation,
            document_id,
            chat_id,
            message_id,
            model,
            input_tokens,
            output_tokens,
            total_tokens,
            pages,
            raw_usage,
            raw_request
        )
        values ($1, $2, $3::uuid, $4::uuid, $5::uuid, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb)
        """,
        user_id,
        operation,
        document_id,
        chat_id,
        message_id,
        model,
        input_tokens,
        output_tokens,
        total_tokens,
        pages,
        json.dumps(raw_usage) if raw_usage is not None else None,
        json.dumps(raw_request) if raw_request is not None else None,
    )


async def get_usage_summary(
    pool: asyncpg.Pool,
    user_id: str,
    start_at: datetime | None = None,
    end_at: datetime | None = None,
) -> dict[str, Any]:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            select
                coalesce(sum(input_tokens), 0) as input_tokens,
                coalesce(sum(output_tokens), 0) as output_tokens,
                coalesce(sum(total_tokens), 0) as total_tokens,
                coalesce(sum(pages), 0) as pages,
                coalesce(sum(total_tokens) filter (where operation = 'answer'), 0) as answer_tokens,
                coalesce(sum(total_tokens) filter (where operation = 'embed'), 0) as embed_tokens,
                coalesce(sum(pages) filter (where operation = 'parse'), 0) as parse_pages,
                count(*) filter (where operation = 'answer') as answer_count,
                count(*) filter (where operation = 'embed') as embed_count,
                count(*) filter (where operation = 'parse') as parse_count
            from usage_logs
            where user_id = $1
              and ($2::timestamptz is null or created_at >= $2::timestamptz)
              and ($3::timestamptz is null or created_at < $3::timestamptz)
            """,
            user_id,
            start_at,
            end_at,
        )
    return dict(row) if row else {}


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


async def list_document_chunks_with_embeddings(
    pool: asyncpg.Pool,
    document_id: str,
    user_id: str,
) -> list[dict[str, Any]]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            select
                document_chunks.id,
                document_chunks.document_id,
                document_chunks.content,
                document_chunks.metadata,
                document_chunks.embedding::text as embedding
            from document_chunks
            join documents on documents.id = document_chunks.document_id
            where document_chunks.document_id = $1
              and documents.user_id = $2
            order by document_chunks.id
            """,
            document_id,
            user_id,
        )
    return [dict(row) for row in rows]


async def get_document_chunk_content(
    pool: asyncpg.Pool,
    chunk_id: str,
    user_id: str,
    document_id: str | None = None,
) -> dict[str, Any] | None:
    async with pool.acquire() as conn:
        if document_id:
            row = await conn.fetchrow(
                """
                select
                    document_chunks.id,
                    document_chunks.document_id,
                    document_chunks.content,
                    document_chunks.metadata,
                    documents.title as document_title
                from document_chunks
                join documents on documents.id = document_chunks.document_id
                where document_chunks.id = $1
                  and document_chunks.document_id = $2
                  and document_chunks.user_id = $3
                """,
                chunk_id,
                document_id,
                user_id,
            )
        else:
            row = await conn.fetchrow(
                """
                select
                    document_chunks.id,
                    document_chunks.document_id,
                    document_chunks.content,
                    document_chunks.metadata,
                    documents.title as document_title
                from document_chunks
                join documents on documents.id = document_chunks.document_id
                where document_chunks.id = $1
                  and document_chunks.user_id = $2
                """,
                chunk_id,
                user_id,
            )
    return dict(row) if row else None


async def list_users_admin(pool, *, limit: int = 50, offset: int = 0) -> list[dict[str, Any]]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            select
                u.id,
                u.email,
                u.created_at,
                u.last_sign_in_at,
                p.plan,
                p.stripe_status,
                p.current_period_end,
                coalesce(unread.unread_count, 0) as unread_message_count
            from auth.users u
            left join user_plans p on p.user_id = u.id
            left join (
                select user_id, count(*) as unread_count
                from admin_user_messages
                where direction = 'user' and read_at is null
                group by user_id
            ) as unread on unread.user_id = u.id
            order by u.created_at desc
            limit $1 offset $2
            """,
            limit,
            offset,
        )
    return [dict(row) for row in rows]


async def get_user_detail_admin(pool, *, user_id: str) -> dict[str, Any] | None:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            select
                u.id,
                u.email,
                u.created_at,
                u.last_sign_in_at,
                p.plan,
                p.stripe_status,
                p.stripe_price_id,
                p.current_period_end,
                p.stripe_customer_id
            from auth.users u
            left join user_plans p on p.user_id = u.id
            where u.id = $1
            """,
            user_id,
        )
        if not row:
            return None
        document_count = await conn.fetchval(
            "select count(*) from documents where user_id = $1",
            user_id,
        )
        chat_count = await conn.fetchval(
            "select count(*) from document_chat_threads where user_id = $1",
            user_id,
        )
        message_count = await conn.fetchval(
            "select count(*) from document_chat_messages where user_id = $1",
            user_id,
        )
        total_tokens = await conn.fetchval(
            "select coalesce(sum(total_tokens), 0) from usage_logs where user_id = $1",
            user_id,
        )
    result = dict(row)
    result["documentCount"] = int(document_count or 0)
    result["chatCount"] = int(chat_count or 0)
    result["messageCount"] = int(message_count or 0)
    result["totalTokens"] = int(total_tokens or 0)
    return result


async def list_usage_daily_admin(
    pool,
    *,
    user_id: str,
    days: int = 30,
) -> list[dict[str, Any]]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            select
                date_trunc('day', created_at) as day,
                coalesce(sum(total_tokens), 0) as total_tokens
            from usage_logs
            where user_id = $1
              and created_at >= (now() - make_interval(days => $2::int))
            group by 1
            order by 1
            """,
            user_id,
            days,
        )
    return [dict(row) for row in rows]


async def list_admin_announcements(
    pool,
    *,
    status: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[dict[str, Any]]:
    async with pool.acquire() as conn:
        if status:
            rows = await conn.fetch(
                """
                select id, title, body, status, created_at, created_by, published_at
                from admin_announcements
                where status = $1
                order by created_at desc
                limit $2 offset $3
                """,
                status,
                limit,
                offset,
            )
        else:
            rows = await conn.fetch(
                """
                select id, title, body, status, created_at, created_by, published_at
                from admin_announcements
                order by created_at desc
                limit $1 offset $2
                """,
                limit,
                offset,
            )
    return [dict(row) for row in rows]


async def create_user_feedback(
    pool,
    *,
    user_id: str,
    category: str,
    message: str,
) -> dict[str, Any]:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            insert into user_feedback (user_id, category, message)
            values ($1, $2, $3)
            returning id, user_id, category, message, created_at, read_at
            """,
            user_id,
            category,
            message,
        )
    return dict(row) if row else {}


async def list_feedback_admin(
    pool,
    *,
    limit: int = 50,
    offset: int = 0,
) -> list[dict[str, Any]]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            select id, user_id, category, message, created_at, read_at
            from user_feedback
            order by created_at desc
            limit $1 offset $2
            """,
            limit,
            offset,
        )
    return [dict(row) for row in rows]


async def set_feedback_read_admin(
    pool,
    *,
    feedback_id: str,
    read: bool,
) -> None:
    async with pool.acquire() as conn:
        await conn.execute(
            """
            update user_feedback
            set read_at = case when $2 then now() else null end
            where id = $1
            """,
            feedback_id,
            read,
        )


async def set_user_message_read_admin(
    pool,
    *,
    message_id: str,
    read: bool,
) -> None:
    async with pool.acquire() as conn:
        await conn.execute(
            """
            update admin_user_messages
            set read_at = case when $2 then now() else null end
            where id = $1
            """,
            message_id,
            read,
        )


async def get_unread_messages_count_admin(pool) -> int:
    async with pool.acquire() as conn:
        value = await conn.fetchval(
            """
            select count(*)
            from admin_user_messages
            where direction = 'user' and read_at is null
            """
        )
    return int(value or 0)


async def get_unread_feedback_count_admin(pool) -> int:
    async with pool.acquire() as conn:
        value = await conn.fetchval(
            """
            select count(*)
            from user_feedback
            where read_at is null
            """
        )
    return int(value or 0)


async def create_admin_announcement(
    pool,
    *,
    title: str,
    body: str,
    status: str,
    created_by: str | None,
    published_at,
) -> dict[str, Any]:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            insert into admin_announcements (title, body, status, created_by, published_at)
            values ($1, $2, $3, $4, $5)
            returning id, title, body, status, created_at, created_by, published_at
            """,
            title,
            body,
            status,
            created_by,
            published_at,
        )
    return dict(row) if row else {}


async def list_published_announcements(
    pool,
    *,
    limit: int = 20,
    offset: int = 0,
) -> list[dict[str, Any]]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            select id, title, body, status, created_at, created_by, published_at
            from admin_announcements
            where status = 'published'
            order by published_at desc nulls last, created_at desc
            limit $1 offset $2
            """,
            limit,
            offset,
        )
    return [dict(row) for row in rows]


async def list_user_messages(
    pool,
    *,
    user_id: str,
    limit: int = 50,
    offset: int = 0,
) -> list[dict[str, Any]]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            select id, user_id, direction, content, admin_id, created_at, read_at
            from admin_user_messages
            where user_id = $1
            order by created_at desc
            limit $2 offset $3
            """,
            user_id,
            limit,
            offset,
        )
    return [dict(row) for row in rows]


async def create_user_message(
    pool,
    *,
    user_id: str,
    direction: str,
    content: str,
    admin_id: str | None = None,
) -> dict[str, Any]:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            insert into admin_user_messages (user_id, direction, content, admin_id)
            values ($1, $2, $3, $4)
            returning id, user_id, direction, content, admin_id, created_at, read_at
            """,
            user_id,
            direction,
            content,
            admin_id,
        )
    return dict(row) if row else {}

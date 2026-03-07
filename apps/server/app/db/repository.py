from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from typing import Any

import asyncpg

def _vector_literal(values: list[float]) -> str:
    return "[" + ",".join(str(v) for v in values) + "]"


def _normalize_whitespace_for_search(value: str) -> str:
    return re.sub(r"[\s\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000\uFEFF]+", "", value).strip()


_MODEL_PRICING_USD_PER_1M: dict[str, dict[str, float]] = {
    # https://openai.com/api/pricing/
    "gpt-5-mini": {"input": 0.25, "output": 2.0},
    "gpt-5-nano": {"input": 0.05, "output": 0.4},
    "gpt-4.1-nano": {"input": 0.1, "output": 0.4},
    "gpt-3.5-turbo": {"input": 0.5, "output": 1.5},
    # Internal rule from user request
    "gpt-oss-120b": {"input": 0.0, "output": 0.0},
    # https://ai.google.dev/gemini-api/docs/pricing
    "gemini-3-flash-preview": {"input": 0.5, "output": 3.0},
    "gemini-2.5-flash": {"input": 0.3, "output": 2.5},
    # Embeddings: https://openai.com/api/pricing/
    "text-embedding-3-small": {"embed_input": 0.02},
    "text-embedding-3-large": {"embed_input": 0.13},
}

_DEFAULT_EMBED_MODEL = "text-embedding-3-small"


def _normalize_model_name(value: Any) -> str:
    if not value:
        return "unknown"
    name = str(value).strip()
    if not name:
        return "unknown"
    return name.lower()


def _estimate_usage_cost_usd(
    *,
    operation: str | None,
    model: str | None,
    input_tokens: int | None,
    output_tokens: int | None,
    pages: int | None,
    parse_cost_per_page_usd: float,
) -> float:
    op = (operation or "").strip().lower()
    model_key = _normalize_model_name(model)
    in_tokens = max(0, int(input_tokens or 0))
    out_tokens = max(0, int(output_tokens or 0))
    page_count = max(0, int(pages or 0))

    if op == "parse":
        return float(page_count) * float(parse_cost_per_page_usd)

    if op == "embed":
        embedding_model = model_key if model_key in _MODEL_PRICING_USD_PER_1M else _DEFAULT_EMBED_MODEL
        rate = _MODEL_PRICING_USD_PER_1M.get(embedding_model, {}).get("embed_input", 0.0)
        return (in_tokens / 1_000_000.0) * float(rate)

    rate_table = _MODEL_PRICING_USD_PER_1M.get(model_key)
    if not rate_table:
        return 0.0
    in_rate = float(rate_table.get("input", 0.0))
    out_rate = float(rate_table.get("output", 0.0))
    return (in_tokens / 1_000_000.0) * in_rate + (out_tokens / 1_000_000.0) * out_rate


async def insert_document(
    pool: asyncpg.Pool,
    title: str,
    storage_path: str,
    metadata: dict[str, Any],
    result: dict[str, Any] | None = None,
    user_id: str | None = None,
    status: str = "ready",
    progress: int | None = None,
    error_message: str | None = None,
) -> str:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            insert into documents (user_id, title, storage_path, metadata, result, status, progress, error_message)
            values ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8)
            returning id
            """,
            user_id,
            title,
            storage_path,
            json.dumps(metadata),
            json.dumps(result) if result is not None else None,
            status,
            progress,
            error_message,
        )
    return str(row["id"])


async def list_documents(
    pool: asyncpg.Pool,
    user_id: str,
) -> list[dict[str, Any]]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            select id, title, status
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


async def count_active_uploads(
    pool: asyncpg.Pool,
    user_id: str,
) -> int:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            select count(*) as total
            from documents
            where user_id = $1
              and status in ('uploading', 'uploaded', 'processing')
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
            select id, title, storage_path, metadata, result, created_at, status, progress, error_message
            from documents
            where id = $1 and user_id = $2
            """,
            document_id,
            user_id,
        )
    return dict(row) if row else None


async def get_document_status(
    pool: asyncpg.Pool,
    document_id: str,
    user_id: str,
) -> dict[str, Any] | None:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            select id, status
            from documents
            where id = $1 and user_id = $2
            """,
            document_id,
            user_id,
        )
    return dict(row) if row else None


async def update_document_status(
    pool: asyncpg.Pool,
    document_id: str,
    status: str,
    progress: int | None = None,
    error_message: str | None = None,
) -> None:
    async with pool.acquire() as conn:
        await conn.execute(
            """
            update documents
            set status = $2,
                progress = $3,
                error_message = $4,
                updated_at = now()
            where id = $1
            """,
            document_id,
            status,
            progress,
            error_message,
        )


async def mark_stale_documents_failed(
    pool: asyncpg.Pool,
    user_id: str,
    cutoff,
) -> int:
    async with pool.acquire() as conn:
        result = await conn.execute(
            """
            update documents
            set status = 'failed',
                error_message = format('Stale for over 1 hour in %s', status),
                updated_at = now()
            where user_id = $1
              and status in ('uploading', 'uploaded', 'processing')
              and updated_at < $2
            """,
            user_id,
            cutoff,
        )
    try:
        return int(str(result).split()[-1])
    except Exception:
        return 0


async def update_document_result(
    pool: asyncpg.Pool,
    document_id: str,
    metadata: dict[str, Any],
    result: dict[str, Any] | None,
    status: str = "ready",
    progress: int | None = None,
    error_message: str | None = None,
) -> None:
    async with pool.acquire() as conn:
        await conn.execute(
            """
            update documents
            set metadata = $2::jsonb,
                result = $3::jsonb,
                status = $4,
                progress = $5,
                error_message = $6,
                updated_at = now()
            where id = $1
            """,
            document_id,
            json.dumps(metadata),
            json.dumps(result) if result is not None else None,
            status,
            progress,
            error_message,
        )


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


async def list_processing_documents(
    pool: asyncpg.Pool,
    user_id: str,
) -> list[dict[str, Any]]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            select id, user_id, metadata, metadata->>'parser_doc_id' as parser_doc_id
            from documents
            where status = 'processing' and user_id = $1
            order by created_at asc
            """,
            user_id,
        )
    return [dict(row) for row in rows]


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
    normalized_query = _normalize_whitespace_for_search(query)
    if not normalized_query:
        return []
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
                  and replace(
                        replace(
                          replace(
                            replace(
                              replace(
                                replace(
                                  replace(
                                    replace(
                                      replace(
                                        replace(
                                          replace(
                                            replace(
                                              replace(dc.content, '　', ''),
                                              ' ',
                                              ''
                                            ),
                                            E'\n',
                                            ''
                                          ),
                                          E'\r',
                                          ''
                                        ),
                                        E'\t',
                                        ''
                                      ),
                                      chr(160),
                                      ''
                                    ),
                                    chr(5760),
                                    ''
                                  ),
                                  chr(8192),
                                  ''
                                ),
                                chr(8193),
                                ''
                              ),
                              chr(8194),
                              ''
                            ),
                            chr(8195),
                            ''
                          ),
                          chr(8196),
                          ''
                        ),
                        chr(8197),
                        ''
                      ) ilike $2
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
            f"%{normalized_query}%",
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
              and role in ('assistant', 'user')
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
          and role in ('assistant', 'user')
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


async def list_user_document_storage_paths(
    pool: asyncpg.Pool,
    user_id: str,
) -> list[str]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            select storage_path
            from documents
            where user_id = $1
              and storage_path is not null
            """,
            user_id,
        )
    paths: list[str] = []
    for row in rows:
        value = row.get("storage_path")
        if value:
            paths.append(str(value))
    return paths


async def delete_user_account_data(
    pool: asyncpg.Pool,
    user_id: str,
) -> None:
    statements = [
        "delete from usage_logs where user_id = $1",
        "delete from admin_user_messages where user_id = $1",
        "delete from user_feedback where user_id = $1",
        "delete from global_chat_messages where user_id = $1",
        "delete from global_chat_threads where user_id = $1",
        "delete from document_chat_messages where user_id = $1",
        "delete from document_chat_threads where user_id = $1",
        "delete from document_chats where user_id = $1",
        "delete from document_annotations where user_id = $1",
        "delete from document_chunks where user_id = $1",
        "delete from documents where user_id = $1",
        "delete from user_plans where user_id = $1",
    ]
    async with pool.acquire() as conn:
        for statement in statements:
            try:
                # Isolate each delete in its own transaction so one missing table
                # does not abort all subsequent statements.
                async with conn.transaction():
                    await conn.execute(statement, user_id)
            except asyncpg.UndefinedTableError:
                continue


async def insert_account_deletion_log(
    pool: asyncpg.Pool,
    user_id: str,
    reason: str,
) -> None:
    async with pool.acquire() as conn:
        await conn.execute(
            """
            insert into account_deletion_logs (user_id, reason)
            values ($1::uuid, $2)
            """,
            user_id,
            reason,
        )


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


async def list_users_admin(
    pool,
    *,
    limit: int = 50,
    offset: int = 0,
    query: str | None = None,
    user_type: str | None = None,
    plan: str | None = None,
    stripe_status: str | None = None,
    has_unread: bool | None = None,
    active_days: int | None = None,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
) -> tuple[list[dict[str, Any]], int]:
    sort_map = {
        "id": "filtered.id",
        "email": "filtered.email",
        "plan": "filtered.plan",
        "user_type": "filtered.user_type",
        "created_at": "filtered.created_at",
        "last_sign_in_at": "filtered.last_sign_in_at",
        "last_activity_at": "filtered.last_activity_at",
        "unread": "filtered.unread_message_count",
        "documents": "filtered.document_count",
        "chats": "filtered.chat_count",
        "messages": "filtered.message_count",
        "tokens": "filtered.total_tokens",
    }
    order_by = sort_map.get(sort_by, sort_map["created_at"])
    order_dir = "asc" if str(sort_dir).lower() == "asc" else "desc"
    safe_limit = max(1, min(limit, 500))
    safe_offset = max(0, offset)
    q = (query or "").strip() or None
    safe_user_type = user_type if user_type in {"registered", "guest"} else None
    safe_plan = (plan or "").strip().lower() or None
    safe_stripe_status = (stripe_status or "").strip().lower() or None
    safe_active_days = None if active_days is None else max(1, min(int(active_days), 3650))
    sql_base = """
        with unread as (
            select user_id::text as user_id, count(*) as unread_count
            from admin_user_messages
            where direction = 'user' and read_at is null
            group by user_id::text
        ),
        usage_activity as (
            select
                user_id::text as user_id,
                min(created_at) as first_seen,
                max(created_at) as last_seen,
                coalesce(sum(total_tokens), 0) as total_tokens
            from usage_logs
            group by user_id::text
        ),
        doc_stats as (
            select user_id::text as user_id, count(*) as document_count
            from documents
            group by user_id::text
        ),
        chat_stats as (
            select user_id::text as user_id, count(*) as chat_count
            from document_chat_threads
            group by user_id::text
        ),
        message_stats as (
            select user_id::text as user_id, count(*) as message_count
            from document_chat_messages
            group by user_id::text
        ),
        registered as (
            select
                u.id::text as id,
                coalesce(nullif(u.email, ''), null) as email,
                u.created_at,
                u.last_sign_in_at,
                coalesce(nullif(p.plan, ''), 'free') as plan,
                p.stripe_status,
                p.current_period_end,
                coalesce(unread.unread_count, 0) as unread_message_count,
                coalesce(d.document_count, 0) as document_count,
                coalesce(c.chat_count, 0) as chat_count,
                coalesce(m.message_count, 0) as message_count,
                coalesce(ua.total_tokens, 0) as total_tokens,
                greatest(
                    coalesce(ua.last_seen, u.created_at),
                    coalesce(u.last_sign_in_at, u.created_at)
                ) as last_activity_at,
                'registered'::text as user_type
            from auth.users u
            left join user_plans p on p.user_id = u.id
            left join unread on unread.user_id = u.id::text
            left join usage_activity ua on ua.user_id = u.id::text
            left join doc_stats d on d.user_id = u.id::text
            left join chat_stats c on c.user_id = u.id::text
            left join message_stats m on m.user_id = u.id::text
        ),
        guests as (
            select
                ua.user_id as id,
                null::text as email,
                ua.first_seen as created_at,
                ua.last_seen as last_sign_in_at,
                coalesce(nullif(p.plan, ''), 'guest') as plan,
                p.stripe_status,
                p.current_period_end,
                coalesce(unread.unread_count, 0) as unread_message_count,
                coalesce(d.document_count, 0) as document_count,
                coalesce(c.chat_count, 0) as chat_count,
                coalesce(m.message_count, 0) as message_count,
                coalesce(ua.total_tokens, 0) as total_tokens,
                ua.last_seen as last_activity_at,
                'guest'::text as user_type
            from usage_activity ua
            left join user_plans p on p.user_id::text = ua.user_id
            left join unread on unread.user_id = ua.user_id
            left join doc_stats d on d.user_id = ua.user_id
            left join chat_stats c on c.user_id = ua.user_id
            left join message_stats m on m.user_id = ua.user_id
            where not exists (select 1 from auth.users u where u.id::text = ua.user_id)
        ),
        merged as (
            select * from registered
            union all
            select * from guests
        ),
        filtered as (
            select *
            from merged
            where ($1::text is null
                or merged.id ilike ('%' || $1::text || '%')
                or coalesce(merged.email, '') ilike ('%' || $1::text || '%'))
              and ($2::text is null or merged.user_type = $2::text)
              and ($3::text is null or lower(coalesce(merged.plan, '')) = $3::text)
              and ($4::text is null or lower(coalesce(merged.stripe_status, '')) = $4::text)
              and (
                  $5::boolean is null
                  or ($5::boolean = true and merged.unread_message_count > 0)
                  or ($5::boolean = false and merged.unread_message_count = 0)
              )
              and (
                  $6::int is null
                  or merged.last_activity_at >= (now() - make_interval(days => $6::int))
              )
        )
    """
    sql_count = sql_base + "select count(*)::bigint as total from filtered"
    sql_rows = (
        sql_base
        + f"""
        select
            filtered.id,
            filtered.email,
            filtered.created_at,
            filtered.last_sign_in_at,
            filtered.plan,
            filtered.stripe_status,
            filtered.current_period_end,
            filtered.unread_message_count,
            filtered.user_type,
            filtered.document_count,
            filtered.chat_count,
            filtered.message_count,
            filtered.total_tokens,
            filtered.last_activity_at
        from filtered
        order by {order_by} {order_dir}, filtered.id asc
        limit $7 offset $8
        """
    )
    params = [q, safe_user_type, safe_plan, safe_stripe_status, has_unread, safe_active_days]
    async with pool.acquire() as conn:
        total = await conn.fetchval(sql_count, *params)
        rows = await conn.fetch(sql_rows, *params, safe_limit, safe_offset)
    return [dict(row) for row in rows], int(total or 0)


async def get_user_detail_admin(pool, *, user_id: str) -> dict[str, Any] | None:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            with unread as (
                select count(*) as unread_count
                from admin_user_messages
                where direction = 'user'
                  and read_at is null
                  and user_id::text = $1
            ),
            activity as (
                select
                    min(created_at) as first_seen,
                    max(created_at) as last_seen,
                    coalesce(sum(total_tokens), 0) as total_tokens
                from usage_logs
                where user_id::text = $1
            ),
            registered as (
                select
                    u.id::text as id,
                    u.email,
                    u.created_at,
                    u.last_sign_in_at,
                    coalesce(nullif(p.plan, ''), 'free') as plan,
                    p.stripe_status,
                    p.stripe_price_id,
                    p.current_period_end,
                    p.stripe_customer_id,
                    'registered'::text as user_type,
                    greatest(
                        coalesce(a.last_seen, u.created_at),
                        coalesce(u.last_sign_in_at, u.created_at)
                    ) as last_activity_at
                from auth.users u
                left join user_plans p on p.user_id = u.id
                left join activity a on true
                where u.id::text = $1
            ),
            guest as (
                select
                    $1::text as id,
                    null::text as email,
                    a.first_seen as created_at,
                    a.last_seen as last_sign_in_at,
                    coalesce(nullif(p.plan, ''), 'guest') as plan,
                    p.stripe_status,
                    p.stripe_price_id,
                    p.current_period_end,
                    p.stripe_customer_id,
                    'guest'::text as user_type,
                    a.last_seen as last_activity_at
                from activity a
                left join user_plans p on p.user_id::text = $1
                where a.first_seen is not null
                  and not exists (select 1 from auth.users u where u.id::text = $1)
            )
            select
                base.id,
                base.email,
                base.created_at,
                base.last_sign_in_at,
                base.plan,
                base.stripe_status,
                base.stripe_price_id,
                base.current_period_end,
                base.stripe_customer_id,
                base.user_type,
                base.last_activity_at,
                coalesce((select unread_count from unread), 0) as unread_message_count
            from (
                select * from registered
                union all
                select * from guest
            ) as base
            limit 1
            """,
            user_id,
        )
        if not row:
            return None
        document_count = await conn.fetchval(
            "select count(*) from documents where user_id::text = $1",
            user_id,
        )
        chat_count = await conn.fetchval(
            "select count(*) from document_chat_threads where user_id::text = $1",
            user_id,
        )
        message_count = await conn.fetchval(
            "select count(*) from document_chat_messages where user_id::text = $1",
            user_id,
        )
        total_tokens = await conn.fetchval(
            "select coalesce(sum(total_tokens), 0) from usage_logs where user_id::text = $1",
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
            where user_id::text = $1
              and created_at >= (now() - make_interval(days => $2::int))
            group by 1
            order by 1
            """,
            user_id,
            days,
        )
    return [dict(row) for row in rows]


async def get_admin_overview(
    pool,
    *,
    start_at: datetime | None = None,
    end_at: datetime | None = None,
    period_key: str = "30d",
    parse_cost_per_page_usd: float = 0.01,
) -> dict[str, Any]:
    end_ts = end_at or datetime.now(timezone.utc)
    if start_at is not None and start_at > end_ts:
        start_at = end_ts
    async with pool.acquire() as conn:
        if start_at is None:
            range_row = await conn.fetchrow(
                """
                with points as (
                    select min(created_at) as min_at, max(created_at) as max_at from usage_logs
                    union all
                    select min(created_at) as min_at, max(created_at) as max_at from documents
                    union all
                    select min(created_at) as min_at, max(created_at) as max_at from document_chat_messages
                    union all
                    select min(created_at) as min_at, max(created_at) as max_at from auth.users
                    union all
                    select min(deleted_at) as min_at, max(deleted_at) as max_at from account_deletion_logs
                )
                select
                    min(min_at) as min_at,
                    max(max_at) as max_at
                from points
                """
            )
            range_data = dict(range_row) if range_row else {}
            start_ts = range_data.get("min_at") if range_data.get("min_at") is not None else end_ts
            if range_data.get("max_at") is not None:
                end_ts = max(end_ts, range_data.get("max_at"))
        else:
            start_ts = start_at

        if start_ts > end_ts:
            start_ts = end_ts

        window_days = max(1, (end_ts.date() - start_ts.date()).days + 1)
        summary_row = await conn.fetchrow(
            """
            with guest_users as (
                select distinct ul.user_id::text as user_id
                from usage_logs ul
                where not exists (
                    select 1
                    from auth.users u
                    where u.id::text = ul.user_id::text
                )
            ),
            eligible_users as (
                select u.id::text as user_id from auth.users u
                union
                select gu.user_id from guest_users gu
            )
            select
                (select count(*) from auth.users) as registered_users,
                (select count(*) from guest_users) as guest_users,
                (select count(*) from auth.users) + (select count(*) from guest_users) as users_total,
                (
                    select count(distinct ul.user_id::text)
                    from usage_logs ul
                    where ul.created_at >= $1::timestamptz
                      and ul.created_at < $2::timestamptz
                ) as active_users_window,
                (select count(*) from documents) as documents_total,
                (
                    select count(*)
                    from documents d
                    where d.created_at >= $1::timestamptz
                      and d.created_at < $2::timestamptz
                ) as documents_window,
                (select count(*) from document_chat_messages) as messages_total,
                (
                    select count(*)
                    from document_chat_messages m
                    where m.created_at >= $1::timestamptz
                      and m.created_at < $2::timestamptz
                ) as messages_window,
                (
                    select coalesce(sum(total_tokens), 0)
                    from usage_logs ul
                ) as tokens_total,
                (
                    select coalesce(sum(total_tokens), 0)
                    from usage_logs ul
                    where ul.created_at >= $1::timestamptz
                      and ul.created_at < $2::timestamptz
                ) as tokens_window,
                (
                    select coalesce(sum(pages), 0)
                    from usage_logs ul
                    where ul.operation = 'parse'
                ) as parse_pages_total,
                (
                    select coalesce(sum(pages), 0)
                    from usage_logs ul
                    where ul.operation = 'parse'
                      and ul.created_at >= $1::timestamptz
                      and ul.created_at < $2::timestamptz
                ) as parse_pages_window,
                (
                    select count(*)
                    from admin_user_messages m
                    where m.direction = 'user'
                      and m.read_at is null
                      and exists (
                          select 1
                          from eligible_users eu
                          where eu.user_id = m.user_id::text
                      )
                ) as unread_messages,
                (
                    select count(*)
                    from user_feedback f
                    where f.read_at is null
                ) as unread_feedback
            """,
            start_ts,
            end_ts,
        )
        usage_rows = await conn.fetch(
            """
            select
                created_at,
                operation,
                model,
                input_tokens,
                output_tokens,
                total_tokens,
                pages
            from usage_logs
            where created_at >= $1::timestamptz
              and created_at < $2::timestamptz
            order by created_at
            """,
            start_ts,
            end_ts,
        )
        daily_rows = await conn.fetch(
            """
            with days as (
                select generate_series(
                    date_trunc('day', $1::timestamptz),
                    date_trunc('day', $2::timestamptz - interval '1 second'),
                    interval '1 day'
                ) as day
            ),
            signups as (
                select date_trunc('day', created_at) as day, count(*) as count
                from auth.users
                where created_at >= $1::timestamptz
                  and created_at < $2::timestamptz
                group by 1
            ),
            active as (
                select date_trunc('day', created_at) as day, count(distinct user_id::text) as count
                from usage_logs
                where created_at >= $1::timestamptz
                  and created_at < $2::timestamptz
                group by 1
            ),
            docs as (
                select date_trunc('day', created_at) as day, count(*) as count
                from documents
                where created_at >= $1::timestamptz
                  and created_at < $2::timestamptz
                group by 1
            ),
            messages as (
                select date_trunc('day', created_at) as day, count(*) as count
                from document_chat_messages
                where created_at >= $1::timestamptz
                  and created_at < $2::timestamptz
                group by 1
            ),
            tokens as (
                select date_trunc('day', created_at) as day, coalesce(sum(total_tokens), 0) as total_tokens
                from usage_logs
                where created_at >= $1::timestamptz
                  and created_at < $2::timestamptz
                group by 1
            ),
            parse_pages as (
                select date_trunc('day', created_at) as day, coalesce(sum(pages), 0) as pages
                from usage_logs
                where operation = 'parse'
                  and created_at >= $1::timestamptz
                  and created_at < $2::timestamptz
                group by 1
            )
            select
                d.day,
                coalesce(s.count, 0) as signups,
                coalesce(a.count, 0) as active_users,
                coalesce(dc.count, 0) as documents,
                coalesce(m.count, 0) as messages,
                coalesce(t.total_tokens, 0) as tokens,
                coalesce(p.pages, 0) as parse_pages
            from days d
            left join signups s on s.day = d.day
            left join active a on a.day = d.day
            left join docs dc on dc.day = d.day
            left join messages m on m.day = d.day
            left join tokens t on t.day = d.day
            left join parse_pages p on p.day = d.day
            order by d.day
            """,
            start_ts,
            end_ts,
        )
        model_rows = await conn.fetch(
            """
            select
                coalesce(nullif(model, ''), 'unknown') as model,
                count(*) as calls,
                coalesce(sum(total_tokens), 0) as total_tokens,
                coalesce(sum(input_tokens), 0) as input_tokens,
                coalesce(sum(output_tokens), 0) as output_tokens
            from usage_logs
            where created_at >= $1::timestamptz
              and created_at < $2::timestamptz
            group by 1
            order by total_tokens desc, calls desc, model asc
            limit 12
            """,
            start_ts,
            end_ts,
        )
        try:
            user_type_rows = await conn.fetch(
                """
            with window_usage as (
                select distinct ul.user_id::text as user_id
                from usage_logs ul
                where ul.created_at >= $1::timestamptz
                  and ul.created_at < $2::timestamptz
            ),
            classified as (
                select
                    wu.user_id,
                    case
                        when not exists (
                            select 1 from auth.users u where u.id::text = wu.user_id
                        ) then 'guest'
                        when exists (
                            select 1
                            from user_plans p
                            where p.user_id::text = wu.user_id
                              and p.plan = 'plus'
                        ) then 'plus'
                        else 'free'
                    end as user_type
                from window_usage wu
            ),
            counts as (
                select user_type, count(*)::bigint as users
                from classified
                group by 1
                union all
                select 'deleted'::text as user_type, count(distinct ad.user_id::text)::bigint as users
                from account_deletion_logs ad
                where ad.deleted_at >= $1::timestamptz
                  and ad.deleted_at < $2::timestamptz
            )
            select
                user_type,
                users
            from counts
            order by case user_type
                when 'guest' then 1
                when 'free' then 2
                when 'plus' then 3
                when 'deleted' then 4
                else 100
            end
            """,
                start_ts,
                end_ts,
            )
        except asyncpg.UndefinedTableError:
            user_type_rows = []

    summary = dict(summary_row) if summary_row else {}
    window_tokens = int(summary.get("tokens_window") or 0)
    window_parse_pages = int(summary.get("parse_pages_window") or 0)
    daily_by_day: dict[str, dict[str, float]] = {}
    for row in daily_rows:
        item = dict(row)
        day = item.get("day")
        day_key = day.isoformat() if day is not None else ""
        daily_by_day[day_key] = {
            "token_cost_usd": 0.0,
            "parse_cost_usd": 0.0,
        }

    token_cost_window = 0.0
    parse_cost_window = 0.0
    for row in usage_rows:
        data = dict(row)
        cost = _estimate_usage_cost_usd(
            operation=data.get("operation"),
            model=data.get("model"),
            input_tokens=data.get("input_tokens"),
            output_tokens=data.get("output_tokens"),
            pages=data.get("pages"),
            parse_cost_per_page_usd=parse_cost_per_page_usd,
        )
        created_at = data.get("created_at")
        day_key = ""
        if created_at is not None:
            day_key = created_at.date().isoformat()
        if day_key in daily_by_day:
            if str(data.get("operation") or "").lower() == "parse":
                daily_by_day[day_key]["parse_cost_usd"] += cost
                parse_cost_window += cost
            else:
                daily_by_day[day_key]["token_cost_usd"] += cost
                token_cost_window += cost

    daily = []
    for row in daily_rows:
        item = dict(row)
        day_tokens = int(item.get("tokens") or 0)
        day_pages = int(item.get("parse_pages") or 0)
        day = item.get("day")
        day_key = day.isoformat() if day is not None else ""
        costs = daily_by_day.get(day_key, {"token_cost_usd": 0.0, "parse_cost_usd": 0.0})
        item["token_cost_usd"] = round(float(costs.get("token_cost_usd") or 0.0), 6)
        item["parse_cost_usd"] = round(float(costs.get("parse_cost_usd") or 0.0), 6)
        # Backward-compatible keys for existing frontend
        item["token_cost_yen"] = item["token_cost_usd"]
        item["parse_cost_yen"] = item["parse_cost_usd"]
        item["tokens"] = day_tokens
        item["parse_pages"] = day_pages
        daily.append(item)
    model_breakdown = [dict(row) for row in model_rows]
    model_total_tokens = sum(int(item.get("total_tokens") or 0) for item in model_breakdown)
    model_total_cost = 0.0
    for item in model_breakdown:
        tokens = int(item.get("total_tokens") or 0)
        est_cost = _estimate_usage_cost_usd(
            operation="answer",
            model=item.get("model"),
            input_tokens=item.get("input_tokens"),
            output_tokens=item.get("output_tokens"),
            pages=None,
            parse_cost_per_page_usd=parse_cost_per_page_usd,
        )
        item["estimated_cost_usd"] = round(est_cost, 6)
        item["share"] = (tokens / model_total_tokens) if model_total_tokens > 0 else 0.0
        model_total_cost += est_cost

    user_type_counts: dict[str, int] = {"guest": 0, "free": 0, "plus": 0, "deleted": 0}
    for row in user_type_rows:
        item = dict(row)
        user_type = str(item.get("user_type") or "").strip().lower()
        if user_type in user_type_counts:
            user_type_counts[user_type] = int(item.get("users") or 0)
    user_type_total = sum(user_type_counts.values())
    user_types = [
        {
            "user_type": "guest",
            "users": user_type_counts["guest"],
            "share": (user_type_counts["guest"] / user_type_total) if user_type_total > 0 else 0.0,
        },
        {
            "user_type": "free",
            "users": user_type_counts["free"],
            "share": (user_type_counts["free"] / user_type_total) if user_type_total > 0 else 0.0,
        },
        {
            "user_type": "plus",
            "users": user_type_counts["plus"],
            "share": (user_type_counts["plus"] / user_type_total) if user_type_total > 0 else 0.0,
        },
        {
            "user_type": "deleted",
            "users": user_type_counts["deleted"],
            "share": (user_type_counts["deleted"] / user_type_total) if user_type_total > 0 else 0.0,
        },
    ]

    return {
        "windowDays": window_days,
        "period": {
            "key": period_key,
            "startAt": start_ts.isoformat(),
            "endAt": end_ts.isoformat(),
        },
        "rates": {
            "tokenCostPer1kYen": 0.0,
            "parseCostPerPageYen": float(parse_cost_per_page_usd),
            "tokenCostPer1kUsd": 0.0,
            "parseCostPerPageUsd": float(parse_cost_per_page_usd),
        },
        "summary": {
            "registeredUsers": int(summary.get("registered_users") or 0),
            "guestUsers": int(summary.get("guest_users") or 0),
            "usersTotal": int(summary.get("users_total") or 0),
            "activeUsersWindow": int(summary.get("active_users_window") or 0),
            "documentsTotal": int(summary.get("documents_total") or 0),
            "documentsWindow": int(summary.get("documents_window") or 0),
            "messagesTotal": int(summary.get("messages_total") or 0),
            "messagesWindow": int(summary.get("messages_window") or 0),
            "tokensTotal": int(summary.get("tokens_total") or 0),
            "tokensWindow": window_tokens,
            "parsePagesTotal": int(summary.get("parse_pages_total") or 0),
            "parsePagesWindow": window_parse_pages,
            "tokenCostWindowYen": round(token_cost_window, 6),
            "parseCostWindowYen": round(parse_cost_window, 6),
            "tokenCostWindowUsd": round(token_cost_window, 6),
            "parseCostWindowUsd": round(parse_cost_window, 6),
            "unreadMessages": int(summary.get("unread_messages") or 0),
            "unreadFeedback": int(summary.get("unread_feedback") or 0),
            "modelCostWindowUsd": round(model_total_cost, 6),
        },
        "daily": daily,
        "models": model_breakdown,
        "userTypes": user_types,
    }


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
            with eligible_users as (
                select u.id::text as user_id from auth.users u
                union
                select distinct ul.user_id::text as user_id from usage_logs ul
            )
            select count(*)
            from admin_user_messages m
            where m.direction = 'user'
              and m.read_at is null
              and exists (
                  select 1 from eligible_users eu where eu.user_id = m.user_id::text
              )
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

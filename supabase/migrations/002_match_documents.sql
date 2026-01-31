create or replace function match_documents(
    query_embedding vector(1536),
    match_count int,
    filter_document_id uuid default null
)
returns table (
    id uuid,
    document_id uuid,
    content text,
    metadata jsonb,
    similarity float
)
language sql
stable
as $$
    select
        document_chunks.id,
        document_chunks.document_id,
        document_chunks.content,
        document_chunks.metadata,
        1 - (document_chunks.embedding <=> query_embedding) as similarity
    from document_chunks
    where (filter_document_id is null or document_chunks.document_id = filter_document_id)
    order by document_chunks.embedding <=> query_embedding
    limit match_count;
$$;

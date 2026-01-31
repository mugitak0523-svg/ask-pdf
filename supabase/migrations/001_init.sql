create extension if not exists vector;

create table if not exists documents (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    title text,
    storage_path text,
    metadata jsonb,
    created_at timestamptz not null default now()
);

create table if not exists document_chunks (
    id uuid primary key default gen_random_uuid(),
    document_id uuid not null references documents(id) on delete cascade,
    content text not null,
    embedding vector(1536),
    metadata jsonb,
    created_at timestamptz not null default now()
);

create index if not exists document_chunks_document_id_idx on document_chunks(document_id);

insert into storage.buckets (id, name, public)
values ('pdfs', 'pdfs', false)
on conflict (id) do nothing;

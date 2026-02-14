alter table documents
add column if not exists status text not null default 'ready',
add column if not exists progress int,
add column if not exists error_message text,
add column if not exists updated_at timestamptz not null default now();

create index if not exists documents_status_idx on documents (status);

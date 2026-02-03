create table if not exists usage_logs (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    user_id uuid not null,
    operation text not null,
    document_id uuid references documents(id) on delete set null,
    chat_id uuid references document_chat_threads(id) on delete set null,
    message_id uuid references document_chat_messages(id) on delete set null,
    model text,
    input_tokens integer,
    output_tokens integer,
    total_tokens integer,
    pages integer,
    raw_usage jsonb,
    raw_request jsonb
);

create index if not exists usage_logs_user_idx
    on usage_logs(user_id, created_at desc);

create index if not exists usage_logs_operation_idx
    on usage_logs(operation);

create index if not exists usage_logs_document_idx
    on usage_logs(document_id);

alter table usage_logs enable row level security;

create policy "usage_logs_select_own" on usage_logs
for select
using (auth.uid() = user_id);

create policy "usage_logs_insert_own" on usage_logs
for insert
with check (auth.uid() = user_id);

create policy "usage_logs_update_own" on usage_logs
for update
using (auth.uid() = user_id);

create policy "usage_logs_delete_own" on usage_logs
for delete
using (auth.uid() = user_id);

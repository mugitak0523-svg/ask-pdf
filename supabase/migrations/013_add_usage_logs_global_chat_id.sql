alter table usage_logs
    add column if not exists global_chat_id uuid references global_chat_threads(id) on delete set null;

create index if not exists usage_logs_global_chat_idx
    on usage_logs(global_chat_id);

alter table usage_logs
    add column if not exists global_chat_message_id uuid references global_chat_messages(id) on delete set null;

create index if not exists usage_logs_global_chat_message_idx
    on usage_logs(global_chat_message_id);

drop index if exists usage_logs_global_chat_idx;
drop index if exists usage_logs_global_chat_message_idx;
alter table usage_logs drop column if exists global_chat_message_id;
alter table usage_logs drop column if exists global_chat_id;

drop table if exists global_chat_messages;
drop table if exists global_chat_threads;
drop function if exists set_global_chat_threads_updated_at;

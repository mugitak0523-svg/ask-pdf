create index if not exists document_chat_threads_document_user_updated_idx
  on document_chat_threads (document_id, user_id, updated_at desc, created_at desc);

create index if not exists document_chat_messages_chat_user_created_idx
  on document_chat_messages (chat_id, user_id, created_at desc);

create index if not exists documents_user_id_created_at_idx
  on documents (user_id, created_at desc);

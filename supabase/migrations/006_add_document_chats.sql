create table if not exists document_chats (
    id uuid primary key default gen_random_uuid(),
    document_id uuid not null references documents(id) on delete cascade,
    user_id uuid not null,
    data jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index if not exists document_chats_document_user_idx
    on document_chats(document_id, user_id);

alter table document_chats enable row level security;

create policy "document_chats_select_own" on document_chats
for select
using (auth.uid() = user_id);

create policy "document_chats_insert_own" on document_chats
for insert
with check (auth.uid() = user_id);

create policy "document_chats_update_own" on document_chats
for update
using (auth.uid() = user_id);

create policy "document_chats_delete_own" on document_chats
for delete
using (auth.uid() = user_id);

create or replace function set_document_chats_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists document_chats_set_updated_at on document_chats;
create trigger document_chats_set_updated_at
before update on document_chats
for each row execute function set_document_chats_updated_at();

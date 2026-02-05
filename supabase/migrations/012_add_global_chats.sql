create table if not exists global_chat_threads (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    title text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists global_chat_threads_user_idx
    on global_chat_threads(user_id, updated_at desc);

alter table global_chat_threads enable row level security;

create policy "global_chat_threads_select_own" on global_chat_threads
for select
using (auth.uid() = user_id);

create policy "global_chat_threads_insert_own" on global_chat_threads
for insert
with check (auth.uid() = user_id);

create policy "global_chat_threads_update_own" on global_chat_threads
for update
using (auth.uid() = user_id);

create policy "global_chat_threads_delete_own" on global_chat_threads
for delete
using (auth.uid() = user_id);

create or replace function set_global_chat_threads_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists global_chat_threads_set_updated_at on global_chat_threads;
create trigger global_chat_threads_set_updated_at
before update on global_chat_threads
for each row execute function set_global_chat_threads_updated_at();

create table if not exists global_chat_messages (
    id uuid primary key default gen_random_uuid(),
    chat_id uuid not null references global_chat_threads(id) on delete cascade,
    user_id uuid not null,
    role text not null,
    content text not null,
    status text,
    refs jsonb,
    created_at timestamptz not null default now()
);

create index if not exists global_chat_messages_chat_idx
    on global_chat_messages(chat_id, created_at);

alter table global_chat_messages enable row level security;

create policy "global_chat_messages_select_own" on global_chat_messages
for select
using (auth.uid() = user_id);

create policy "global_chat_messages_insert_own" on global_chat_messages
for insert
with check (auth.uid() = user_id);

create policy "global_chat_messages_update_own" on global_chat_messages
for update
using (auth.uid() = user_id);

create policy "global_chat_messages_delete_own" on global_chat_messages
for delete
using (auth.uid() = user_id);

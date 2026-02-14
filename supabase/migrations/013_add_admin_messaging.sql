create table if not exists admin_announcements (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    body text not null,
    status text not null default 'draft',
    created_at timestamptz not null default now(),
    created_by uuid,
    published_at timestamptz
);

create index if not exists admin_announcements_status_idx
    on admin_announcements(status, created_at desc);

alter table admin_announcements enable row level security;

create policy "admin_announcements_select_published" on admin_announcements
for select
using (status = 'published');

create table if not exists admin_user_messages (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    direction text not null,
    content text not null,
    admin_id uuid,
    created_at timestamptz not null default now(),
    read_at timestamptz
);

create index if not exists admin_user_messages_user_idx
    on admin_user_messages(user_id, created_at desc);

alter table admin_user_messages enable row level security;

create policy "admin_user_messages_select_own" on admin_user_messages
for select
using (auth.uid() = user_id);

create policy "admin_user_messages_insert_own" on admin_user_messages
for insert
with check (auth.uid() = user_id);

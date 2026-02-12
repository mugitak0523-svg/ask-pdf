create table if not exists user_feedback (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    user_id uuid not null,
    category text not null,
    message text not null
);

create index if not exists user_feedback_user_idx
    on user_feedback(user_id, created_at desc);

alter table user_feedback enable row level security;

create policy "user_feedback_select_own" on user_feedback
for select
using (auth.uid() = user_id);

create policy "user_feedback_insert_own" on user_feedback
for insert
with check (auth.uid() = user_id);

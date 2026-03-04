create table if not exists account_deletion_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    deleted_at timestamptz not null default now(),
    reason text not null
);

create index if not exists account_deletion_logs_user_id_idx
    on account_deletion_logs(user_id);

create index if not exists account_deletion_logs_deleted_at_idx
    on account_deletion_logs(deleted_at desc);

create table if not exists user_plans (
    user_id uuid primary key,
    plan text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table user_plans enable row level security;

create policy "user_plans_select_own" on user_plans
for select
using (auth.uid() = user_id);

create policy "user_plans_insert_own" on user_plans
for insert
with check (auth.uid() = user_id);

create policy "user_plans_update_own" on user_plans
for update
using (auth.uid() = user_id);

create policy "user_plans_delete_own" on user_plans
for delete
using (auth.uid() = user_id);

create or replace function set_user_plans_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_plans_set_updated_at on user_plans;
create trigger user_plans_set_updated_at
before update on user_plans
for each row execute function set_user_plans_updated_at();

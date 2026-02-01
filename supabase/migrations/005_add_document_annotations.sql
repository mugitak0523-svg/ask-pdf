create table if not exists document_annotations (
    id uuid primary key default gen_random_uuid(),
    document_id uuid not null references documents(id) on delete cascade,
    user_id uuid not null,
    data jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index if not exists document_annotations_document_user_idx
    on document_annotations(document_id, user_id);

alter table document_annotations enable row level security;

create policy "document_annotations_select_own" on document_annotations
for select
using (auth.uid() = user_id);

create policy "document_annotations_insert_own" on document_annotations
for insert
with check (auth.uid() = user_id);

create policy "document_annotations_update_own" on document_annotations
for update
using (auth.uid() = user_id);

create policy "document_annotations_delete_own" on document_annotations
for delete
using (auth.uid() = user_id);

create or replace function set_document_annotations_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists document_annotations_set_updated_at on document_annotations;
create trigger document_annotations_set_updated_at
before update on document_annotations
for each row execute function set_document_annotations_updated_at();

alter table documents enable row level security;
alter table document_chunks enable row level security;

create policy "documents_select_own" on documents
for select
using (auth.uid() = user_id);

create policy "documents_insert_own" on documents
for insert
with check (auth.uid() = user_id);

create policy "documents_update_own" on documents
for update
using (auth.uid() = user_id);

create policy "documents_delete_own" on documents
for delete
using (auth.uid() = user_id);

create policy "document_chunks_select_own" on document_chunks
for select
using (
  exists (
    select 1 from documents
    where documents.id = document_chunks.document_id
      and documents.user_id = auth.uid()
  )
);

create policy "document_chunks_insert_own" on document_chunks
for insert
with check (
  exists (
    select 1 from documents
    where documents.id = document_chunks.document_id
      and documents.user_id = auth.uid()
  )
);

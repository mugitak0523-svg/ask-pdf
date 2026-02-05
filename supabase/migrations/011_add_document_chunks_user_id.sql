alter table document_chunks add column if not exists user_id uuid;

update document_chunks dc
set user_id = d.user_id
from documents d
where d.id = dc.document_id
  and dc.user_id is null;

alter table document_chunks alter column user_id set not null;

create index if not exists document_chunks_user_idx
    on document_chunks(user_id);

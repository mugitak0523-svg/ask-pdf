alter table user_feedback
add column if not exists read_at timestamptz;

create index if not exists user_feedback_read_idx
    on user_feedback(read_at);

alter table user_plans
add column if not exists stripe_customer_id text,
add column if not exists stripe_subscription_id text,
add column if not exists stripe_price_id text,
add column if not exists stripe_status text,
add column if not exists current_period_end timestamptz,
add column if not exists stripe_schedule_id text;

create index if not exists user_plans_stripe_customer_id_idx
on user_plans (stripe_customer_id);

create index if not exists user_plans_stripe_schedule_id_idx
on user_plans (stripe_schedule_id);

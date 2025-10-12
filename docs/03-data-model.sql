-- 03 Data Model (V0)

create table if not exists intakes (
id uuid primary key default gen_random_uuid(),
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),

consent boolean not null default false,   -- 同意
customer_name text not null,              -- 氏名
phone text not null,                      -- 電話
email text,                               -- メール（任意）
address text,                             -- 住所（任意）

annual_income integer,                    -- 年収（万円）
budget_total integer,                     -- 予算（万円）
project_type text,                        -- 'new' | 'reform' | 'warehouse'

status text not null default 'new',       -- 'new' | 'done' など
form_version text not null default 'v1'
);

create index if not exists idx_intakes_status on intakes(status);
create index if not exists idx_intakes_created on intakes(created_at);

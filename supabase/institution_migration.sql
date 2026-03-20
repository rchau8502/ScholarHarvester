create table if not exists institution(
  id bigserial primary key,
  external_id text not null unique,
  source text not null default 'College Scorecard',
  name text not null,
  city text,
  state text,
  zip text,
  control text,
  locale text,
  locale_code int,
  carnegie_basic text,
  highest_degree text,
  website text,
  price_calculator_url text,
  student_size int,
  admission_rate double precision,
  sat_average int,
  act_midpoint double precision,
  avg_net_price int,
  tuition_in_state int,
  tuition_out_of_state int,
  federal_aid_rate double precision,
  completion_rate double precision,
  retention_rate double precision,
  median_earnings_10yr int,
  latitude double precision,
  longitude double precision,
  updated_at timestamptz not null default now()
);

create index if not exists institution_name_idx on institution using gin ((to_tsvector('english', coalesce(name,''))));
create index if not exists institution_state_idx on institution(state);
create index if not exists institution_control_idx on institution(control);

alter table institution enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'institution'
      and policyname = 'public read institutions'
  ) then
    create policy "public read institutions" on institution for select using (true);
  end if;
end $$;

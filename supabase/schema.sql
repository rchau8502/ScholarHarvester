-- ScholarStack Supabase schema

create extension if not exists pgcrypto;

-- Enums
create type if not exists cohort as enum ('freshman','transfer');
create type if not exists school_type as enum ('HighSchool','CommunityCollege','Other');

-- Core entities
create table if not exists campus(
  id bigserial primary key,
  name text unique not null,
  system text not null check (system in ('UC','CSU','Other'))
);

create table if not exists dataset(
  id bigserial primary key,
  title text not null,
  year int not null,
  cohort cohort not null,
  term text not null default 'Fall',
  source text not null default 'Unknown',
  notes text
);
create unique index if not exists dataset_unique_idx on dataset(title, year, cohort, term);

-- Metrics + Citations
create table if not exists metric(
  id bigserial primary key,
  dataset_id bigint references dataset(id) on delete cascade,
  campus text not null,
  major text,
  discipline text,
  source_school text,
  school_type school_type,
  cohort cohort not null,
  year int not null,
  term text,
  stat_name text not null,
  stat_value_numeric double precision,
  stat_value_text text,
  unit text,
  percentile text,
  notes text
);
create index if not exists metric_idx on metric (campus, major, discipline, cohort, year, stat_name);
create unique index if not exists metric_dedupe_idx on metric(dataset_id, campus, major, discipline, stat_name, year, term);

create table if not exists citation(
  id bigserial primary key,
  metric_id bigint references metric(id) on delete cascade,
  title text not null,
  publisher text not null,
  year int not null,
  source_url text not null,
  retrieved_at timestamptz default now(),
  interpretation_note text
);
create unique index if not exists citation_unique_idx on citation(metric_id, source_url);

-- Optional seed rows for demo KPIs (safe placeholders)
insert into campus(name, system)
  values ('UC Irvine','UC'), ('UCLA','UC'), ('UC San Diego','UC')
on conflict do nothing;

-- Optional reference data for source school search
create table if not exists source_school(
  id bigserial primary key,
  name text not null,
  school_type school_type not null,
  city text,
  state text
);
create index if not exists source_school_idx on source_school using gin ((to_tsvector('english', coalesce(name,''))));

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

-- RLS: public read-only, service role writes
alter table metric enable row level security;
alter table citation enable row level security;
alter table source_school enable row level security;
alter table institution enable row level security;

create policy "public read metrics" on metric for select using (true);
create policy "public read citations" on citation for select using (true);
create policy "public read source schools" on source_school for select using (true);
create policy "public read institutions" on institution for select using (true);

-- Cloud-synced planner state
create table if not exists user_plan(
  id uuid primary key default gen_random_uuid(),
  plan_key text unique not null,
  campus text not null,
  cohort cohort not null,
  focus text not null,
  source_school text,
  school_type school_type,
  tasks jsonb not null default '[]'::jsonb,
  schedule jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_plan_updated_idx on user_plan(updated_at desc);
alter table user_plan enable row level security;

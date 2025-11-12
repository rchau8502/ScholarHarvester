-- ScholarStack Supabase schema

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

-- RLS: public read-only, service role writes
alter table metric enable row level security;
alter table citation enable row level security;
alter table source_school enable row level security;

create policy "public read metrics" on metric for select using (true);
create policy "public read citations" on citation for select using (true);
create policy "public read source schools" on source_school for select using (true);

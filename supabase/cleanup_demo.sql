-- Remove previously seeded or synthetic records so planner output is based on official-source harvests only.

delete from citation where source_url like 'https://scholarstack.org/%';
delete from metric where notes ilike '%sample%' or notes ilike '%demo%';
delete from dataset where notes ilike '%sample%' or notes ilike '%demo%' or source ilike '%demo%';

-- Optional: if source_school table contains test rows, clear and let live ingestion repopulate.
-- delete from source_school;

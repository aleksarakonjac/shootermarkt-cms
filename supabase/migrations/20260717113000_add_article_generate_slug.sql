alter table public.articles
  add column if not exists generate_slug boolean not null default true;

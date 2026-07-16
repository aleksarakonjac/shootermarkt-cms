alter table public.articles_tags
  add column if not exists discipline_code varchar;

-- תפריט נפתח ל-status (גישה בטוחה — עמודה חדשה במקום המרה ישירה)
-- הריצי ב-Supabase → SQL Editor → New query → Run

do $$
begin
  create type public.participant_feedback_status as enum (
    'published',
    'private',
    'removed'
  );
exception
  when duplicate_object then null;
end $$;

drop view if exists public.participant_feedback_public;

-- ניקוי מניסיונות קודמים
alter table public.participant_feedback
  drop column if exists status_new;

-- הסרת כל אילוצי CHECK מהטבלה (גורמים לשגיאת enum = text)
do $$
declare
  r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid = 'public.participant_feedback'::regclass
      and contype = 'c'
  loop
    execute format(
      'alter table public.participant_feedback drop constraint %I',
      r.conname
    );
  end loop;
end $$;

do $$
declare
  col_type text;
begin
  select format_type(a.atttypid, a.atttypmod)
    into col_type
  from pg_attribute a
  join pg_class c on c.oid = a.attrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'participant_feedback'
    and a.attname = 'status'
    and a.attnum > 0
    and not a.attisdropped;

  -- כבר enum — לא צריך לעשות שוב
  if col_type = 'participant_feedback_status' then
    return;
  end if;

  alter table public.participant_feedback
    add column status_new public.participant_feedback_status;

  update public.participant_feedback
  set status_new = case status::text
    when 'published' then 'published'::public.participant_feedback_status
    when 'private' then 'private'::public.participant_feedback_status
    when 'removed' then 'removed'::public.participant_feedback_status
    else 'published'::public.participant_feedback_status
  end;

  alter table public.participant_feedback drop column status;
  alter table public.participant_feedback rename column status_new to status;
  alter table public.participant_feedback alter column status set not null;
  alter table public.participant_feedback
    alter column status set default 'published'::public.participant_feedback_status;
end $$;

comment on type public.participant_feedback_status is
  'published = באתר | private = לא לפרסום | removed = הוסר מהאתר';

create view public.participant_feedback_public as
select
  id,
  created_at,
  event_date,
  category,
  session_type,
  teacher_audience,
  subject_name,
  experience_text,
  display_name,
  case
    when display_name = 'full' then full_name
    else 'אנונימי'
  end as author_label
from public.participant_feedback
where consent_publish = true
  and status::text = 'published';

grant select on public.participant_feedback_public to anon, authenticated;

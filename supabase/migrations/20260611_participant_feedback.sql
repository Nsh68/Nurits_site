-- משובי משתתפים — «התנסינו ורצינו לומר»
-- הריצי ב-Supabase SQL Editor

create table if not exists public.participant_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  event_date date not null,
  category text not null check (
    category in ('public-lecture', 'teachers', 'app-development')
  ),
  session_type text check (
    session_type is null
    or session_type in ('lecture', 'workshop', 'lecture-workshop')
  ),
  teacher_audience text check (
    teacher_audience is null
    or teacher_audience in ('single-subject', 'multi-subject')
  ),
  subject_name text,
  experience_text text not null,
  consent_publish boolean not null,
  display_name text check (
    display_name is null
    or display_name in ('full', 'anonymous')
  ),
  status text not null default 'published' check (
    status in ('published', 'private', 'removed')
  ),
  auto_reply_sent_at timestamptz
);

comment on table public.participant_feedback is
  'משובי משתתפים מטופס QR — נפרד מ-contact_inquiries';

alter table public.participant_feedback enable row level security;

drop policy if exists "Anyone can submit feedback" on public.participant_feedback;
create policy "Anyone can submit feedback"
  on public.participant_feedback
  for insert
  to anon, authenticated
  with check (true);

-- תצוגה ציבורית בלי דוא"ל
create or replace view public.participant_feedback_public as
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
  and status = 'published';

grant select on public.participant_feedback_public to anon, authenticated;

-- טבלת פניות מטופס "יצירת קשר"
-- הריצי ב-Supabase: SQL Editor → New query → הדביקי והריצי

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text not null,
  topic text not null,
  topic_open text,
  message text,
  word_count integer not null default 0
);

comment on table public.contact_inquiries is 'פניות מטופס יצירת קשר באתר נורית שושני-הכל';

alter table public.contact_inquiries enable row level security;

-- מחיקת מדיניות ישנה אם קיימת (להרצה חוזרת)
drop policy if exists "Anyone can submit contact form" on public.contact_inquiries;

-- מבקרים באתר יכולים רק להוסיף שורה (לא לקרוא)
create policy "Anyone can submit contact form"
  on public.contact_inquiries
  for insert
  to anon, authenticated
  with check (true);

-- אין מדיניות SELECT ל-anon — הצפייה רק דרך לוח הבקרה של Supabase (service role)

-- Rate limiting for chat Edge Function (service role only — no public access)

create table if not exists public.chat_rate_limits (
  ip_hash text primary key,
  hour_window timestamptz not null,
  hour_count integer not null default 0,
  day_window date not null,
  day_count integer not null default 0,
  updated_at timestamptz not null default now()
);

comment on table public.chat_rate_limits is 'Chat abuse protection — updated only by Edge Function (service role)';

alter table public.chat_rate_limits enable row level security;

-- No SELECT/INSERT/UPDATE policies for anon — only service_role bypasses RLS

create or replace function public.increment_chat_rate(
  p_ip_hash text,
  p_hour_limit integer,
  p_day_limit integer
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_hour timestamptz := date_trunc('hour', v_now);
  v_day date := (v_now at time zone 'utc')::date;
  v_row public.chat_rate_limits;
begin
  insert into public.chat_rate_limits (ip_hash, hour_window, hour_count, day_window, day_count)
  values (p_ip_hash, v_hour, 1, v_day, 1)
  on conflict (ip_hash) do update set
    hour_count = case
      when chat_rate_limits.hour_window = v_hour then chat_rate_limits.hour_count + 1
      else 1
    end,
    hour_window = v_hour,
    day_count = case
      when chat_rate_limits.day_window = v_day then chat_rate_limits.day_count + 1
      else 1
    end,
    day_window = v_day,
    updated_at = v_now
  returning * into v_row;

  if v_row.hour_count > p_hour_limit or v_row.day_count > p_day_limit then
    return json_build_object('allowed', false);
  end if;

  return json_build_object('allowed', true);
end;
$$;

revoke all on function public.increment_chat_rate(text, integer, integer) from public;
grant execute on function public.increment_chat_rate(text, integer, integer) to service_role;

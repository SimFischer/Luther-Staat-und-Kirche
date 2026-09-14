-- =============================================================
-- Luther: Zwei-Regimente-Lehre – Supabase-Datenbank
-- Einmal im Supabase SQL Editor ausführen.
-- =============================================================

create extension if not exists pgcrypto;

create table if not exists public.luther_submissions (
  id uuid primary key default gen_random_uuid(),
  lesson_key text not null default 'luther-zwei-regimente',
  student_name text not null check (char_length(student_name) between 1 and 100),
  class_name text not null default '',
  submitted_at timestamptz not null default now(),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  completed_pages integer not null default 0 check (completed_pages >= 0),
  answers jsonb not null default '{}'::jsonb,
  highlights jsonb not null default '{}'::jsonb
);

create index if not exists luther_submissions_submitted_at_idx
  on public.luther_submissions (submitted_at desc);
create index if not exists luther_submissions_class_name_idx
  on public.luther_submissions (class_name);

-- Nur Nutzer, die hier eingetragen sind, dürfen die Lehrerseite lesen.
create table if not exists public.luther_teacher_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.luther_submissions enable row level security;
alter table public.luther_teacher_access enable row level security;

-- Bestehende Rechte sicher zurücksetzen und nur das Nötige freigeben.
revoke all on table public.luther_submissions from anon, authenticated;
revoke all on table public.luther_teacher_access from anon, authenticated;

grant insert on table public.luther_submissions to anon;
grant select on table public.luther_submissions to authenticated;
grant select on table public.luther_teacher_access to authenticated;

-- Schüler: dürfen ausschließlich neue Abgaben anlegen, aber nichts lesen.
drop policy if exists "students can submit luther work" on public.luther_submissions;
create policy "students can submit luther work"
on public.luther_submissions
for insert
to anon
with check (
  lesson_key = 'luther-zwei-regimente'
  and char_length(student_name) between 1 and 100
  and completed_pages >= 7
);

-- Lehrkräfte: dürfen nur ihren eigenen Freigabe-Eintrag sehen.
drop policy if exists "teachers can read own access" on public.luther_teacher_access;
create policy "teachers can read own access"
on public.luther_teacher_access
for select
to authenticated
using ((select auth.uid()) = user_id);

-- Lehrkräfte mit Freigabeeintrag dürfen alle Abgaben dieser Lernanwendung lesen.
drop policy if exists "approved teachers can read luther submissions" on public.luther_submissions;
create policy "approved teachers can read luther submissions"
on public.luther_submissions
for select
to authenticated
using (
  lesson_key = 'luther-zwei-regimente'
  and exists (
    select 1
    from public.luther_teacher_access t
    where t.user_id = (select auth.uid())
  )
);

-- =============================================================
-- Lehrkraft freischalten
-- 1. Im Supabase Dashboard unter Authentication > Users zuerst
--    einen Benutzer mit E-Mail + Passwort für die Lehrkraft anlegen.
-- 2. Danach DIESES Statement mit der entsprechenden Mail ausführen:
--
-- insert into public.luther_teacher_access (user_id)
-- select id from auth.users where email = 'DEINE-MAIL@SCHULE.DE'
-- on conflict (user_id) do nothing;
-- =============================================================

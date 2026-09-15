-- =====================================================================
--  Luther – Staat und Kirche | Datenbank-Einrichtung für Supabase
--  ---------------------------------------------------------------
--  Diese Datei einmalig im Supabase-Projekt ausführen:
--     Supabase Dashboard  ->  SQL Editor  ->  New query
--     Inhalt einfügen  ->  Run
--
--  Sicherheitsprinzip:
--   * Schülerinnen und Schüler arbeiten anonym (anon key) und dürfen
--     ausschließlich NEUE Einträge EINFÜGEN – Zwischenstände während der
--     Bearbeitung (art = 'zwischenstand') und die verbindliche Abgabe
--     am Ende (art = 'abgabe').
--   * Sie können keine Abgaben lesen, ändern oder löschen – auch die
--     eigene nicht.
--   * Lehrkräfte müssen angemeldet sein UND zusätzlich in der Tabelle
--     public.lehrkraefte freigeschaltet sein.
--   * Der service_role-Schlüssel wird nirgends im Frontend benötigt.
-- =====================================================================

-- ---------------------------------------------------------------- 1
-- Freigabeliste der Lehrkräfte
create table if not exists public.lehrkraefte (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  email       text,
  angelegt_am timestamptz not null default now()
);

comment on table public.lehrkraefte is
  'Zugriffsliste: nur hier eingetragene Konten dürfen Abgaben lesen.';

-- ---------------------------------------------------------------- 2
-- Schülerabgaben
create table if not exists public.abgaben (
  id              uuid primary key default gen_random_uuid(),
  erstellt_am     timestamptz not null default now(),
  art             text not null default 'abgabe',
  vorname         text not null,
  nachname        text not null,
  kurs            text not null,
  abgegeben_am    timestamptz not null default now(),
  dauer_sekunden  integer,
  fortschritt     jsonb   not null default '{}'::jsonb,
  antworten       jsonb   not null default '{}'::jsonb,
  markierungen    jsonb   not null default '{}'::jsonb,
  tafelbild       jsonb   not null default '{}'::jsonb,
  recherche       jsonb   not null default '{}'::jsonb,
  urteil          text,
  vollstaendig    boolean not null default false,
  client_id       text,
  constraint abgaben_art_gueltig check (art in ('abgabe', 'zwischenstand')),
  constraint abgaben_pflichtfelder check (
    length(btrim(vorname))  > 0 and
    length(btrim(nachname)) > 0 and
    length(btrim(kurs))     > 0
  )
);

-- Nachrüstung für bereits bestehende Projekte
alter table public.abgaben add column if not exists art text not null default 'abgabe';
alter table public.abgaben drop constraint if exists abgaben_art_gueltig;
alter table public.abgaben add constraint abgaben_art_gueltig check (art in ('abgabe', 'zwischenstand'));

create index if not exists abgaben_zeit_idx on public.abgaben (abgegeben_am desc);
create index if not exists abgaben_art_idx  on public.abgaben (art);
create index if not exists abgaben_kurs_idx on public.abgaben (kurs);

-- ---------------------------------------------------------------- 3
-- Prüffunktion: Ist das angemeldete Konto freigeschaltet?
create or replace function public.ist_lehrkraft()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.lehrkraefte l where l.user_id = auth.uid()
  );
$$;

revoke execute on function public.ist_lehrkraft() from public, anon;
grant  execute on function public.ist_lehrkraft() to authenticated;

-- ---------------------------------------------------------------- 4
-- Row Level Security
alter table public.abgaben     enable row level security;
alter table public.lehrkraefte enable row level security;

-- Rechte auf Tabellenebene eng fassen
revoke all on public.abgaben     from anon, authenticated;
revoke all on public.lehrkraefte from anon, authenticated;

grant insert on public.abgaben     to anon, authenticated;
grant select on public.abgaben     to authenticated;
grant delete on public.abgaben     to authenticated;
grant select on public.lehrkraefte to authenticated;

-- Abgeben darf jede und jeder (auch ohne Anmeldung)
drop policy if exists "abgabe einreichen" on public.abgaben;
create policy "abgabe einreichen"
  on public.abgaben for insert
  to anon, authenticated
  with check (true);

-- Lesen nur für freigeschaltete Lehrkräfte
drop policy if exists "lehrkraft liest abgaben" on public.abgaben;
create policy "lehrkraft liest abgaben"
  on public.abgaben for select
  to authenticated
  using (public.ist_lehrkraft());

-- Löschen nur für freigeschaltete Lehrkräfte
-- (z. B. um Testabgaben oder versehentliche Doppelabgaben zu entfernen).
-- Achtung: Ein gelöschter Eintrag ist endgültig weg. Vorher sichern:
-- im Lehrerbereich "Auswahl als JSON".
drop policy if exists "lehrkraft loescht abgaben" on public.abgaben;
create policy "lehrkraft loescht abgaben"
  on public.abgaben for delete
  to authenticated
  using (public.ist_lehrkraft());

-- Kein UPDATE: dafür existiert keine Policy. Abgaben bleiben unverändert,
-- wie sie eingegangen sind.

-- Lehrkräfte sehen nur den eigenen Freigabeeintrag
drop policy if exists "eigener freigabeeintrag" on public.lehrkraefte;
create policy "eigener freigabeeintrag"
  on public.lehrkraefte for select
  to authenticated
  using (user_id = auth.uid());

-- =====================================================================
--  LEHRERKONTO FREISCHALTEN
--  ---------------------------------------------------------------
--  1. Konto anlegen:
--       Dashboard -> Authentication -> Users -> "Add user"
--       (E-Mail + Passwort, "Auto Confirm User" aktivieren)
--  2. Danach dieses Statement ausführen und die E-Mail anpassen:
--
--       insert into public.lehrkraefte (user_id, email)
--       select id, email from auth.users
--       where email = 'lehrkraft@schule.de'
--       on conflict (user_id) do nothing;
--
--  Bequemer: einmal in lehrer.html anmelden. Ist das Konto noch nicht
--  freigeschaltet, zeigt die Seite den passenden Befehl bereits mit der
--  richtigen Benutzer-ID an, zum Kopieren und Ausführen.
--
--  3. Zum Entziehen der Berechtigung:
--       delete from public.lehrkraefte
--       where email = 'lehrkraft@schule.de';
--
--  EMPFEHLUNG: Unter Authentication -> Providers -> Email die
--  Selbstregistrierung ("Enable email signups") deaktivieren, damit
--  sich niemand eigenständig ein Konto anlegen kann.
-- =====================================================================

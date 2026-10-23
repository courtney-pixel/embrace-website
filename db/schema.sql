-- Run this once in the Supabase SQL editor after creating your project.

-- Newsletter subscribers
create table if not exists subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

-- All other form submissions (advice, podcast, columns, events)
create table if not exists submissions (
  id         uuid primary key default gen_random_uuid(),
  type       text not null check (type in ('advice', 'podcast', 'columns', 'events', 'contact')),
  data       jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists submissions_type_idx on submissions(type);
create index if not exists submissions_created_idx on submissions(created_at desc);

-- Row-level security: lock down both tables.
-- Only the service role key (used in Netlify functions) can read/write.
alter table subscribers enable row level security;
alter table submissions enable row level security;

-- No public access
create policy "No public access" on subscribers for all using (false);
create policy "No public access" on submissions for all using (false);

-- Data API grants. REQUIRED for any table created on or after 30 Oct 2026.
-- Supabase no longer auto-grants Data API access to new tables in "public",
-- so re-running this file on a fresh project or preview branch after that
-- date creates the tables but leaves them unreachable over /rest/v1.
-- Without these grants, api/subscribe.js and api/contact.js return
-- "permission denied" even though they use the service key: Postgres checks
-- the table grant before RLS runs. service_role bypasses RLS, not grants.
--
-- Deliberately NOT granted to anon or authenticated. These tables hold
-- subscriber emails and unmoderated public form submissions, and the only
-- reader is the server-side service key. Do not paste the anon grant from
-- Supabase's generic migration snippet in here.
grant select, insert, update, delete on public.subscribers to service_role;
grant select, insert, update, delete on public.submissions to service_role;

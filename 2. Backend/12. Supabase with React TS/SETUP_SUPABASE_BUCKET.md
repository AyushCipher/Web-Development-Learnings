# Supabase Setup

This project needs a real Supabase project - unlike the MongoDB/Postgres
projects elsewhere in this repo, there's no "local" substitute: Supabase
bundles Postgres + Auth + Storage + Realtime behind one hosted API, so the
app talks to your actual project directly. This file covers everything the
code in `src/api.ts` and `src/supabase-client.ts` expects to already exist.

## 1. Create a project

Go to [supabase.com](https://supabase.com) → New Project (the free tier is
enough for this app). Once it's provisioned, open **Settings → API** and copy:

- **Project URL** → `VITE_SUPABASE_URL`
- **anon / public key** → `VITE_SUPABASE_ANON_KEY`

Create `.env.local` in this folder (already gitignored via the `*.local`
pattern in `.gitignore`):

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 2. Create the `tasks` table

`src/types.ts`'s `Task` interface is the source of truth for the columns
`src/api.ts` reads/writes. In the Supabase dashboard's **SQL Editor**, run:

```sql
create table public.tasks (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null,
  image_url text,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Row Level Security: on by default for new tables. Without a policy, every
-- request is denied - including your own app's, even signed in.
alter table public.tasks enable row level security;

-- Minimal policy for this demo: any authenticated user can read/write any
-- task. A stricter version would scope each policy to auth.email() = email
-- (or better, a user_id column referencing auth.users) so users can only
-- see/edit their own tasks.
create policy "Authenticated users can do anything"
  on public.tasks
  for all
  to authenticated
  using (true)
  with check (true);
```

## 3. Enable Realtime on the table

`src/api.ts`'s `subscribeToTaskChanges` listens for `postgres_changes` on
`public.tasks`. In the dashboard: **Database → Replication**, find the
`tasks` table, and toggle it on (or run
`alter publication supabase_realtime add table public.tasks;` in the SQL
Editor).

## 4. Create the storage bucket

`src/api.ts`'s `uploadImage` uploads to a bucket named `tasks-buckets`
(see the `BUCKET_NAME` constant) and calls `getPublicUrl()` on it
afterward, so the bucket needs to be public:

1. **Storage → New bucket** → name it exactly `tasks-buckets` → toggle
   **Public bucket** on.
2. Add an upload policy so signed-in users can actually write to it
   (a public bucket only makes *reads* public by default) - **Storage →
   tasks-buckets → Policies → New policy**, or via SQL:

```sql
create policy "Authenticated users can upload task images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'tasks-buckets');
```

## 5. Run it

```bash
npm install
npm run dev
```

Sign up with any email/password on the Auth screen (Supabase's default
email-confirmation setting may require you to click a confirmation link
before you can sign in - **Authentication → Providers → Email** lets you
turn that off for local testing).

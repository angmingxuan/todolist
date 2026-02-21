# Task Manager Web App

A simple, full-featured **Todo / Task Manager** built with plain HTML, CSS, and JavaScript.
Uses **Supabase** as a hosted PostgreSQL database — no backend server required.

---

## Quick Start

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up (free).
2. Click **New Project**, give it a name, and wait for it to provision.

### 2. Create the `tasks` Table

In your Supabase project, open the **SQL Editor** and run:

```sql
create table tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  completed   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Allow public (anon) read/write access
alter table tasks enable row level security;

create policy "Allow all" on tasks
  for all using (true) with check (true);
```

### 3. Add Your Credentials

1. In Supabase: go to **Settings → API**.
2. Copy the **Project URL** and **anon public** key.
3. Open `config.js` in this project and replace the placeholders:

```js
const SUPABASE_URL  = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON = 'YOUR_ANON_KEY_HERE';
```

### 4. Open the App

Double-click `index.html` to open it in your browser — that's it!

> **Tip:** For a better experience (avoid CORS issues when loading local files), serve it with a simple local server:
> ```
> npx serve .
> ```
> Then visit `http://localhost:3000`.

---

## Using GitHub Desktop

1. Open **GitHub Desktop** and choose **File → Add Local Repository**.
2. Select this `Question3` folder.
3. GitHub Desktop will initialise the repo (click "create a repository" if prompted).
4. Make your code changes, write a commit message, and click **Commit to main**.
5. Click **Publish repository** to push to GitHub.

To deploy publicly for free, enable **GitHub Pages** in your repository's Settings → Pages (set source to the `main` branch root).

---

## Features

| Feature | Description |
|---|---|
| Add task | Type and press Enter or click **Add** |
| Complete task | Click the circle or the task text |
| Delete task | Click the × button |
| Filter | Toggle All / Active / Completed |
| Clear completed | Remove all finished tasks at once |
| Persistent | All data stored in Supabase (survives refresh) |

---

## Project Structure

```
Question3/
├── index.html   — App shell & markup
├── style.css    — All styles
├── config.js    — Supabase credentials (fill in yours)
├── app.js       — CRUD logic & rendering
└── README.md    — This file
```

---

## Security Note

The `anon` key in `config.js` is a **public** key — it's safe to commit,
but make sure your Supabase **Row Level Security (RLS)** policies are enabled
(the SQL above does this). Never put your `service_role` key in client code.
# todolist

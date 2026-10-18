# AquaTrack

Inventory and container tracking for a small water-refilling station. Staff register
customers and physical reusable containers, assign containers to customers, record returns,
and see the full history. The system always knows which customer has a given container and
which containers are available at the station.

## What it does

- **Dashboard** – totals, a breakdown per container type, customers holding containers, recent activity
- **Containers** – container types (configurable) and individual containers, with search and status filter
- **Customers** – register customers and see how many containers each one holds
- **Transactions** – searchable, filterable, paged history of every assignment and return
- **Assign / Return** (top bar) – assign containers from several types at once, by range
  (`01`–`19`) or specific list (`01, 09, 20` or `TR, AA`); return a customer's containers one by one or all together

## Tech stack

React, TypeScript, Vite, Tailwind CSS, React Router, Lucide icons, and Supabase
(Postgres, authentication and row-level security) as the backend.

## Getting started

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project

Create a project at [supabase.com](https://supabase.com). In **Project Settings → API**, copy the
**Project URL** and the **publishable (or anon) key**.
Never put the **secret / service_role** key in this project.

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill it in:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

`.env.local` is ignored by Git and must never be committed.

### 4. Create the database

In the Supabase **SQL Editor**, run each file in `supabase/migrations/` **in this order**
(copy the whole file, paste, click Run). Saving the files does not run them.

1. `20261001000000_initial_schema.sql`
2. `20261001000100_container_functions.sql`
3. `20261003000000_container_type_identifiers.sql`
4. `20261003000100_remove_type_number_range.sql`
5. `20261003000200_batch_assign_and_return.sql`
6. `20261003000300_transaction_history_view.sql`
7. `20261003000400_dashboard_views.sql`
8. `20261003000500_tighten_privileges.sql`

### 5. Staff accounts

1. In **Authentication → Sign In / Providers**, turn **off** "Allow new users to sign up".
2. In **Authentication → Users**, use **Add user → Create new user** for each staff member.

All staff accounts have the same permissions.

### 6. Run

```bash
npm run dev       # development server at http://localhost:5173
npm run build     # type-check and production build
npm run lint      # code checks
npm run preview   # serve the production build locally
```

## Project structure

```
src/
├── components/   shared UI: Modal, ConfirmModal, PageHeader, AnimatedNumber
├── features/     one folder per area of the app
│   ├── auth/         login state and protected routes
│   ├── containers/   container types, containers, number/letter code handling
│   ├── customers/
│   ├── dashboard/
│   └── transactions/ assign and return modals, history table
├── hooks/        useAsyncData, useDebouncedValue
├── layouts/      sidebar, top bar, page shell
├── lib/          Supabase client, error helpers, refresh signal, fetchAllRows
├── pages/        one component per route
├── services/     every database query lives here
└── types/        database types and friendly model names
supabase/
└── migrations/   the database, as SQL files applied in order
```

Data flows one way: **page → hook → service → Supabase**. Components never call
Supabase directly; all queries live in `src/services`.

## Business rules

- A container is `available`, `with_customer`, or `retired`. The database guarantees a
  container has a holder if and only if its status is `with_customer`.
- Container numbers look like `KEY-CODE`, where the key belongs to the container type
  (`PG`) and the code is digits (`01`) or letters (`TR`). Numbers are unique.
- Assigning and returning run inside the database (`assign_containers`, `return_containers`):
  the container update and its history rows are saved together, all or nothing.
- Every container movement is one row in `transactions`. History is never edited or deleted.
- Nothing is deleted from the app: containers are retired, customers and types are deactivated.

## Security model

- Only logged-in staff can read or write anything; the public has no access.
- Row-level security is enabled on every table. Staff can read, add and update customers,
  containers and container types. Transactions are read-only from the app and are only written
  by the assign / return functions. Nobody can delete from the app.
- Sign-ups must stay **disabled** in Supabase, because every logged-in user can see all data.

## Changing the database

1. Add a new SQL file in `supabase/migrations/` (never edit one that has already been run).
2. Run it in the Supabase SQL Editor.
3. Update `src/types/database.types.ts` by hand to match.
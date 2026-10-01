-- AquaTrack initial schema
-- Tables: container_types, customers, containers, transactions

-- ---------------------------------------------------------------
-- Shared helper: keeps updated_at current whenever a row changes
-- ---------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------
-- container_types: configurable list of container types
-- ---------------------------------------------------------------
create table public.container_types (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Type names must be unique, ignoring upper/lower case
create unique index container_types_name_unique
  on public.container_types (lower(name));

create trigger set_updated_at
  before update on public.container_types
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(trim(full_name)) > 0),
  phone text,
  address text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- containers: one row per physical container
-- ---------------------------------------------------------------
create table public.containers (
  id uuid primary key default gen_random_uuid(),
  container_number text not null unique
    check (length(trim(container_number)) > 0),
  container_type_id uuid not null
    references public.container_types (id) on delete restrict,
  status text not null default 'available'
    check (status in ('available', 'with_customer', 'retired')),
  current_customer_id uuid
    references public.customers (id) on delete restrict,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- A container has a customer if and only if its status is 'with_customer'
  constraint containers_holder_matches_status
    check ((status = 'with_customer') = (current_customer_id is not null))
);

create index containers_container_type_id_idx
  on public.containers (container_type_id);
create index containers_current_customer_id_idx
  on public.containers (current_customer_id);
create index containers_status_idx
  on public.containers (status);

create trigger set_updated_at
  before update on public.containers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- transactions: permanent history (one row per container movement)
-- ---------------------------------------------------------------
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_number bigint generated always as identity unique,
  transaction_type text not null
    check (transaction_type in ('assign', 'return')),
  container_id uuid not null
    references public.containers (id) on delete restrict,
  customer_id uuid not null
    references public.customers (id) on delete restrict,
  notes text,
  created_by uuid
    references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create index transactions_container_id_idx
  on public.transactions (container_id, created_at desc);
create index transactions_customer_id_idx
  on public.transactions (customer_id, created_at desc);
create index transactions_created_at_idx
  on public.transactions (created_at desc);

-- ---------------------------------------------------------------
-- Privileges: only logged-in staff, and nobody can delete
-- ---------------------------------------------------------------
revoke all on public.container_types, public.customers,
  public.containers, public.transactions from anon;

grant select, insert, update
  on public.container_types, public.customers, public.containers
  to authenticated;

grant select on public.transactions to authenticated;

-- ---------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------
alter table public.container_types enable row level security;
alter table public.customers enable row level security;
alter table public.containers enable row level security;
alter table public.transactions enable row level security;

-- container_types
create policy "Staff can read container types"
  on public.container_types for select to authenticated using (true);
create policy "Staff can add container types"
  on public.container_types for insert to authenticated with check (true);
create policy "Staff can update container types"
  on public.container_types for update to authenticated
  using (true) with check (true);

-- customers
create policy "Staff can read customers"
  on public.customers for select to authenticated using (true);
create policy "Staff can add customers"
  on public.customers for insert to authenticated with check (true);
create policy "Staff can update customers"
  on public.customers for update to authenticated
  using (true) with check (true);

-- containers
create policy "Staff can read containers"
  on public.containers for select to authenticated using (true);
create policy "Staff can add containers"
  on public.containers for insert to authenticated with check (true);
create policy "Staff can update containers"
  on public.containers for update to authenticated
  using (true) with check (true);

-- transactions (read-only from the browser; writes come via functions in Step 3)
create policy "Staff can read transactions"
  on public.transactions for select to authenticated using (true);
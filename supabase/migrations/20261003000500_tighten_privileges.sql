-- Make the permissions exactly what the app needs, nothing more.
-- (Supabase can give new tables broader default permissions than we asked for.)
-- Row-level security still applies on top of this.

-- Nobody who is not logged in can touch anything
revoke all on public.container_types, public.customers,
  public.containers, public.transactions from anon;
revoke all on public.transaction_history, public.container_type_summary,
  public.customer_holdings from anon;

-- Logged-in staff: start from nothing...
revoke all on public.container_types, public.customers,
  public.containers, public.transactions from authenticated;
revoke all on public.transaction_history, public.container_type_summary,
  public.customer_holdings from authenticated;

-- ...then give back only what is needed
grant select, insert, update
  on public.container_types, public.customers, public.containers
  to authenticated;

-- Transactions are only ever written by the assign / return functions
grant select on public.transactions to authenticated;

grant select
  on public.transaction_history, public.container_type_summary, public.customer_holdings
  to authenticated;

notify pgrst, 'reload schema';
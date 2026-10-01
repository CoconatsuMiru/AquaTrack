-- Functions that move containers between the station and customers.
-- Each one updates the container AND writes the history row in a single
-- transaction. They run with elevated rights (security definer) because
-- the browser is not allowed to write to the transactions table directly,
-- so each function checks that the caller is a logged-in user.

-- ---------------------------------------------------------------
-- assign_container: give an available container to a customer
-- ---------------------------------------------------------------
create or replace function public.assign_container(
  p_container_id uuid,
  p_customer_id uuid,
  p_notes text default null
)
returns public.transactions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_container public.containers;
  v_customer public.customers;
  v_transaction public.transactions;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_customer
  from public.customers
  where id = p_customer_id;

  if not found then
    raise exception 'Customer not found';
  end if;

  if not v_customer.is_active then
    raise exception 'Customer % is inactive', v_customer.full_name;
  end if;

  -- Lock the container row so nobody else can change it at the same time
  select * into v_container
  from public.containers
  where id = p_container_id
  for update;

  if not found then
    raise exception 'Container not found';
  end if;

  if v_container.status <> 'available' then
    raise exception 'Container % is not available (status: %)',
      v_container.container_number, v_container.status;
  end if;

  update public.containers
  set status = 'with_customer',
      current_customer_id = p_customer_id
  where id = p_container_id;

  insert into public.transactions (transaction_type, container_id, customer_id, notes)
  values ('assign', p_container_id, p_customer_id, p_notes)
  returning * into v_transaction;

  return v_transaction;
end;
$$;

-- ---------------------------------------------------------------
-- return_container: take a container back from whoever holds it
-- ---------------------------------------------------------------
create or replace function public.return_container(
  p_container_id uuid,
  p_notes text default null
)
returns public.transactions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_container public.containers;
  v_transaction public.transactions;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_container
  from public.containers
  where id = p_container_id
  for update;

  if not found then
    raise exception 'Container not found';
  end if;

  if v_container.status <> 'with_customer' then
    raise exception 'Container % is not currently with a customer (status: %)',
      v_container.container_number, v_container.status;
  end if;

  -- The history row records who had it, taken from the container itself
  insert into public.transactions (transaction_type, container_id, customer_id, notes)
  values ('return', p_container_id, v_container.current_customer_id, p_notes)
  returning * into v_transaction;

  update public.containers
  set status = 'available',
      current_customer_id = null
  where id = p_container_id;

  return v_transaction;
end;
$$;

-- ---------------------------------------------------------------
-- Only logged-in staff may call these (by default everyone can)
-- ---------------------------------------------------------------
revoke execute on function public.assign_container(uuid, uuid, text) from public, anon;
revoke execute on function public.return_container(uuid, text) from public, anon;
grant execute on function public.assign_container(uuid, uuid, text) to authenticated;
grant execute on function public.return_container(uuid, text) to authenticated;
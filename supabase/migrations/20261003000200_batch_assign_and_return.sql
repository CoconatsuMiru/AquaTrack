-- Batch versions of assign / return.
-- Each function handles a whole list of containers in ONE transaction:
-- either every container is processed, or none are.
-- They replace the single-container versions.

drop function if exists public.assign_container(uuid, uuid, text);
drop function if exists public.return_container(uuid, text);

-- ---------------------------------------------------------------
-- assign_containers: give several available containers to a customer
-- Returns how many containers were assigned.
-- ---------------------------------------------------------------
create or replace function public.assign_containers(
  p_container_ids uuid[],
  p_customer_id uuid,
  p_notes text default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ids uuid[];
  v_customer public.customers;
  v_found integer;
  v_unavailable text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select array_agg(distinct id) into v_ids
  from unnest(p_container_ids) as id;

  if v_ids is null or cardinality(v_ids) = 0 then
    raise exception 'No containers selected';
  end if;

  if cardinality(v_ids) > 1000 then
    raise exception 'You can assign at most 1000 containers at a time';
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

  -- Lock all the containers so nobody else can change them at the same time
  perform 1
  from public.containers
  where id = any(v_ids)
  order by id
  for update;

  select count(*) into v_found
  from public.containers
  where id = any(v_ids);

  if v_found <> cardinality(v_ids) then
    raise exception 'One or more containers were not found';
  end if;

  select string_agg(container_number, ', ' order by container_number) into v_unavailable
  from public.containers
  where id = any(v_ids) and status <> 'available';

  if v_unavailable is not null then
    raise exception 'Not available: %', v_unavailable;
  end if;

  update public.containers
  set status = 'with_customer',
      current_customer_id = p_customer_id
  where id = any(v_ids);

  insert into public.transactions (transaction_type, container_id, customer_id, notes)
  select 'assign', id, p_customer_id, p_notes
  from unnest(v_ids) as id;

  return cardinality(v_ids);
end;
$$;

-- ---------------------------------------------------------------
-- return_containers: take several containers back from their customers
-- Returns how many containers were returned.
-- ---------------------------------------------------------------
create or replace function public.return_containers(
  p_container_ids uuid[],
  p_notes text default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ids uuid[];
  v_found integer;
  v_not_out text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select array_agg(distinct id) into v_ids
  from unnest(p_container_ids) as id;

  if v_ids is null or cardinality(v_ids) = 0 then
    raise exception 'No containers selected';
  end if;

  if cardinality(v_ids) > 1000 then
    raise exception 'You can return at most 1000 containers at a time';
  end if;

  perform 1
  from public.containers
  where id = any(v_ids)
  order by id
  for update;

  select count(*) into v_found
  from public.containers
  where id = any(v_ids);

  if v_found <> cardinality(v_ids) then
    raise exception 'One or more containers were not found';
  end if;

  select string_agg(container_number, ', ' order by container_number) into v_not_out
  from public.containers
  where id = any(v_ids) and status <> 'with_customer';

  if v_not_out is not null then
    raise exception 'Not currently with a customer: %', v_not_out;
  end if;

  -- The history rows record who had each container, taken from the container itself
  insert into public.transactions (transaction_type, container_id, customer_id, notes)
  select 'return', id, current_customer_id, p_notes
  from public.containers
  where id = any(v_ids);

  update public.containers
  set status = 'available',
      current_customer_id = null
  where id = any(v_ids);

  return cardinality(v_ids);
end;
$$;

-- ---------------------------------------------------------------
-- Only logged-in staff may call these (by default everyone can)
-- ---------------------------------------------------------------
revoke execute on function public.assign_containers(uuid[], uuid, text) from public, anon;
revoke execute on function public.return_containers(uuid[], text) from public, anon;
grant execute on function public.assign_containers(uuid[], uuid, text) to authenticated;
grant execute on function public.return_containers(uuid[], text) to authenticated;

-- Tell Supabase to refresh its list of available functions
notify pgrst, 'reload schema';
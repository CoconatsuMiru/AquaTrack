-- Container types get an identifier key (e.g. "PG") and a number range (e.g. 1 to 99).
-- The full container number is built by the app as KEY-NUMBER, e.g. PG-01.

alter table public.container_types
  add column identifier_key text,
  add column number_min integer,
  add column number_max integer;

-- Existing types (test data) get temporary values so the columns can become required.
-- Edit them to the real values in the app afterwards.
with numbered as (
  select id, row_number() over (order by created_at, id) as n
  from public.container_types
)
update public.container_types as t
set identifier_key = 'TYPE' || numbered.n,
    number_min = 1,
    number_max = 9999
from numbered
where t.id = numbered.id;

alter table public.container_types
  alter column identifier_key set not null,
  alter column number_min set not null,
  alter column number_max set not null;

alter table public.container_types
  add constraint container_types_identifier_key_format
    check (identifier_key ~ '^[A-Z0-9]{1,10}$'),
  add constraint container_types_number_range
    check (number_min >= 0 and number_max >= number_min and number_max <= 100000);

-- Two types can never share a key
create unique index container_types_identifier_key_unique
  on public.container_types (identifier_key);
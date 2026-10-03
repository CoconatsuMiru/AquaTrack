-- The number range is no longer stored on the container type.
-- It is entered when adding containers (min / max), which creates the whole batch.

alter table public.container_types
  drop constraint if exists container_types_number_range;

alter table public.container_types
  drop column number_min,
  drop column number_max;
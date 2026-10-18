import type { PostgrestError } from '@supabase/supabase-js'

// Supabase returns at most 1,000 rows per request. This asks for the rows in chunks
// of 1,000 until there are no more, so lists never get silently cut off.
// The query passed in must have a stable sort order (ending in a unique column).
const PAGE_SIZE = 1000

type PageResponse<T> = {
  data: T[] | null
  error: PostgrestError | null
}

export async function fetchAllRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResponse<T>>,
): Promise<T[]> {
  const rows: T[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1)

    if (error) throw error

    rows.push(...(data ?? []))

    // A short page means that was the last one
    if (!data || data.length < PAGE_SIZE) return rows
  }
}
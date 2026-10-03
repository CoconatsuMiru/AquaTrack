export const MAX_BATCH_SIZE = 1000

export type NumberRange = {
  from: number
  to: number
  // How many digits to pad to, e.g. 2 gives "01"
  width: number
}

export type RangeResult = { ok: true; range: NumberRange } | { ok: false; message: string }

// fromText / toText are exactly what the user typed, e.g. "01" and "99".
// If toText is empty, the range is just the single number in fromText.
export function parseNumberRange(fromText: string, toText: string): RangeResult {
  const from = fromText.trim()
  const to = toText.trim() === '' ? from : toText.trim()

  if (from === '') {
    return { ok: false, message: 'Enter the min number.' }
  }

  if (!/^\d{1,6}$/.test(from) || !/^\d{1,6}$/.test(to)) {
    return { ok: false, message: 'Numbers must be digits only (up to 6 digits).' }
  }

  const fromNumber = Number(from)
  const toNumber = Number(to)

  if (toNumber < fromNumber) {
    return { ok: false, message: 'The max number cannot be smaller than the min number.' }
  }

  if (toNumber - fromNumber + 1 > MAX_BATCH_SIZE) {
    return { ok: false, message: `You can add at most ${MAX_BATCH_SIZE} containers at a time.` }
  }

  return {
    ok: true,
    range: { from: fromNumber, to: toNumber, width: Math.max(from.length, to.length) },
  }
}

// ("PG", 7, width 2) -> "PG-07"
export function formatContainerNumber(identifierKey: string, number: number, width: number): string {
  return `${identifierKey}-${String(number).padStart(width, '0')}`
}

// ("PG", 1 to 99, width 2) -> ["PG-01", "PG-02", ... "PG-99"]
export function buildContainerNumbers(identifierKey: string, range: NumberRange): string[] {
  const numbers: string[] = []
  for (let number = range.from; number <= range.to; number++) {
    numbers.push(formatContainerNumber(identifierKey, number, range.width))
  }
  return numbers
}
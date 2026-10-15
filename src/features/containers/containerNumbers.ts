export const MAX_BATCH_SIZE = 1000

export type SuffixMode = 'range' | 'list'

// What the staff member has typed into the "which containers?" fields
export type SuffixInputState = {
  mode: SuffixMode
  minText: string
  maxText: string
  listText: string
}

export const emptySuffixInput: SuffixInputState = {
  mode: 'range',
  minText: '',
  maxText: '',
  listText: '',
}

// The result of reading what was typed:
// nothing typed yet, a problem to show, or the list of codes (e.g. ["01", "02"] or ["TR", "AA"])
export type SuffixResult =
  | { status: 'empty' }
  | { status: 'error'; message: string }
  | { status: 'ok'; suffixes: string[] }

type SuffixKind = 'digits' | 'letters'

const CODE_HELP = 'Use digits only (up to 6) or letters only (up to 3), like 01 or TR.'
const TOO_MANY = `You can use at most ${MAX_BATCH_SIZE} containers at a time.`

// A code is digits only ("01") or letters only ("TR"), never a mix
function getKind(text: string): SuffixKind | null {
  if (/^\d{1,6}$/.test(text)) return 'digits'
  if (/^[A-Z]{1,3}$/.test(text)) return 'letters'
  return null
}

// Letters count like spreadsheet columns: A = 1 ... Z = 26, AA = 27, AB = 28 ...
function lettersToNumber(letters: string): number {
  let value = 0
  for (const letter of letters) {
    value = value * 26 + (letter.charCodeAt(0) - 64)
  }
  return value
}

function numberToLetters(value: number): string {
  let rest = value
  let letters = ''
  while (rest > 0) {
    rest -= 1
    letters = String.fromCharCode(65 + (rest % 26)) + letters
    rest = Math.floor(rest / 26)
  }
  return letters
}

// Lets "1", "01" and "001" count as the same code, and "tr" as "TR"
export function normalizeSuffix(suffix: string): string {
  return /^\d+$/.test(suffix) ? String(Number(suffix)) : suffix.toUpperCase()
}

function parseRange(minText: string, maxText: string): SuffixResult {
  const from = minText.trim().toUpperCase()
  // With no max, the range is just the single code in "min"
  const to = maxText.trim() === '' ? from : maxText.trim().toUpperCase()

  const fromKind = getKind(from)
  const toKind = getKind(to)

  if (!fromKind || !toKind) {
    return { status: 'error', message: CODE_HELP }
  }

  if (fromKind !== toKind) {
    return { status: 'error', message: 'The min and max must both be numbers or both be letters.' }
  }

  const suffixes: string[] = []

  if (fromKind === 'digits') {
    const first = Number(from)
    const last = Number(to)

    if (last < first) {
      return { status: 'error', message: 'The max cannot be smaller than the min.' }
    }
    if (last - first + 1 > MAX_BATCH_SIZE) {
      return { status: 'error', message: TOO_MANY }
    }

    // Pad to the longer of the two typed numbers, so 01 and 99 give 01, 02, ... 99
    const width = Math.max(from.length, to.length)
    for (let number = first; number <= last; number++) {
      suffixes.push(String(number).padStart(width, '0'))
    }
  } else {
    const first = lettersToNumber(from)
    const last = lettersToNumber(to)

    if (last < first) {
      return {
        status: 'error',
        message: 'The max cannot come before the min (for example, AA comes before AZ).',
      }
    }
    if (last - first + 1 > MAX_BATCH_SIZE) {
      return { status: 'error', message: TOO_MANY }
    }

    for (let value = first; value <= last; value++) {
      suffixes.push(numberToLetters(value))
    }
  }

  return { status: 'ok', suffixes }
}

// Reads "01, 02, 09, 20" or "TR, AA, KL" (commas, spaces or semicolons between codes)
function parseList(text: string): SuffixResult {
  const tokens = text.toUpperCase().split(/[\s,;]+/).filter(Boolean)

  if (tokens.length === 0) {
    return { status: 'empty' }
  }

  const suffixes: string[] = []
  const seen = new Set<string>()

  for (const token of tokens) {
    if (!getKind(token)) {
      return { status: 'error', message: `"${token}" is not valid. ${CODE_HELP}` }
    }

    // Ignore duplicates
    const key = normalizeSuffix(token)
    if (!seen.has(key)) {
      seen.add(key)
      suffixes.push(token)
    }
  }

  if (suffixes.length > MAX_BATCH_SIZE) {
    return { status: 'error', message: TOO_MANY }
  }

  return { status: 'ok', suffixes }
}

export function parseSuffixInput(input: SuffixInputState): SuffixResult {
  if (input.mode === 'range') {
    if (input.minText.trim() === '') {
      return { status: 'empty' }
    }
    return parseRange(input.minText, input.maxText)
  }

  return parseList(input.listText)
}

// ("DD", ["TR", "AA"]) -> ["DD-TR", "DD-AA"]
export function buildContainerNumbers(identifierKey: string, suffixes: string[]): string[] {
  return suffixes.map((suffix) => `${identifierKey}-${suffix}`)
}

// Shows at most `limit` items so a long list doesn't flood the screen
export function summarizeList(items: string[], limit = 10): string {
  if (items.length <= limit) return items.join(', ')
  return `${items.slice(0, limit).join(', ')} … and ${items.length - limit} more`
}

// "OG-01 to OG-19" for a range, or the list of numbers for specific ones
export function describeContainers(mode: SuffixMode, containerNumbers: string[]): string {
  if (mode === 'range' && containerNumbers.length > 1) {
    return `${containerNumbers[0]} to ${containerNumbers[containerNumbers.length - 1]}`
  }
  return summarizeList(containerNumbers)
}
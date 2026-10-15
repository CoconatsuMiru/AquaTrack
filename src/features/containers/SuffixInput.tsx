import type { RefObject } from 'react'
import type { SuffixInputState, SuffixMode } from './containerNumbers'

type SuffixInputProps = {
  // Makes the field ids unique when several of these are on screen at once
  idPrefix: string
  // The type's key, shown in front of the fields (e.g. "DD-")
  identifierKey: string
  value: SuffixInputState
  onChange: (value: SuffixInputState) => void
  // Lets the parent move the cursor into the first field
  inputRef?: RefObject<HTMLInputElement | null>
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200'

const prefixClass = 'rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm font-semibold text-slate-700'

const modes: { value: SuffixMode; label: string }[] = [
  { value: 'range', label: 'Range' },
  { value: 'list', label: 'Specific list' },
]

// Letters and digits only, always uppercase
function cleanCode(text: string) {
  return text.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

// Same, but commas, semicolons and spaces are allowed between codes
function cleanList(text: string) {
  return text.toUpperCase().replace(/[^A-Z0-9,;\s]/g, '')
}

export function SuffixInput({ idPrefix, identifierKey, value, onChange, inputRef }: SuffixInputProps) {
  const prefix = `${identifierKey}-`

  function update(changes: Partial<SuffixInputState>) {
    onChange({ ...value, ...changes })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        {modes.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => update({ mode: mode.value })}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              value.mode === mode.value
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {value.mode === 'range' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor={`${idPrefix}-min`}
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Min
              </label>
              <div className="flex items-center gap-2">
                <span className={prefixClass}>{prefix}</span>
                <input
                  id={`${idPrefix}-min`}
                  ref={inputRef}
                  type="text"
                  value={value.minText}
                  onChange={(event) => update({ minText: cleanCode(event.target.value) })}
                  placeholder="01"
                  maxLength={6}
                  autoComplete="off"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor={`${idPrefix}-max`}
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Max
              </label>
              <div className="flex items-center gap-2">
                <span className={prefixClass}>{prefix}</span>
                <input
                  id={`${idPrefix}-max`}
                  type="text"
                  value={value.maxText}
                  onChange={(event) => update({ maxText: cleanCode(event.target.value) })}
                  placeholder="99"
                  maxLength={6}
                  autoComplete="off"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Every code from the min to the max is used, for example 01 and 19, or AA and AZ. Leave
            the max empty for a single container.
          </p>
        </div>
      )}

      {value.mode === 'list' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={prefixClass}>{prefix}</span>
            <input
              id={`${idPrefix}-list`}
              ref={inputRef}
              type="text"
              value={value.listText}
              onChange={(event) => update({ listText: cleanList(event.target.value) })}
              placeholder="01, 02, 09, 20"
              aria-label="Container codes separated by commas"
              autoComplete="off"
              className={`${inputClass} font-mono`}
            />
          </div>
          <p className="text-xs text-slate-500">
            Separate the codes with commas, for example 01, 02, 09, 20 or TR, AA, KL.
          </p>
        </div>
      )}
    </div>
  )
}
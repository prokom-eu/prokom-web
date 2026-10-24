'use client'

import { type ReactNode, useId, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'

export type PickerOption = {
  trait: string
  traitText?: string | null
  icon: IconName
  program: string
  caption?: string | null
}

type Props = {
  options: PickerOption[]
  /** Result panels rendered on the server, one per option. */
  results: ReactNode[]
  initial: number
}

/**
 * Tiles of company traits as one radio group (arrows move, a real form control); the chosen
 * program's panel below and the line of all programs with the chosen one marked.
 */
export function ProgramPicker({ options, results, initial }: Props) {
  const id = useId()
  const [chosen, setChosen] = useState(initial)
  // Live preview may remove tiles: never point past the list.
  const active = Math.min(chosen, options.length - 1)

  return (
    <div className="flex flex-col gap-4">
      <fieldset>
        <legend className="sr-only">Co pasuje do Twojej firmy?</legend>
        <div className="grid gap-3 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4">
          {options.map((option, i) => (
            <label
              key={`${option.trait}-${i}`}
              className={cx(
                'relative flex cursor-pointer flex-col gap-2 rounded-[22px] bg-card p-5 transition-shadow has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-accent-text',
                i === active
                  ? 'shadow-[0_20px_40px_-26px_var(--accent-text),inset_0_0_0_2px_var(--accent-text)]'
                  : 'shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]',
              )}
            >
              <input
                type="radio"
                name={`${id}-program`}
                checked={i === active}
                onChange={() => setChosen(i)}
                // Over the whole tile: clicks and focus land on the real control.
                className="absolute inset-0 size-full cursor-pointer appearance-none rounded-[22px] opacity-0"
              />
              <span
                aria-hidden="true"
                className={cx(
                  'mb-2 flex size-11 items-center justify-center rounded-xl',
                  i === active ? 'bg-accent-text text-accent-ink' : 'bg-surface-2 text-accent-text',
                )}
              >
                <Icon name={option.icon} className="size-5" />
              </span>
              <span className="font-display text-lg leading-tight font-extrabold text-ink">
                {option.trait}
              </span>
              {option.traitText && (
                <span className="text-[15px] leading-snug text-ink-2">{option.traitText}</span>
              )}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Only the program's name is announced; the whole panel would read too much. */}
      <p aria-live="polite" className="sr-only">
        {options[active] ? `Polecamy: ${options[active].program}` : ''}
      </p>
      <div data-testid="program-result">
        {results.map((result, i) => (
          <div key={i} hidden={i !== active}>
            {result}
          </div>
        ))}
      </div>

      <ul className="grid gap-px overflow-hidden min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4">
        {options.map((option, i) => (
          <li
            key={`${option.program}-${i}`}
            aria-current={i === active ? 'true' : undefined}
            className={cx(
              'border-t-[3px] px-4 py-4',
              i === active ? 'border-accent-text bg-surface-2' : 'border-transparent',
            )}
          >
            <span className="block font-bold text-ink">{option.program}</span>
            {option.caption && (
              <span className="block text-[13.5px] text-ink-2">{option.caption}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

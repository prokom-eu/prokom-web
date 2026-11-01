'use client'

import { cx } from '@/components/ui/cx'
import { plural } from '@/lib/plural'

import { useProductConfig } from './ProductConfig'

/**
 * „Kolor: Lawendowy · 5 kolorów” with a dot per colour (K32 §9): a click shows its picture in the
 * gallery and puts the colour in the inquiry note. Nothing for a card without colours.
 */
export function ColorPicker({ colors }: { colors: { name: string; hex: string }[] }) {
  const { color, setColor } = useProductConfig()
  if (colors.length === 0) return null
  const chosen = color === null ? null : colors[color]
  return (
    <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[18px] bg-surface-2 px-4 py-3">
      <legend className="sr-only">Kolor</legend>
      <p className="text-sm text-ink-2">
        Kolor:{' '}
        <b aria-live="polite" className="font-extrabold text-ink">
          {chosen ? chosen.name : 'wybierz'}
        </b>
        <span className="block text-xs font-bold text-ink-2">
          {colors.length} {plural(colors.length, ['kolor', 'kolory', 'kolorów'])}
        </span>
      </p>
      <div className="flex flex-wrap gap-1">
        {colors.map((item, position) => {
          const on = color === position
          return (
            <button
              key={`${position}-${item.name}`}
              type="button"
              aria-pressed={on}
              aria-label={item.name}
              title={item.name}
              onClick={() => setColor(on ? null : position)}
              className="flex size-11 items-center justify-center rounded-full"
            >
              <span
                aria-hidden="true"
                // The swatch is data of the product (`Products.colors.hex`), like a group gradient.
                style={{ backgroundColor: item.hex }}
                className={cx(
                  'size-7 rounded-full shadow-[inset_0_0_0_1px_var(--border-input)]',
                  on && 'outline-2 outline-offset-2 outline-accent-text',
                )}
              />
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

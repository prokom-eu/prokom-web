'use client'

import { cx } from '@/components/ui/cx'

type Option<V extends string> = { value: V; label: string }

/**
 * Segmented switch of Software v24 (like „Wygląd strony”, `ThemeSegment`): a labelled group of
 * buttons with `aria-pressed`, one pill sliding under the chosen one. Controlled by the parent.
 */
export function Segment<V extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string
  options: readonly Option<V>[]
  value: V
  onChange: (value: V) => void
  className?: string
}) {
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  return (
    <div
      role="group"
      aria-label={label}
      className={cx('sw-segment', className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="sw-segment-pill"
        style={{ width: `calc((100% - 8px) / ${options.length})`, translate: `${index * 100}% 0` }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

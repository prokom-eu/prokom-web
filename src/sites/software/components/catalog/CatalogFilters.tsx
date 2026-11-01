'use client'

import { useRef } from 'react'

import { SlidingPill } from '@/components/motion/SlidingPill'
import { cx } from '@/components/ui/cx'
import type { CatalogFacets, SoftwareCatalogState } from '@/lib/software/catalog'
import type { SolutionsIndex } from '@/lib/software/solutionsIndex'

type Props = {
  index: Pick<SolutionsIndex, 'situations' | 'industryGroups'>
  state: SoftwareCatalogState
  facets: CatalogFacets
  onChange: (patch: Partial<SoftwareCatalogState>) => void
  /** `list`: the desktop sidebar (`Katalog`); `chips`: the phone sheet (`stany/88b`). */
  variant: 'list' | 'chips'
}

type Option = { value: string | null; name: string; count: number }

/**
 * Situation, industry and „Tylko z podglądem na żywo” of the catalog (spec. §5) with counts —
 * each counted with the other filters on. One value per group: buttons with `aria-pressed` in a
 * labelled group; an option with no solution is dimmed but stays (it may fill with other
 * filters).
 */
export function CatalogFilters({ index, state, facets, onChange, variant }: Props) {
  const situations: Option[] = [
    { value: null, name: 'Wszystko', count: facets.situation.all ?? 0 },
    ...index.situations.map(({ slug, name }) => ({
      value: slug,
      name,
      count: facets.situation[slug] ?? 0,
    })),
  ]
  const groups: Option[] = [
    { value: null, name: 'Wszystkie', count: facets.group.all ?? 0 },
    ...index.industryGroups.map(({ slug, name }) => ({
      value: slug,
      name,
      count: facets.group[slug] ?? 0,
    })),
  ]
  return (
    <div className={variant === 'list' ? 'space-y-3' : 'space-y-6'}>
      <FilterGroup
        title="Od czego zaczynasz?"
        options={situations}
        current={state.situation}
        onPick={(value) => onChange({ situation: value as SoftwareCatalogState['situation'] })}
        variant={variant}
      />
      <FilterGroup
        title="Twoja branża"
        options={groups}
        current={state.group}
        onPick={(value) => onChange({ group: value as SoftwareCatalogState['group'] })}
        variant={variant}
      />
      <div
        className={cx(
          'rounded-[20px] border border-border bg-card',
          variant === 'list' ? 'p-3' : 'p-4',
        )}
      >
        <button
          type="button"
          role="switch"
          aria-checked={state.preview}
          onClick={() => onChange({ preview: !state.preview })}
          className="flex min-h-11 w-full items-center gap-3 text-left text-[15px] font-semibold"
        >
          <span
            aria-hidden="true"
            className="inline-flex size-7 items-center justify-center rounded-lg bg-surface-2"
          >
            <span className="size-2 rounded-full bg-ok" />
          </span>
          <span className="flex-1">
            Tylko z podglądem na żywo
            <span className="sr-only"> ({facets.preview})</span>
          </span>
          <span
            aria-hidden="true"
            className={cx(
              'relative h-7 w-12 shrink-0 rounded-full transition-colors',
              state.preview ? 'bg-button' : 'bg-chip',
            )}
          >
            <span
              className={cx(
                'absolute top-1 size-5 rounded-full transition-[left]',
                state.preview ? 'left-6 bg-accent-ink' : 'left-1 bg-ink',
              )}
            />
          </span>
        </button>
      </div>
    </div>
  )
}

function FilterGroup({
  title,
  options,
  current,
  onPick,
  variant,
}: {
  title: string
  options: Option[]
  current: string | null
  onPick: (value: string | null) => void
  variant: Props['variant']
}) {
  const box = useRef<HTMLDivElement>(null)
  const list = variant === 'list'
  return (
    <div
      role="group"
      aria-label={title}
      className={list ? 'rounded-[20px] border border-border bg-card p-3' : undefined}
    >
      <p
        aria-hidden="true"
        className={cx(
          'font-extrabold uppercase tracking-[0.14em] text-ink-2',
          list ? 'px-2 pb-2 text-xs' : 'pb-3 text-sm',
        )}
      >
        {title}
      </p>
      <div
        ref={box}
        className={cx('group/pills relative', list ? 'space-y-1' : 'flex flex-wrap gap-2.5')}
      >
        <SlidingPill
          container={box}
          active={current}
          className="bg-accent-soft"
          radius={list ? 12 : 16}
        />
        {options.map((option) => {
          const active = option.value === current
          return (
            <button
              key={option.value ?? 'all'}
              type="button"
              aria-pressed={active}
              onClick={() => onPick(option.value)}
              className={cx(
                'relative z-[1] items-center font-bold',
                list
                  ? 'flex min-h-11 w-full justify-between gap-3 rounded-xl px-3 py-2 text-left text-[15px]'
                  : 'inline-flex min-h-12 gap-2.5 rounded-2xl border px-4 text-base',
                active
                  ? 'border border-accent-text bg-accent-soft text-ink group-has-[[data-sliding-pill]]/pills:bg-transparent'
                  : list
                    ? 'border border-transparent hover:bg-surface-2'
                    : 'border-border bg-card',
                option.count === 0 && !active && 'text-ink-3',
              )}
            >
              <span>{option.name}</span>
              <span className={cx('text-sm', active ? 'text-accent-text' : 'text-ink-2')}>
                {option.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

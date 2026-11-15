'use client'

import { useState } from 'react'

import { cx } from '@/components/ui/cx'
import { projectActions, useProject } from '@/lib/software/projectStore'

type Props = {
  id: string
  name: string
  className?: string
}

/**
 * „Chcę takie u siebie” of a solution page (board `Rozwiazanie`): adds the solution to „Twój
 * projekt” (the toast and the pill follow), a second click takes it out. The full list (30)
 * says so here, since no toast comes then.
 */
export function AddToProject({ id, name, className }: Props) {
  const added = useProject().some((entry) => entry.id === id)
  const [full, setFull] = useState(false)
  return (
    <span className={cx('inline-flex flex-col', className)}>
      <button
        type="button"
        aria-pressed={added}
        onClick={() => setFull(!projectActions.toggle(id, name))}
        data-motion={added ? 'button-outline' : 'button'}
        className={cx(
          'inline-flex min-h-14 w-full items-center justify-center rounded-full px-6 text-base font-extrabold min-[641px]:w-auto',
          added
            ? 'border border-accent-line bg-card text-accent-text'
            : 'bg-button text-accent-ink',
        )}
      >
        {added ? '✓ W Twoim projekcie' : 'Chcę takie u siebie'}
      </button>
      {full && (
        <span role="status" className="mt-2 text-sm text-ink-2">
          Lista jest pełna — wyślij ją albo usuń coś z projektu.
        </span>
      )}
    </span>
  )
}

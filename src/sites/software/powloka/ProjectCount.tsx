'use client'

import { useEffect, useState } from 'react'

import { plural } from '@/lib/plural'
import { onProjectAdded, useProject } from '@/lib/software/projectStore'

/**
 * Live count of „Twój projekt” for the shared frame (capsule CTA, rail action): shown only while
 * the list has items (ZMIANY-v24 §3.2); each addition bounces it once (`data-bump`).
 */
export function ProjectCount({ className }: { className: string }) {
  const count = useProject().length
  const [bumps, setBumps] = useState(0)
  useEffect(() => onProjectAdded(() => setBumps((n) => n + 1)), [])
  if (count === 0) return null
  return (
    <em key={bumps} data-bump={bumps > 0 ? '' : undefined} className={className}>
      {count}
      <span className="sr-only">
        {' '}
        {plural(count, ['pozycja', 'pozycje', 'pozycji'])} w projekcie
      </span>
    </em>
  )
}

/** The plain number for slots that take a count (`SiteRail` action). */
export function useProjectCount(): number {
  return useProject().length
}

'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const ProcessExplorer = dynamic(() =>
  import('./ProcessExplorer').then((m) => m.ProcessExplorer),
)
export const WeekTrack = dynamic(() => import('./ProcessExplorer').then((m) => m.WeekTrack))

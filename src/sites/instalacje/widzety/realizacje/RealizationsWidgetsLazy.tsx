'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const RealizationFilters = dynamic(() =>
  import('./RealizationsWidgets').then((m) => m.RealizationFilters),
)
export const RealizationGrid = dynamic(() =>
  import('./RealizationsWidgets').then((m) => m.RealizationGrid),
)

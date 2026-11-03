'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). No `loading`:
// with it next/dynamic adds a Suspense boundary and the page below streams in hidden segments,
// revealed by a script later (sections missing without JS and right after load).
export const RealizationFilters = dynamic(() =>
  import('./RealizationsWidgets').then((m) => m.RealizationFilters),
)
export const RealizationGrid = dynamic(() =>
  import('./RealizationsWidgets').then((m) => m.RealizationGrid),
)

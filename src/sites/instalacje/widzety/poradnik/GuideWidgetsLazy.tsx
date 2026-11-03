'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const GuideCategories = dynamic(() =>
  import('./GuideWidgets').then((m) => m.GuideCategories),
)
export const GuideGrid = dynamic(() => import('./GuideWidgets').then((m) => m.GuideGrid))

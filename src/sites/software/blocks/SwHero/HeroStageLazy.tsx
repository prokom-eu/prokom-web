'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). No `loading`:
// with it next/dynamic adds a Suspense boundary and the page below streams in hidden segments.
export const HeroStage = dynamic(() => import('./HeroStage').then((m) => m.HeroStage))

'use client'

import dynamic from 'next/dynamic'

// ADR-023: the home page's client parts are own chunks, loaded only on the hub's start page —
// never in the shared `[domain]` route entry of the other lines (SSR stays on). No `loading`:
// with it next/dynamic adds a Suspense boundary and the sections stream in hidden.
export const HeroTiles = dynamic(() => import('./HeroTiles').then((m) => m.HeroTiles))
export const LineScene = dynamic(() => import('./LineScene').then((m) => m.LineScene))

'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). `loading` gives
// each widget its own Suspense boundary: the rest of the page hydrates without waiting for it,
// and the server HTML stays until the widget's code arrives.
export const GoposAreas = dynamic(() => import('./Widgets').then((m) => m.GoposAreas), {
  loading: () => null,
})
export const GoposHub = dynamic(() => import('./Widgets').then((m) => m.GoposHub), {
  loading: () => null,
})
export const GoposPackage = dynamic(() => import('./Widgets').then((m) => m.GoposPackage), {
  loading: () => null,
})
export const GoposVenues = dynamic(() => import('./Widgets').then((m) => m.GoposVenues), {
  loading: () => null,
})

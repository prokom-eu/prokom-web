'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). No `loading`:
// with it next/dynamic adds a Suspense boundary and the page below streams in hidden segments,
// revealed by a script later (sections missing without JS and right after load).
export const GoposAreas = dynamic(() => import('./Widgets').then((m) => m.GoposAreas))
export const GoposHub = dynamic(() => import('./Widgets').then((m) => m.GoposHub))
export const GoposPackage = dynamic(() => import('./Widgets').then((m) => m.GoposPackage))
export const GoposVenues = dynamic(() => import('./Widgets').then((m) => m.GoposVenues))

'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const GoposAreas = dynamic(() => import('./Widgets').then((m) => m.GoposAreas))
export const GoposHub = dynamic(() => import('./Widgets').then((m) => m.GoposHub))
export const GoposPackage = dynamic(() => import('./Widgets').then((m) => m.GoposPackage))
export const GoposVenues = dynamic(() => import('./Widgets').then((m) => m.GoposVenues))

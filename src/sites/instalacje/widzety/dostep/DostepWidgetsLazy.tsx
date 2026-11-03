'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). `loading` gives
// each widget its own Suspense boundary: the rest of the page hydrates without waiting for it,
// and the server HTML stays until the widget's code arrives.
const LAZY = { loading: () => null }
export const IdTypes = dynamic(() => import('./DostepWidgets').then((m) => m.IdTypes), LAZY)
export const LockDemo = dynamic(() => import('./DostepWidgets').then((m) => m.LockDemo), LAZY)
export const LocksPower = dynamic(() => import('./DostepWidgets').then((m) => m.LocksPower), LAZY)

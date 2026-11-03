'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const IdTypes = dynamic(() => import('./DostepWidgets').then((m) => m.IdTypes))
export const LockDemo = dynamic(() => import('./DostepWidgets').then((m) => m.LockDemo))
export const LocksPower = dynamic(() => import('./DostepWidgets').then((m) => m.LocksPower))

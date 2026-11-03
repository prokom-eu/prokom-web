'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const GoposFlow = dynamic(() => import('./Stage').then((m) => m.GoposFlow))
export const GoposStage = dynamic(() => import('./Stage').then((m) => m.GoposStage))

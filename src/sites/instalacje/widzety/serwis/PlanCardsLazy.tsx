'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on `/serwis` (SSR stays on, no `loading`).
export const PlanCards = dynamic(() => import('./PlanCards').then((m) => m.PlanCards))

'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const InsertPicker = dynamic(() => import('./Widgets').then((m) => m.InsertPicker))
export const InsertPoints = dynamic(() => import('./Widgets').then((m) => m.InsertPoints))

'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const TabsPicker = dynamic(() => import('./Interactive').then((m) => m.TabsPicker))
export const VideoPicker = dynamic(() => import('./Interactive').then((m) => m.VideoPicker))
